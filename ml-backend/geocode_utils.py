import os
import requests
import time
from typing import List, Dict, Any
import logging

# Set up logger
logger = logging.getLogger(__name__)


def locations_to_coordinates(
    location_strings: List[str],
) -> List[Dict[str, Any]]:
    """
    Converts a list of objects with location strings to include latitude and longitude.

    Args:
        location_objects: List of dictionaries containing location strings
        location_key: Key in the dictionaries that contains the location string
        api_key: Google Maps API key

    Returns:
        List of dictionaries with added 'lat' and 'lng' fields
    """
    api_key = os.environ.get("GOOGLE_MAPS_API_KEY")
    result = []

    for location_str in location_strings:

        try:
            # Call Google Maps Geocoding API
            geocode_url = f"https://maps.googleapis.com/maps/api/geocode/json?address={location_str}&key={api_key}"
            geocode_response = requests.get(geocode_url)
            geocode_data = geocode_response.json()
            if geocode_data.get("status") == "OK" and geocode_data.get("results"):
                # Get coordinates

                location = geocode_data["results"][0]["geometry"]["location"]
                # Create a new object with all original data plus coordinates
                new_obj = {"location": location_str}
                new_obj["lat"] = location["lat"]
                new_obj["lng"] = location["lng"]

                # Add formatted address for consistency
                new_obj["formatted_address"] = geocode_data["results"][0].get(
                    "formatted_address", location_str
                )
                result.append(new_obj)
            else:
                # If geocoding failed, keep original object but log warning
                logger.warning(
                    f"Failed to geocode location '{location_str}': {geocode_data.get('status')}"
                )
                result.append({"location": location_str})

        except Exception as e:
            logger.error(f"Error geocoding location '{location_str}': {str(e)}")
            result.append({"location": location_str})
    return result


def coordinates_to_locations(
    coordinate_objects: List[Dict[str, Any]],
    lat_key: str = "lat",
    lng_key: str = "lng",
) -> List[Dict[str, Any]]:
    """
    Converts a list of objects with latitude and longitude to include location names.

    Args:
        coordinate_objects: List of dictionaries containing lat and lng values
        lat_key: Key in the dictionaries that contains the latitude
        lng_key: Key in the dictionaries that contains the longitude
        api_key: Google Maps API key

    Returns:
        List of dictionaries with added 'location' and address component fields
    """
    api_key = os.environ.get("GOOGLE_MAPS_API_KEY")
    result = []

    for obj in coordinate_objects:
        if lat_key not in obj or lng_key not in obj:
            # Skip objects without coordinates
            logger.warning(
                f"Skipping object missing coordinates (keys '{lat_key}' or '{lng_key}'): {obj}"
            )
            result.append(obj)
            continue

        lat = obj[lat_key]
        lng = obj[lng_key]

        try:
            # Call Google Maps Reverse Geocoding API
            geocode_url = f"https://maps.googleapis.com/maps/api/geocode/json?latlng={lat},{lng}&key={api_key}"
            geocode_response = requests.get(geocode_url)
            geocode_data = geocode_response.json()

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

                result.append(new_obj)
            else:
                # If reverse geocoding failed, keep original object but log warning
                logger.warning(
                    f"Failed to reverse geocode coordinates ({lat}, {lng}): {geocode_data.get('status')}"
                )
                result.append(obj)

            # Respect rate limits
            time.sleep(0.02)

        except Exception as e:
            logger.error(
                f"Error reverse geocoding coordinates ({lat}, {lng}): {str(e)}"
            )
            result.append(obj)

    return result


# Example usage
if __name__ == "__main__":
    # Example 1: Convert location strings to coordinates
    location_data = [
        {"id": 1, "name": "Coffee Shop", "location": "MG Road, Bangalore"},
        {"id": 2, "name": "Tech Park", "location": "Whitefield, Bangalore"},
        {"id": 3, "name": "Mall", "location": "Koramangala, Bangalore"},
    ]

    locations_with_coords = locations_to_coordinates(location_data)
    print("Locations with coordinates:")
    for loc in locations_with_coords:
        print(f"{loc['name']}: ({loc.get('lat', 'N/A')}, {loc.get('lng', 'N/A')})")

    # Example 2: Convert coordinates to location names
    coordinate_data = [
        {"id": 1, "name": "Point A", "lat": 12.9716, "lng": 77.5946},  # Bangalore
        {"id": 2, "name": "Point B", "lat": 13.0827, "lng": 80.2707},  # Chennai
        {"id": 3, "name": "Point C", "lat": 17.3850, "lng": 78.4867},  # Hyderabad
    ]

    coords_with_locations = coordinates_to_locations(coordinate_data)
    print("\nCoordinates with location names:")
    for loc in coords_with_locations:
        print(f"{loc['name']}: {loc.get('location', 'N/A')}")
