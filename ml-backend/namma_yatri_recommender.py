# namma_yatri_recommender.py
import pandas as pd
from datetime import datetime
import joblib
import os
import sys
import logging

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def load_data(excel_path):
    """Load the Namma Yatri data from Excel file"""
    try:
        # Load all worksheets
        trips_df = pd.read_excel(excel_path, sheet_name='Trips')
        trip_details_df = pd.read_excel(excel_path, sheet_name='Trip_Details')
        duration_df = pd.read_excel(excel_path, sheet_name='Duration')
        assembly_df = pd.read_excel(excel_path, sheet_name='Assembly')
        
        logger.info(f"Successfully loaded data from {excel_path}")
        logger.info(f"- Trips: {trips_df.shape[0]} rows")
        logger.info(f"- Trip Details: {trip_details_df.shape[0]} rows")
        
        return trips_df, trip_details_df, duration_df, assembly_df
    
    except Exception as e:
        logger.error(f"Error loading data: {e}")
        raise

def preprocess_data(trips_df, trip_details_df, duration_df, assembly_df):
    """Preprocess and merge the data"""
    # Create mappings
    duration_id_col = 'id' if 'id' in duration_df.columns else 'ID'
    duration_name_col = 'duration' if 'duration' in duration_df.columns else 'Duration'
    
    duration_map = dict(zip(duration_df[duration_id_col], duration_df[duration_name_col]))
    
    assembly_id_col = 'ID' if 'ID' in assembly_df.columns else 'id'
    assembly_name_col = 'Assembly' if 'Assembly' in assembly_df.columns else 'assembly'
    
    assembly_map = dict(zip(assembly_df[assembly_id_col], assembly_df[assembly_name_col]))
    
    # Filter completed trips
    # In Trip_Details, end_ride=1 means the ride was completed
    completed_trip_ids = trip_details_df[trip_details_df['end_ride'] == 1]['tripid'].unique()
    completed_trips = trips_df[trips_df['tripid'].isin(completed_trip_ids)].copy()
    
    logger.info(f"Found {len(completed_trips)} completed trips out of {len(trips_df)} total trips")
    
    # Add location names and time information
    completed_trips['from_location'] = completed_trips['loc_from'].map(assembly_map)
    completed_trips['to_location'] = completed_trips['loc_to'].map(assembly_map)
    completed_trips['time_of_day'] = completed_trips['duration'].map(duration_map)
    
    # Extract hour
    completed_trips['hour_start'] = completed_trips['time_of_day'].str.split('-').str[0].astype(int)
    
    return completed_trips, duration_map, assembly_map

def analyze_location_patterns(completed_trips):
    """Analyze location patterns by time of day"""
    # Analyze origin locations
    origin_counts = completed_trips.groupby(['hour_start', 'from_location']).size().reset_index(name='origin_count')
    
    # Analyze destination locations
    dest_counts = completed_trips.groupby(['hour_start', 'to_location']).size().reset_index(name='dest_count')
    
    # Rename columns for merging
    origin_counts = origin_counts.rename(columns={'from_location': 'location'})
    dest_counts = dest_counts.rename(columns={'to_location': 'location'})
    
    # Merge origin and destination data
    location_activity = pd.merge(
        origin_counts, 
        dest_counts, 
        on=['hour_start', 'location'], 
        how='outer'
    ).fillna(0)
    
    # Calculate total activity
    location_activity['total_count'] = location_activity['origin_count'] + location_activity['dest_count']
    
    # Get top locations by hour
    top_locations_by_hour = {}
    for hour in range(24):
        hour_data = location_activity[location_activity['hour_start'] == hour]
        if not hour_data.empty:
            top_locations = hour_data.sort_values('total_count', ascending=False).head(5)
            top_locations_by_hour[hour] = top_locations['location'].tolist()
        else:
            top_locations_by_hour[hour] = []
    
    # Get overall busiest locations
    location_totals = location_activity.groupby('location')['total_count'].sum().sort_values(ascending=False)
    
    # Fill in any missing hours with overall top locations
    overall_top_locations = location_totals.index.tolist()[:5]
    for hour in range(24):
        if hour not in top_locations_by_hour or not top_locations_by_hour[hour]:
            top_locations_by_hour[hour] = overall_top_locations
    
    return top_locations_by_hour, location_totals

