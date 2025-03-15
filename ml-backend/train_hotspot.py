import os
import logging
from namma_yatri_recommender import (
    load_data,
    preprocess_data,
    analyze_location_patterns,
    build_time_blocks,
    save_model,
)

# Set up logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

def train_and_save_model():
    """Function to train the model and save it."""
    try:
        # Define file paths
        excel_path = "./namma_yatri_data.xlsx"
        model_path = "./namma_yatri_location_model.pkl"

        # Check if Excel file exists
        if not os.path.exists(excel_path):
            logger.error(f"Excel file not found: {excel_path}")
            return

        # Load and preprocess the data
        logger.info(f"Loading data from {excel_path}")
        trips_df, trip_details_df, duration_df, assembly_df = load_data(excel_path)

        # Preprocess the data
        logger.info("Preprocessing data")
        completed_trips, duration_map, assembly_map = preprocess_data(
            trips_df, trip_details_df, duration_df, assembly_df
        )

        # Analyze patterns
        logger.info("Analyzing location patterns")
        top_locations_by_hour, location_totals = analyze_location_patterns(
            completed_trips
        )

        # Build time blocks
        logger.info("Building time blocks")
        time_block_locations = build_time_blocks(top_locations_by_hour)

        # Save the model
        model_data = {
            "top_locations_by_hour": top_locations_by_hour,
            "location_totals": location_totals,
            "time_block_locations": time_block_locations,
            "duration_map": duration_map,
        }

        logger.info(f"Saving model to {model_path}")
        save_model(model_data, model_path)

        logger.info(f"Model trained and saved successfully to {model_path}")

    except Exception as e:
        logger.error(f"Error during training and saving the model: {str(e)}")

if __name__ == "__main__":
    train_and_save_model()
