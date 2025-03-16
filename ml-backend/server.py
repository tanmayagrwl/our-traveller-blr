from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
from typing import List, Dict, Any
import os
import argparse
import logging
import asyncio
import aiohttp
import math
import time
import traceback
from concurrent.futures import ThreadPoolExecutor

# Import functions from the provided script
from namma_yatri_recommender import (
    get_recommended_locations,
    load_model,
)

# Set up logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Global model data
model_data = None
# Thread pool for running async code
thread_pool = ThreadPoolExecutor(max_workers=10)
# Session for async HTTP requests
async_session = None


def start_async_session():
    """Initialize the async HTTP session"""
    global async_session
    if async_session is None:
        async_session = aiohttp.ClientSession()


async def close_async_session():
    """Close the async HTTP session"""
    global async_session
    if async_session:
        await async_session.close()
        async_session = None


@app.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint to verify server is running"""
    return jsonify({"status": "healthy", "model_loaded": model_data is not None})


async def async_locations_to_coordinates(location_strings: List[str]) -> List[Dict[str, Any]]:
    """
    Asynchronous version - Converts location strings to include latitude and longitude.
    """
    api_key = os.environ.get("GOOGLE_MAPS_API_KEY")
    result = []
    
    async def geocode_location(location_str):
        try:
            # Call Google Maps Geocoding API
            geocode_url = f"https://maps.googleapis.com/maps/api/geocode/json?address={location_str}&key={api_key}"
            async with async_session.get(geocode_url) as response:
                geocode_data = await response.json()
                
                if geocode_data.get("status") == "OK" and geocode_data.get("results"):
                    # Get coordinates
                    location = geocode_data["results"][0]["geometry"]["location"]
                    # Create a new object with location data plus coordinates
                    new_obj = {"location": location_str}
                    new_obj["lat"] = location["lat"]
                    new_obj["lng"] = location["lng"]
                    new_obj["formatted_address"] = geocode_data["results"][0].get("formatted_address", location_str)
                    return new_obj
                else:
                    # If geocoding failed, return basic object
                    logger.warning(f"Failed to geocode location '{location_str}': {geocode_data.get('status')}")
                    return {"location": location_str}
        except Exception as e:
            logger.error(f"Error geocoding location '{location_str}': {str(e)}")
            return {"location": location_str}
    
    # Create a list of tasks for parallel execution
    tasks = [geocode_location(location) for location in location_strings]
    
    # Wait for all tasks to complete and gather results
    result = await asyncio.gather(*tasks)
    return result


async def async_coordinates_to_locations(
    coordinate_objects: List[Dict[str, Any]],
    lat_key: str = "lat",
    lng_key: str = "lng",
) -> List[Dict[str, Any]]:
    """
    Asynchronous version - Converts coordinates to include location names.
    """
    api_key = os.environ.get("GOOGLE_MAPS_API_KEY")
    
    async def reverse_geocode(obj):
        if lat_key not in obj or lng_key not in obj:
            # Skip objects without coordinates
            logger.warning(f"Skipping object missing coordinates (keys '{lat_key}' or '{lng_key}'): {obj}")
            return obj
            
        lat = obj[lat_key]
        lng = obj[lng_key]

        try:
            # Call Google Maps Reverse Geocoding API
            geocode_url = f"https://maps.googleapis.com/maps/api/geocode/json?latlng={lat},{lng}&key={api_key}"
            async with async_session.get(geocode_url) as response:
                geocode_data = await response.json()

                if geocode_data.get("status") == "OK" and geocode_data.get("results"):
                    # Create a new object with all original data
                    new_obj = obj.copy()

                    # Add full formatted address
                    new_obj["formatted_address"] = geocode_data["results"][0].get("formatted_address", "")

                    # Extract address components for more granular location information
                    components = {}
                    if geocode_data["results"][0].get("address_components"):
                        for component in geocode_data["results"][0]["address_components"]:
                            for component_type in component["types"]:
                                components[component_type] = component["long_name"]

                    # Add useful location components if available
                    if "route" in components:
                        new_obj["street"] = components["route"]
                    if "locality" in components:
                        new_obj["city"] = components["locality"]
                    if "administrative_area_level_1" in components:
                        new_obj["state"] = components["administrative_area_level_1"]
                    if "postal_code" in components:
                        new_obj["postal_code"] = components["postal_code"]
                    if "country" in components:
                        new_obj["country"] = components["country"]

                    # Create a readable location name based on available components
                    location_parts = []

                    if "point_of_interest" in components:
                        location_parts.append(components["point_of_interest"])
                    elif "establishment" in components:
                        location_parts.append(components["establishment"])
                    elif "route" in components:
                        if "street_number" in components:
                            location_parts.append(f"{components['street_number']} {components['route']}")
                        else:
                            location_parts.append(components["route"])

                    if "sublocality" in components and "sublocality_level_1" not in components:
                        location_parts.append(components["sublocality"])
                    elif "sublocality_level_1" in components:
                        location_parts.append(components["sublocality_level_1"])

                    if "locality" in components and not location_parts:
                        # Only add city if no more specific location was found
                        location_parts.append(components["locality"])

                    # Join the parts to create a readable location name
                    if location_parts:
                        new_obj["location"] = ", ".join(location_parts)
                    else:
                        # Fallback to formatted address if no components were found
                        new_obj["location"] = new_obj["formatted_address"]

                    return new_obj
                else:
                    # If reverse geocoding failed, keep original object but log warning
                    logger.warning(f"Failed to reverse geocode coordinates ({lat}, {lng}): {geocode_data.get('status')}")
                    return obj
        except Exception as e:
            logger.error(f"Error reverse geocoding coordinates ({lat}, {lng}): {str(e)}")
            return obj
    
    # Create tasks for parallel execution
    tasks = [reverse_geocode(obj) for obj in coordinate_objects]
    
    # Execute all tasks concurrently and gather results
    result = await asyncio.gather(*tasks)
    return result


# Synchronous wrapper functions for the async functions
def locations_to_coordinates(location_strings: List[str]) -> List[Dict[str, Any]]:
    """Synchronous wrapper for async_locations_to_coordinates"""
    loop = asyncio.new_event_loop()
    result = loop.run_until_complete(async_locations_to_coordinates(location_strings))
    return result


def coordinates_to_locations(
    coordinate_objects: List[Dict[str, Any]],
    lat_key: str = "lat",
    lng_key: str = "lng",
) -> List[Dict[str, Any]]:
    """Synchronous wrapper for async_coordinates_to_locations"""
    loop = asyncio.new_event_loop()
    result = loop.run_until_complete(async_coordinates_to_locations(coordinate_objects, lat_key, lng_key))
    return result


async def async_get_traffic_hotspots_google(sample_points: int = 60) -> List[Dict[str, Any]]:
    """
    Asynchronous version - Gets traffic data using Google Maps Roads API with traffic model.
    """
    api_key = os.environ.get("GOOGLE_MAPS_API_KEY")
    city = "Bangalore"
    
    try:
        # Get city center coordinates
        geocode_url = f"https://maps.googleapis.com/maps/api/geocode/json?address={city}&key={api_key}"
        async with async_session.get(geocode_url) as response:
            geocode_data = await response.json()

            if geocode_data.get("status") != "OK" or not geocode_data.get("results"):
                logger.error(f"Failed to geocode city: {city}")
                return []

            # Get city center coordinates
            location = geocode_data["results"][0]["geometry"]["location"]
            city_lat = location["lat"]
            city_lng = location["lng"]

            # Create a grid of points around the city center
            grid_size = int(sample_points**0.5)  # square root to make a roughly square grid
            lat_span = 0.1  # approximately 11km
            lng_span = 0.1

            points = []
            for i in range(grid_size):
                for j in range(grid_size):
                    lat = city_lat + (i - grid_size / 2) * lat_span / grid_size
                    lng = city_lng + (j - grid_size / 2) * lng_span / grid_size
                    points.append(f"{lat},{lng}")

            # Split points into batches (API limit is 100)
            all_traffic_points = []
            batch_size = 100
            
            async def process_batch(batch_points):
                batch_results = []
                paths = "|".join(batch_points)
                roads_url = f"https://roads.googleapis.com/v1/snapToRoads?path={paths}&interpolate=true&key={api_key}"
                
                async with async_session.get(roads_url) as response:
                    roads_data = await response.json()
                    
                    if "snappedPoints" not in roads_data:
                        return []
                    
                    # Create tasks for parallel processing of each point
                    point_tasks = []
                    for point in roads_data["snappedPoints"]:
                        lat = point["location"]["latitude"]
                        lng = point["location"]["longitude"]
                        place_id = point.get("placeId")
                        
                        # Create a task to get traffic data for this point
                        point_tasks.append(get_point_traffic(lat, lng, place_id, api_key))
                    
                    # Execute all point tasks in parallel
                    point_results = await asyncio.gather(*point_tasks)
                    
                    # Filter out None results and add valid ones to batch results
                    batch_results.extend([r for r in point_results if r is not None])
                    
                return batch_results
            
            async def get_point_traffic(lat, lng, place_id, api_key):
                # Use the Distance Matrix API to get traffic info
                traffic_url = (
                    f"https://maps.googleapis.com/maps/api/distancematrix/json?"
                    f"origins={lat},{lng}&destinations={lat+0.001},{lng+0.001}"
                    f"&departure_time=now&traffic_model=best_guess&key={api_key}"
                )
                
                async with async_session.get(traffic_url) as response:
                    traffic_data = await response.json()
                    
                    if (
                        traffic_data.get("status") == "OK"
                        and traffic_data.get("rows")
                        and traffic_data["rows"][0].get("elements")
                    ):
                        element = traffic_data["rows"][0]["elements"][0]
                        
                        if element.get("status") == "OK":
                            # Calculate congestion by comparing duration in traffic vs. duration without traffic
                            duration = element.get("duration", {}).get("value", 0)
                            duration_in_traffic = element.get("duration_in_traffic", {}).get("value", 0)
                            
                            if duration > 0 and duration_in_traffic > 0:
                                congestion_factor = duration_in_traffic / duration
                                
                                # Only add points with significant congestion
                                if congestion_factor > 1.3:  # 30% longer with traffic
                                    return {
                                        "lat": lat,
                                        "lng": lng,
                                        "place_id": place_id,
                                        "congestion_factor": congestion_factor,
                                        "congestion_percent": round((congestion_factor - 1) * 100),
                                        "name": f"Traffic Hotspot ({round((congestion_factor - 1) * 100)}% delay)",
                                    }
                return None
            
            # Create batch processing tasks
            batch_tasks = []
            for i in range(0, len(points), batch_size):
                batch_points = points[i : i + batch_size]
                batch_tasks.append(process_batch(batch_points))
            
            # Execute batches with some concurrency control (5 batches at a time)
            for i in range(0, len(batch_tasks), 5):
                batch_group = batch_tasks[i:i+5]
                batch_results = await asyncio.gather(*batch_group)
                for results in batch_results:
                    all_traffic_points.extend(results)
            
            # Add location information to traffic points
            all_traffic_points = await async_coordinates_to_locations(all_traffic_points)
            
            # Sort by congestion factor and return
            return sorted(
                all_traffic_points,
                key=lambda x: x.get("congestion_factor", 0),
                reverse=True,
            )

    except Exception as e:
        logger.error(f"Error fetching traffic data: {e}")
        return []


def run_in_thread(func, *args, **kwargs):
    """Run an async function in a separate thread"""
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    
    async def _run_with_session():
        """Create session, run function, and close session"""
        global async_session
        if async_session is None:
            async_session = aiohttp.ClientSession()
        try:
            return await func(*args, **kwargs)
        finally:
            if async_session is not None:
                await async_session.close()
                async_session = None
    
    try:
        return loop.run_until_complete(_run_with_session())
    finally:
        loop.close()


@app.route("/api/traffic-hotspots", methods=["GET"])
def get_traffic_hotspots_api():
    """API endpoint to get traffic hotspots"""
    try:
        sample_points = int(request.args.get("sample_points", 60))
        # Run the async function in a thread
        future = thread_pool.submit(run_in_thread, async_get_traffic_hotspots_google, sample_points)
        return jsonify(future.result())
    except Exception as e:
        logger.error(f"Error getting traffic hotspots: {str(e)}", exc_info=True)
        return jsonify({"status": "error", "message": f"Error: {str(e)}"}), 500


@app.route("/api/get-recommendations", methods=["GET"])
def api_get_recommendations():
    """API endpoint to get location recommendations based on time"""
    try:
        # Check if model is loaded
        global model_data
        if not model_data:
            return (
                jsonify(
                    {
                        "status": "error",
                        "message": "Model not loaded. Please load or train a model first.",
                    }
                ),
                400,
            )

        # Get time parameter
        time_input = request.args.get("time", None)
        top_n = int(request.args.get("top_n", 5))

        # Get recommendations
        recommendations = get_recommended_locations(
            time_input,
            model_data["top_locations_by_hour"],
            model_data["time_block_locations"],
            model_data["duration_map"],
            top_n,
        )
        
        # Create a single function to run all async operations
        async def run_all_async_operations():
            # Run all operations in parallel and wait for all to complete
            hourly_task = async_locations_to_coordinates(recommendations["hourly_recommendations"])
            block_task = async_locations_to_coordinates(recommendations["block_recommendations"])
            top_task = async_locations_to_coordinates([recommendations["top_recommendation"]])
            traffic_task = async_get_traffic_hotspots_google()
            
            # Wait for all tasks to complete
            hourly_result, block_result, top_result, traffic_result = await asyncio.gather(
                hourly_task, block_task, top_task, traffic_task
            )
            
            return hourly_result, block_result, top_result, traffic_result
        
        # Run all operations in a thread to avoid blocking
        future = thread_pool.submit(run_in_thread, run_all_async_operations)
        hourly_with_coords, block_with_coords, top_with_coords, traffic_hotspots = future.result()
        
        # Format response
        response = {
            "status": "success",
            "time_input": time_input or datetime.now().strftime("%H:%M"),
            "hour": recommendations["hour"],
            "time_of_day": recommendations["time_of_day"],
            "time_block": recommendations["time_block"],
            "hourly_recommendations": hourly_with_coords,
            "block_recommendations": block_with_coords,
            "top_recommendation": top_with_coords,
            "live_traffic_hotspots": traffic_hotspots,
        }

        return jsonify(response)

    except Exception as e:
        logger.error(f"Error getting recommendations: {str(e)}", exc_info=True)
        return jsonify({"status": "error", "message": f"Error: {str(e)}"}), 500

async def async_find_parking_near_hotspots(
    hotspots: list,
    radius: int = 700,
    max_results: int = 3
) -> list:
    """
    Find parking locations near traffic hotspots.
    
    Args:
        hotspots: List of dict objects containing at least 'lat' and 'lng' keys
        radius: Search radius in meters around the hotspot (default: 300m)
        max_results: Maximum number of parking spots to return per hotspot (default: 3)
        
    Returns:
        List of potential parking locations with coordinates and metadata
    """
    api_key = os.environ.get("GOOGLE_MAPS_API_KEY")
    all_parking_locations = []
    
    async def find_parking_for_hotspot(hotspot):
        """Find parking near a specific hotspot"""
        try:
            # Get hotspot coordinates
            lat = hotspot["lat"]
            lng = hotspot["lng"]
            hotspot_name = hotspot.get("location", "Unknown location")
            
            # Search for parking lots, garages, or street parking near the hotspot
            nearby_url = (
                f"https://maps.googleapis.com/maps/api/place/nearbysearch/json?"
                f"location={lat},{lng}&radius={radius}"
                f"&type=parking&keyword=parking|garage|lot"
                f"&key={api_key}"
            )
            
            async with async_session.get(nearby_url) as response:
                nearby_data = await response.json()
                
                if nearby_data.get("status") != "OK":
                    logger.warning(f"Failed to find parking near {hotspot_name}: {nearby_data.get('status')}")
                    return []
                
                parking_spots = []
                
                # Process each parking result
                for place in nearby_data.get("results", [])[:max_results]:
                    # Calculate distance from hotspot to parking
                    place_lat = place["geometry"]["location"]["lat"]
                    place_lng = place["geometry"]["location"]["lng"]
                    
                    # Use Haversine formula to calculate ground distance
                    distance = calculate_distance(lat, lng, place_lat, place_lng)
                    
                    # Determine if this is at the edge of the hotspot (we want outside/edge locations)
                    # Edge is defined as 200-300m from center for this implementation
                    is_edge = 200 <= distance <= radius
                    
                    parking_spot = {
                        "lat": place_lat,
                        "lng": place_lng,
                        "name": place.get("name", "Parking Area"),
                        "vicinity": place.get("vicinity", ""),
                        "place_id": place.get("place_id", ""),
                        "rating": place.get("rating", 0),
                        "user_ratings_total": place.get("user_ratings_total", 0),
                        "distance_from_hotspot": round(distance),
                        "is_edge_location": is_edge,
                        "nearby_hotspot": {
                            "name": hotspot_name,
                            "lat": lat,
                            "lng": lng
                        }
                    }
                    
                    # Add additional data if available
                    if "opening_hours" in place:
                        parking_spot["open_now"] = place["opening_hours"].get("open_now", False)
                    
                    parking_spots.append(parking_spot)
                
                # If no parking spots found, try alternative approach with different search terms
                if not parking_spots:
                    alternative_url = (
                        f"https://maps.googleapis.com/maps/api/place/nearbysearch/json?"
                        f"location={lat},{lng}&radius={radius}"
                        f"&keyword=parking"
                        f"&key={api_key}"
                    )
                    
                    async with async_session.get(alternative_url) as alt_response:
                        alt_data = await alt_response.json()
                        
                        if alt_data.get("status") == "OK":
                            for place in alt_data.get("results", [])[:max_results]:
                                place_lat = place["geometry"]["location"]["lat"]
                                place_lng = place["geometry"]["location"]["lng"]
                                distance = calculate_distance(lat, lng, place_lat, place_lng)
                                is_edge = 200 <= distance <= radius
                                
                                parking_spot = {
                                    "lat": place_lat,
                                    "lng": place_lng,
                                    "name": place.get("name", "Parking Area"),
                                    "vicinity": place.get("vicinity", ""),
                                    "place_id": place.get("place_id", ""),
                                    "distance_from_hotspot": round(distance),
                                    "is_edge_location": is_edge,
                                    "nearby_hotspot": {
                                        "name": hotspot_name,
                                        "lat": lat,
                                        "lng": lng
                                    }
                                }
                                parking_spots.append(parking_spot)
                
                return parking_spots
                
        except Exception as e:
            logger.error(f"Error finding parking near {hotspot.get('location', 'unknown')}: {str(e)}")
            return []
    
    # Process all hotspots in parallel
    tasks = [find_parking_for_hotspot(hotspot) for hotspot in hotspots]
    results = await asyncio.gather(*tasks)
    
    # Flatten results and filter out duplicates based on place_id
    seen_place_ids = set()
    for hotspot_results in results:
        for spot in hotspot_results:
            place_id = spot.get("place_id")
            if place_id and place_id not in seen_place_ids:
                seen_place_ids.add(place_id)
                all_parking_locations.append(spot)
    
    # Sort by edge location and distance
    all_parking_locations.sort(key=lambda x: (not x.get("is_edge_location"), x.get("distance_from_hotspot", 1000)))
    
    return all_parking_locations


def calculate_distance(lat1, lon1, lat2, lon2):
    """
    Calculate the Haversine distance between two points in meters.
    """
    # Earth's radius in meters
    R = 6371000
    
    # Convert latitude and longitude from degrees to radians
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    lon1_rad = math.radians(lon1)
    lon2_rad = math.radians(lon2)
    
    # Differences in coordinates
    dlat = lat2_rad - lat1_rad
    dlon = lon2_rad - lon1_rad
    
    # Haversine formula
    a = math.sin(dlat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    distance = R * c
    
    return distance


async def async_find_alternative_parking_areas(
    lat: float,
    lng: float,
    radius: int = 500
) -> list:
    """
    Find alternative parking areas when no official parking is available.
    This looks for businesses or locations that typically have parking lots.
    
    Args:
        lat: Latitude of hotspot
        lng: Longitude of hotspot
        radius: Search radius in meters
        
    Returns:
        List of potential unofficial parking locations
    """
    api_key = os.environ.get("GOOGLE_MAPS_API_KEY")
    
    # Types of places that typically have parking lots
    place_types = [
        "shopping_mall", "supermarket", "grocery_or_supermarket", 
        "department_store", "store", "gas_station"
    ]
    
    all_places = []
    
    async def search_places(place_type):
        try:
            nearby_url = (
                f"https://maps.googleapis.com/maps/api/place/nearbysearch/json?"
                f"location={lat},{lng}&radius={radius}"
                f"&type={place_type}"
                f"&key={api_key}"
            )
            
            async with async_session.get(nearby_url) as response:
                nearby_data = await response.json()
                
                if nearby_data.get("status") != "OK":
                    return []
                
                places = []
                for place in nearby_data.get("results", []):
                    place_lat = place["geometry"]["location"]["lat"]
                    place_lng = place["geometry"]["location"]["lng"]
                    
                    # Calculate distance from hotspot
                    distance = calculate_distance(lat, lng, place_lat, place_lng)
                    
                    # We want places that are not too close but still within walking distance
                    if 200 <= distance <= radius:
                        places.append({
                            "lat": place_lat,
                            "lng": place_lng,
                            "name": place.get("name", "Unknown"),
                            "vicinity": place.get("vicinity", ""),
                            "place_id": place.get("place_id", ""),
                            "type": place_type,
                            "distance_from_hotspot": round(distance),
                            "likely_has_parking": True,
                            "is_unofficial": True
                        })
                
                return places
        
        except Exception as e:
            logger.error(f"Error searching for {place_type} near ({lat}, {lng}): {str(e)}")
            return []
    
    # Search for all place types in parallel
    tasks = [search_places(place_type) for place_type in place_types]
    results = await asyncio.gather(*tasks)
    
    # Flatten and filter results
    seen_place_ids = set()
    for type_results in results:
        for place in type_results:
            place_id = place.get("place_id")
            if place_id and place_id not in seen_place_ids:
                seen_place_ids.add(place_id)
                all_places.append(place)
    
    # Sort by distance
    all_places.sort(key=lambda x: x.get("distance_from_hotspot", 1000))
    
    return all_places


@app.route("/api/find-parking", methods=["GET"])
def find_parking_spots_api():
    """
    API endpoint to find parking spots near hotspots or specific locations.
    
    Query parameters:
    - lat: Latitude (optional)
    - lng: Longitude (optional)
    - location: Location name (optional, used if lat/lng not provided)
    - radius: Search radius in meters (default: 300)
    - max_results: Maximum number of parking spots to return per hotspot (default: 3)
    """
    try:
        # Get parameters
        lat = request.args.get("lat")
        lng = request.args.get("lng")
        location = request.args.get("location")
        radius = int(request.args.get("radius", 300))
        max_results = int(request.args.get("max_results", 3))
        
        # Initialize with empty list
        hotspots = []
        
        # Case 1: Use provided lat/lng
        if lat and lng:
            hotspots = [{
                "lat": float(lat),
                "lng": float(lng),
                "location": location or "Specified location"
            }]
        
        # Case 2: Use provided location name
        elif location:
            # Convert location to coordinates
            location_coords = run_in_thread(
                async_locations_to_coordinates, [location]
            )
            if location_coords and "lat" in location_coords[0] and "lng" in location_coords[0]:
                hotspots = location_coords
            else:
                return jsonify({
                    "status": "error",
                    "message": f"Could not geocode location: {location}"
                }), 400
        
        # Case 3: Use traffic hotspots
        else:
            # Get traffic hotspots
            traffic_hotspots = run_in_thread(async_get_traffic_hotspots_google)
            
            # Use top recommendations if no traffic hotspots
            if not traffic_hotspots:
                # Get recommendations using the default model
                if model_data:
                    recommendations = get_recommended_locations(
                        None,  # Use current time
                        model_data["top_locations_by_hour"],
                        model_data["time_block_locations"],
                        model_data["duration_map"],
                        5  # Get top 5
                    )
                    
                    # Convert locations to coordinates
                    hourly_with_coords = run_in_thread(
                        async_locations_to_coordinates, 
                        recommendations["hourly_recommendations"]
                    )
                    block_with_coords = run_in_thread(
                        async_locations_to_coordinates,
                        recommendations["block_recommendations"]
                    )
                    
                    # Combine all recommendations
                    hotspots = hourly_with_coords + block_with_coords
                else:
                    return jsonify({
                        "status": "error",
                        "message": "No hotspots available and model not loaded"
                    }), 400
            else:
                hotspots = traffic_hotspots
        
        # Find parking spots near all hotspots
        parking_spots = run_in_thread(
            async_find_parking_near_hotspots,
            hotspots,
            radius,
            max_results
        )
        
        # If not enough parking spots found, look for alternative places that might have parking
        if len(parking_spots) < 3 and hotspots:
            # For each hotspot, find alternative parking areas
            for hotspot in hotspots[:3]:  # Limit to top 3 hotspots to avoid too many API calls
                alternative_spots = run_in_thread(
                    async_find_alternative_parking_areas,
                    hotspot["lat"],
                    hotspot["lng"],
                    radius + 200  # Slightly larger radius for alternatives
                )
                
                # Add alternative spots to results
                for spot in alternative_spots:
                    # Add nearby hotspot information
                    spot["nearby_hotspot"] = {
                        "name": hotspot.get("location", "Unknown location"),
                        "lat": hotspot["lat"],
                        "lng": hotspot["lng"]
                    }
                    parking_spots.append(spot)
        
        # Add walking directions for each parking spot
        enhanced_spots = run_in_thread(
            async_add_walking_directions,
            parking_spots
        )
        
        # Return results
        return jsonify({
            "status": "success",
            "parking_spots": enhanced_spots,
            "hotspots": hotspots
        })
    
    except Exception as e:
        logger.error(f"Error finding parking spots: {str(e)}", exc_info=True)
        return jsonify({
            "status": "error",
            "message": f"Error: {str(e)}"
        }), 500


async def async_add_walking_directions(parking_spots: list) -> list:
    """
    Add walking directions from parking spots to their corresponding hotspots.
    
    Args:
        parking_spots: List of parking spot objects with nearby_hotspot information
        
    Returns:
        Enhanced list of parking spots with walking directions
    """
    api_key = os.environ.get("GOOGLE_MAPS_API_KEY")
    enhanced_spots = []
    
    async def add_directions(spot):
        try:
            # Skip if no nearby hotspot information
            if "nearby_hotspot" not in spot:
                return spot
            
            # Get coordinates
            origin_lat = spot["lat"]
            origin_lng = spot["lng"]
            dest_lat = spot["nearby_hotspot"]["lat"]
            dest_lng = spot["nearby_hotspot"]["lng"]
            
            # Get walking directions
            directions_url = (
                f"https://maps.googleapis.com/maps/api/directions/json?"
                f"origin={origin_lat},{origin_lng}&destination={dest_lat},{dest_lng}"
                f"&mode=walking&key={api_key}"
            )
            
            async with async_session.get(directions_url) as response:
                directions_data = await response.json()
                
                if directions_data.get("status") != "OK":
                    return spot
                
                # Extract useful information
                route = directions_data["routes"][0]
                leg = route["legs"][0]
                
                # Create a copy of the spot with additional information
                enhanced_spot = spot.copy()
                enhanced_spot["walking_info"] = {
                    "distance": leg.get("distance", {}).get("text", "Unknown"),
                    "distance_meters": leg.get("distance", {}).get("value", 0),
                    "duration": leg.get("duration", {}).get("text", "Unknown"),
                    "duration_seconds": leg.get("duration", {}).get("value", 0),
                    "steps_count": len(leg.get("steps", [])),
                    "polyline": route.get("overview_polyline", {}).get("points", "")
                }
                
                # Add simplified steps
                steps = []
                for i, step in enumerate(leg.get("steps", [])[:3]):  # Limit to first 3 steps
                    steps.append({
                        "instruction": step.get("html_instructions", "").replace("<b>", "").replace("</b>", "").replace("<div>", " ").replace("</div>", ""),
                        "distance": step.get("distance", {}).get("text", ""),
                        "duration": step.get("duration", {}).get("text", "")
                    })
                
                if steps:
                    enhanced_spot["walking_info"]["steps"] = steps
                
                return enhanced_spot
                
        except Exception as e:
            logger.error(f"Error adding walking directions for spot: {str(e)}")
            return spot
    
    # Process all spots in parallel
    tasks = [add_directions(spot) for spot in parking_spots]
    enhanced_spots = await asyncio.gather(*tasks)
    
    return enhanced_spots


# Update /api/get-recommendations to include parking spots
@app.route("/api/get-recommendations-with-parking", methods=["GET"])
def api_get_recommendations_with_parking():
    """API endpoint to get location recommendations and nearby parking spots"""
    try:
        # First get the regular recommendations
        # Check if model is loaded
        global model_data
        if not model_data:
            return (
                jsonify(
                    {
                        "status": "error",
                        "message": "Model not loaded. Please load or train a model first.",
                    }
                ),
                400,
            )

        # Get time parameter
        time_input = request.args.get("time", None)
        top_n = int(request.args.get("top_n", 5))
        radius = int(request.args.get("radius", 300))

        # Get recommendations
        recommendations = get_recommended_locations(
            time_input,
            model_data["top_locations_by_hour"],
            model_data["time_block_locations"],
            model_data["duration_map"],
            top_n,
        )
        
        # Create a single function to run all async operations
        async def run_all_async_operations():
            # Run all operations in parallel and wait for all to complete
            hourly_task = async_locations_to_coordinates(recommendations["hourly_recommendations"])
            block_task = async_locations_to_coordinates(recommendations["block_recommendations"])
            top_task = async_locations_to_coordinates([recommendations["top_recommendation"]])
            traffic_task = async_get_traffic_hotspots_google()
            
            # Wait for all tasks to complete
            hourly_result, block_result, top_result, traffic_result = await asyncio.gather(
                hourly_task, block_task, top_task, traffic_task
            )
            
            # Create a list of all potential hotspots
            all_hotspots = hourly_result + block_result + top_result + traffic_result
            
            # Find parking spots near all hotspots
            parking_task = async_find_parking_near_hotspots(
                all_hotspots, radius, 3
            )
            
            # Execute parking task
            parking_result = await parking_task
            
            # If not enough parking spots found, look for alternatives
            if len(parking_result) < 5 and all_hotspots:
                # For top 3 hotspots
                alt_tasks = []
                for hotspot in all_hotspots[:3]:
                    alt_tasks.append(
                        async_find_alternative_parking_areas(
                            hotspot["lat"],
                            hotspot["lng"],
                            radius + 200
                        )
                    )
                
                # Get alternative parking areas
                alt_results = await asyncio.gather(*alt_tasks)
                
                # Add alternative spots to parking results
                for i, alt_spots in enumerate(alt_results):
                    if i < len(all_hotspots):
                        for spot in alt_spots:
                            spot["nearby_hotspot"] = {
                                "name": all_hotspots[i].get("location", "Unknown location"),
                                "lat": all_hotspots[i]["lat"],
                                "lng": all_hotspots[i]["lng"]
                            }
                            parking_result.append(spot)
            
            # Add walking directions
            parking_with_directions = await async_add_walking_directions(parking_result)
            
            return hourly_result, block_result, top_result, traffic_result, parking_with_directions
        
        # Run all operations in a thread to avoid blocking
        future = thread_pool.submit(run_in_thread, run_all_async_operations)
        hourly_with_coords, block_with_coords, top_with_coords, traffic_hotspots, parking_spots = future.result()
        
        # Format response
        response = {
            "status": "success",
            "time_input": time_input or datetime.now().strftime("%H:%M"),
            "hour": recommendations["hour"],
            "time_of_day": recommendations["time_of_day"],
            "time_block": recommendations["time_block"],
            "hourly_recommendations": hourly_with_coords,
            "block_recommendations": block_with_coords,
            "top_recommendation": top_with_coords,
            "traffic_hotspots": traffic_hotspots,
            "parking_spots": parking_spots
        }

        return jsonify(response)

    except Exception as e:
        logger.error(f"Error getting recommendations with parking: {str(e)}", exc_info=True)
        return jsonify({"status": "error", "message": f"Error: {str(e)}"}), 500

def parse_args():
    """Parse command line arguments"""
    parser = argparse.ArgumentParser(
        description="Namma Yatri Location Recommender API Server"
    )
    parser.add_argument(
        "--host", type=str, default="0.0.0.0", help="Host to run the server on"
    )
    parser.add_argument(
        "--port", type=int, default=5000, help="Port to run the server on"
    )
    parser.add_argument(
        "--model",
        type=str,
        default="namma_yatri_location_model.pkl",
        help="Path to the model file to load on startup",
    )
    parser.add_argument(
        "--debug", action="store_true", help="Run the server in debug mode"
    )

    return parser.parse_args()


if __name__ == "__main__":
    # Parse arguments
    args = parse_args()

    # Try to load the model on startup
    if os.path.exists(args.model):
        logger.info(f"Loading model from {args.model} on startup")
        model_data = load_model(args.model)

        if model_data:
            logger.info("Model loaded successfully")
        else:
            logger.warning("Failed to load model on startup")
    else:
        logger.warning(f"Model file not found: {args.model}")

    # Run the Flask app
    logger.info(f"Starting server on {args.host}:{args.port}")
    app.run(host=args.host, port=args.port, debug=args.debug)