def build_time_blocks(top_locations_by_hour):
    """Group hours into time blocks for more robust recommendations"""
    # Define time blocks
    time_blocks = {
        'early_morning': [4, 5, 6, 7],
        'morning': [8, 9, 10, 11],
        'afternoon': [12, 13, 14, 15],
        'evening': [16, 17, 18, 19],
        'night': [20, 21, 22, 23],
        'late_night': [0, 1, 2, 3]
    }
    
    # Create aggregated recommendations for each time block
    time_block_locations = {}
    
    for block_name, hours in time_blocks.items():
        # Collect all location data for this time block
        block_locations = {}
        
        for hour in hours:
            for location in top_locations_by_hour[hour]:
                if location in block_locations:
                    block_locations[location] += 1
                else:
                    block_locations[location] = 1
        
        # Sort by frequency
        sorted_locations = sorted(block_locations.items(), key=lambda x: x[1], reverse=True)
        time_block_locations[block_name] = [loc for loc, _ in sorted_locations[:5]]
    
    return time_block_locations

def get_time_block(hour):
    """Determine which time block an hour belongs to"""
    if 4 <= hour <= 7:
        return 'early_morning'
    elif 8 <= hour <= 11:
        return 'morning'
    elif 12 <= hour <= 15:
        return 'afternoon'
    elif 16 <= hour <= 19:
        return 'evening'
    elif 20 <= hour <= 23:
        return 'night'
    else:  # 0-3
        return 'late_night'

def get_recommended_locations(time_input, top_locations_by_hour, time_block_locations, 
                             duration_map, top_n=5):
    """Get recommended locations based on input time"""
    # Parse the time input
    if time_input is None:
        current_time = datetime.now()
    else:
        try:
            # Try HH:MM format
            current_time = datetime.strptime(time_input, "%H:%M")
        except ValueError:
            try:
                # Try HH:MM AM/PM format
                current_time = datetime.strptime(time_input, "%I:%M %p")
            except ValueError:
                logger.warning(f"Invalid time format: {time_input}. Using current time instead.")
                current_time = datetime.now()
    
    # Get the hour
    current_hour = current_time.hour
    
    # Get time block
    time_block = get_time_block(current_hour)
    
    # Get hourly recommendations
    hourly_recommendations = top_locations_by_hour[current_hour][:top_n]
    
    # Get time block recommendations
    block_recommendations = time_block_locations[time_block][:top_n]
    
    # Format the time string for output
    time_str = duration_map.get(current_hour + 1, f"{current_hour}-{current_hour+1}")
    
    return {
        'hour': current_hour,
        'time_of_day': time_str,
        'time_block': time_block,
        'hourly_recommendations': hourly_recommendations,
        'block_recommendations': block_recommendations,
        'top_recommendation': hourly_recommendations[0] if hourly_recommendations else None
    }

def save_model(model_data, filepath="namma_yatri_location_model.pkl"):
    """Save the model data to a pickle file"""
    try:
        joblib.dump(model_data, filepath)
        logger.info(f"Model saved to {filepath}")
        return True
    except Exception as e:
        logger.error(f"Error saving model: {e}")
        return False

def load_model(filepath="namma_yatri_location_model.pkl"):
    """Load the model data from a pickle file"""
    try:
        model_data = joblib.load(filepath)
        logger.info(f"Model loaded from {filepath}")
        return model_data
    except Exception as e:
        logger.error(f"Error loading model: {e}")
        return None