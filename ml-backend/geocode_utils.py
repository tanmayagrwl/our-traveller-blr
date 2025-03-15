import os
import logging
import asyncio
import aiohttp
from typing import List, Dict, Any

# Set up logger
logger = logging.getLogger(__name__)

# Global session
_session = None


async def get_session():
    """Get or create the aiohttp session"""
    global _session
    if _session is None or _session.closed:
        _session = aiohttp.ClientSession()
    return _session


async def close_session():
    """Close the aiohttp session"""
    global _session
    if _session and not _session.closed:
        await _session.close()
        _session = None


async def async_locations_to_coordinates(
    location_strings: List[str],
) -> List[Dict[str, Any]]:
    """
    Asynchronously converts a list of location strings to include latitude and longitude.

    Args:
        location_strings: List of location strings

    Returns:
        List of dictionaries with location string, lat, and lng fields
    """
    api_key = os.environ.get("GOOGLE_MAPS_API_KEY")
    logger.info("api",api_key)
    session = await get_session()
    
    async def process_location(location_str):
        try:
            # Call Google Maps Geocoding API
            geocode_url = f"https://maps.googleapis.com/maps/api/geocode/json?address={location_str}&key={api_key}"
            async with session.get(geocode_url) as response:
                geocode_data = await response.json()
                print(geocode_data)
                
                if geocode_data.get("status") == "OK" and geocode_data.get("results"):
                    # Get coordinates
                    location = geocode_data["results"][0]["geometry"]["location"]
                    # Create a new object with coordinates
                    new_obj = {"location": location_str}
                    new_obj["lat"] = location["lat"]
                    new_obj["lng"] = location["lng"]
                    new_obj["formatted_address"] = geocode_data["results"][0].get(
                        "formatted_address", location_str
                    )
                    return new_obj
                else:
                    # If geocoding failed, log warning
                    logger.warning(
                        f"Failed to geocode location '{location_str}': {geocode_data.get('status')}"
                    )
                    return {"location": location_str}
        except Exception as e:
            logger.error(f"Error geocoding location '{location_str}': {str(e)}")
            return {"location": location_str}
    
    # Process all locations concurrently
    tasks = [process_location(loc) for loc in location_strings]
    results = await asyncio.gather(*tasks)
    
    return results


async def async_coordinates_to_locations(
    coordinate_objects: List[Dict[str, Any]],
    lat_key: str = "lat",
    lng_key: str = "lng",
) -> List[Dict[str, Any]]:
    """
    Asynchronously converts a list of objects with coordinates to include location names.

    Args:
        coordinate_objects: List of dictionaries containing lat and lng values
        lat_key: Key in the dictionaries that contains the latitude
        lng_key: Key in the dictionaries that contains the longitude

    Returns:
        List of dictionaries with added location and address component fields
    """
    api_key = os.environ.get("GOOGLE_MAPS_API_KEY")
    logger.info("api",api_key)
    session = await get_session()
    
    async def process_coordinate(obj):
        if lat_key not in obj or lng_key not in obj:
            # Skip objects without coordinates
            logger.warning(
                f"Skipping object missing coordinates (keys '{lat_key}' or '{lng_key}'): {obj}"
            )
            return obj
            
        lat = obj[lat_key]
        lng = obj[lng_key]

        try:
            # Call Google Maps Reverse Geocoding API
            geocode_url = f"https://maps.googleapis.com/maps/api/geocode/json?latlng={lat},{lng}&key={api_key}"
            async with session.get(geocode_url) as response:
                geocode_data = await response.json()

                if geocode_data.get("status") == "OK" and geocode_data.get("results"):
                    # Create a new object with all original data
                    new_obj = obj.copy()

                    # Add full formatted address
                    new_obj["formatted_address"] = geocode_data["results"][0].get(
                        "formatted_address", ""
                    )

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
                            location_parts.append(
                                f"{components['street_number']} {components['route']}"
                            )
                        else:
                            location_parts.append(components["route"])

                    if (
                        "sublocality" in components
                        and "sublocality_level_1" not in components
                    ):
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
                    logger.warning(
                        f"Failed to reverse geocode coordinates ({lat}, {lng}): {geocode_data.get('status')}"
                    )
                    return obj
        except Exception as e:
            logger.error(
                f"Error reverse geocoding coordinates ({lat}, {lng}): {str(e)}"
            )
            return obj
    
    # Process all coordinates concurrently
    tasks = [process_coordinate(obj) for obj in coordinate_objects]
    results = await asyncio.gather(*tasks)
    
    return results


# Synchronous wrapper functions for compatibility
def locations_to_coordinates(location_strings: List[str]) -> List[Dict[str, Any]]:
    """
    Synchronous wrapper for async_locations_to_coordinates
    """
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        return loop.run_until_complete(async_locations_to_coordinates(location_strings))
    finally:
        loop.run_until_complete(close_session())
        loop.close()


def coordinates_to_locations(
    coordinate_objects: List[Dict[str, Any]],
    lat_key: str = "lat",
    lng_key: str = "lng",
) -> List[Dict[str, Any]]:
    """
    Synchronous wrapper for async_coordinates_to_locations
    """
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        return loop.run_until_complete(
            async_coordinates_to_locations(coordinate_objects, lat_key, lng_key)
        )
    finally:
        loop.run_until_complete(close_session())
        loop.close()


# Example usage
if __name__ == "__main__":
    async def test_async_functions():
        # Example 1: Convert location strings to coordinates
        locations = ["MG Road, Bangalore", "Whitefield, Bangalore", "Koramangala, Bangalore"]
        locations_with_coords = await async_locations_to_coordinates(locations)
        print("Locations with coordinates:")
        for loc in locations_with_coords:
            print(f"{loc['location']}: ({loc.get('lat', 'N/A')}, {loc.get('lng', 'N/A')})")

        # Example 2: Convert coordinates to location names
        coordinate_data = [
            {"id": 1, "name": "Point A", "lat": 12.9716, "lng": 77.5946},  # Bangalore
            {"id": 2, "name": "Point B", "lat": 13.0827, "lng": 80.2707},  # Chennai
            {"id": 3, "name": "Point C", "lat": 17.3850, "lng": 78.4867},  # Hyderabad
        ]
        coords_with_locations = await async_coordinates_to_locations(coordinate_data)
        print("\nCoordinates with location names:")
        for loc in coords_with_locations:
            print(f"{loc['name']}: {loc.get('location', 'N/A')}")
        
        await close_session()

    # Run the test
    asyncio.run(test_async_functions())