from flask import Flask, request, jsonify
from datetime import datetime
import os
import argparse
import logging

# Import functions from the provided script
from namma_yatri_recommender import (
    load_data,
    preprocess_data,
    analyze_location_patterns,
    build_time_blocks,
    get_recommended_locations,
    save_model,
    load_model,
)

# Set up logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)

# Global model data
model_data = None


@app.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint to verify server is running"""
    return jsonify({"status": "healthy", "model_loaded": model_data is not None})


@app.route("/api/load-model", methods=["POST"])
def api_load_model():
    """API endpoint to load a model from a file"""
    try:
        data = request.json
        model_path = data.get("model_path", "namma_yatri_location_model.pkl")

        global model_data
        model_data = load_model(model_path)

        if model_data:
            return jsonify(
                {"status": "success", "message": f"Model loaded from {model_path}"}
            )
        else:
            return (
                jsonify(
                    {
                        "status": "error",
                        "message": f"Failed to load model from {model_path}",
                    }
                ),
                400,
            )

    except Exception as e:
        logger.error(f"Error loading model: {str(e)}")
        return jsonify({"status": "error", "message": f"Error: {str(e)}"}), 500


@app.route("/api/train-model", methods=["GET"])
def api_train_model():
    """API endpoint to train a new model"""
    try:
        excel_path = "./namma_yatri_data.xlsx"
        model_path = "./namma_yatri_location_model.pkl"

        # Check if Excel file exists
        if not os.path.exists(excel_path):
            return (
                jsonify(
                    {
                        "status": "error",
                        "message": f"Excel file not found: {excel_path}",
                    }
                ),
                400,
            )

        # Load and process data
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

        # Create and save model data
        global model_data
        model_data = {
            "top_locations_by_hour": top_locations_by_hour,
            "location_totals": location_totals,
            "time_block_locations": time_block_locations,
            "duration_map": duration_map,
        }

        # Save the model
        save_model(model_data, model_path)

        return jsonify(
            {
                "status": "success",
                "message": f"Model trained and saved to {model_path}",
                "stats": {
                    "completed_trips": len(completed_trips),
                    "total_locations": len(location_totals),
                },
            }
        )

    except Exception as e:
        logger.error(f"Error training model: {str(e)}")
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

        # Format response
        response = {
            "status": "success",
            "time_input": time_input or datetime.now().strftime("%H:%M"),
            "hour": recommendations["hour"],
            "time_of_day": recommendations["time_of_day"],
            "time_block": recommendations["time_block"],
            "hourly_recommendations": recommendations["hourly_recommendations"],
            "block_recommendations": recommendations["block_recommendations"],
            "top_recommendation": recommendations["top_recommendation"],
        }

        return jsonify(response)

    except Exception as e:
        logger.error(f"Error getting recommendations: {str(e)}")
        return jsonify({"status": "error", "message": f"Error: {str(e)}"}), 500


@app.route("/api/locations", methods=["GET"])
def api_get_locations():
    """API endpoint to get all available locations"""
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

        # Get the location totals from the model
        location_totals = model_data["location_totals"]

        # Convert to list of dictionaries for the response
        locations = [
            {"name": location, "total_activity": float(activity)}
            for location, activity in location_totals.items()
        ]

        return jsonify(
            {
                "status": "success",
                "total_locations": len(locations),
                "locations": locations,
            }
        )

    except Exception as e:
        logger.error(f"Error getting locations: {str(e)}")
        return jsonify({"status": "error", "message": f"Error: {str(e)}"}), 500


@app.route("/api/time-blocks", methods=["GET"])
def api_get_time_blocks():
    """API endpoint to get time block information"""
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

        # Get the time blocks and their recommended locations
        time_block_locations = model_data["time_block_locations"]

        # Format for response
        time_blocks = {
            block_name: {
                "hours": get_hours_for_block(block_name),
                "recommended_locations": locations,
            }
            for block_name, locations in time_block_locations.items()
        }

        return jsonify({"status": "success", "time_blocks": time_blocks})

    except Exception as e:
        logger.error(f"Error getting time blocks: {str(e)}")
        return jsonify({"status": "error", "message": f"Error: {str(e)}"}), 500


def get_hours_for_block(block_name):
    """Helper function to get the hours corresponding to a time block"""
    time_blocks = {
        "early_morning": [4, 5, 6, 7],
        "morning": [8, 9, 10, 11],
        "afternoon": [12, 13, 14, 15],
        "evening": [16, 17, 18, 19],
        "night": [20, 21, 22, 23],
        "late_night": [0, 1, 2, 3],
    }
    return time_blocks.get(block_name, [])


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
        try:
            logger.info("Training model on startup")
            api_train_model()
        except Exception as e:
            logger.error(f"Error training model on startup: {str(e)}")
        logger.warning(f"Model file not found: {args.model}")

    # Run the Flask app
    logger.info(f"Starting server on {args.host}:{args.port}")
    app.run(host=args.host, port=args.port, debug=args.debug)
