# Namma Yatri Booth Location Recommender API

This project provides a REST API server that recommends optimal locations for setting up in-app booths for the Namma Yatri app in Bangalore based on time of day.

## Overview

The API analyzes trip patterns from Namma Yatri data to determine the most active locations for each hour of the day and provides recommendations through a simple REST API.

## Files

- `namma_yatri_recommender.py` - Core recommendation logic and functions
- `namma_yatri_api_server.py` - Flask-based API server
- `namma_yatri_api_client.py` - Example client for interacting with the API

## Setup

### Prerequisites

- Python 3.7+
- Required packages: flask, pandas, numpy, joblib, openpyxl

### Installation

1. Clone the repository or download the files
2. Install required packages:

```bash
pip install flask pandas numpy joblib openpyxl requests
```

3. Make sure you have the Namma Yatri Excel data file (`namma_yatri_data.xlsx`)

## Running the API Server

Start the server with:

```bash
python namma_yatri_api_server.py --port 5000 --model namma_yatri_location_model.pkl
```

Options:
- `--host`: Host to bind the server to (default: 0.0.0.0)
- `--port`: Port to run the server on (default: 5000)
- `--model`: Path to the pre-trained model file to load on startup
- `--debug`: Run the server in debug mode

The server will attempt to load the specified model on startup if it exists.

## API Endpoints

### Health Check

```
GET /health
```

Checks if the server is running and if a model is loaded.

**Response:**
```json
{
  "status": "healthy",
  "model_loaded": true
}
```

### Load Model

```
POST /api/load-model
```

Loads a pre-trained model from a file.

**Request Body:**
```json
{
  "model_path": "namma_yatri_location_model.pkl"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Model loaded from namma_yatri_location_model.pkl"
}
```

### Train Model

```
POST /api/train-model
```

Trains a new model from the Namma Yatri Excel data.

**Request Body:**
```json
{
  "excel_path": "namma_yatri_data.xlsx",
  "model_path": "namma_yatri_location_model.pkl"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Model trained and saved to namma_yatri_location_model.pkl",
  "stats": {
    "completed_trips": 983,
    "total_locations": 37
  }
}
```

### Get Recommendations

```
GET /api/get-recommendations?time=14:30&top_n=5
```

Get location recommendations for a specific time.

**Query Parameters:**
- `time`: Time in format HH:MM (optional, defaults to current time)
- `top_n`: Number of recommendations to return (optional, defaults to 5)

**Response:**
```json
{
  "status": "success",
  "time_input": "14:30",
  "hour": 14,
  "time_of_day": "14-15",
  "time_block": "afternoon",
  "hourly_recommendations": [
    "Chamrajpet",
    "Rajarajeshwarinagar",
    "Dasarahalli",
    "Yelahanka",
    "Mahadevapura"
  ],
  "block_recommendations": [
    "Gandhi Nagar",
    "Chamrajpet",
    "Rajarajeshwarinagar",
    "Vijay Nagar",
    "Hebbal"
  ],
  "top_recommendation": "Chamrajpet"
}
```

### Get All Locations

```
GET /api/locations
```

Get all available locations with their total activity scores.

**Response:**
```json
{
  "status": "success",
  "total_locations": 37,
  "locations": [
    {
      "name": "Chamrajpet",
      "total_activity": 67.0
    },
    {
      "name": "Ramanagaram",
      "total_activity": 65.0
    },
    ...
  ]
}
```

### Get Time Blocks

```
GET /api/time-blocks
```

Get information about time blocks and their recommended locations.

**Response:**
```json
{
  "status": "success",
  "time_blocks": {
    "early_morning": {
      "hours": [4, 5, 6, 7],
      "recommended_locations": [
        "Mahadevapura",
        "Chamrajpet",
        "Rajarajeshwarinagar",
        "Gandhi Nagar",
        "Dasarahalli"
      ]
    },
    "morning": {
      "hours": [8, 9, 10, 11],
      "recommended_locations": [
        "Ramanagaram",
        "Kanakapura",
        "Krishnarajapuram",
        "B. T. M. Layout",
        "Rajarajeshwarinagar"
      ]
    },
    ...
  }
}
```

## Using the Client

The repository includes a client script (`namma_yatri_api_client.py`) that demonstrates how to interact with the API.

### Examples:

Check server health:
```bash
python namma_yatri_api_client.py --url http://localhost:5000 --action health
```

Load a model:
```bash
python namma_yatri_api_client.py --action load --model namma_yatri_location_model.pkl
```

Train a new model:
```bash
python namma_yatri_api_client.py --action train --excel namma_yatri_data.xlsx
```

Get recommendations for current time:
```bash
python namma_yatri_api_client.py --action recommend
```

Get recommendations for a specific time:
```bash
python namma_yatri_api_client.py --action recommend --time 18:30
```

Get all available locations:
```bash
python namma_yatri_api_client.py --action locations
```

Get time block information:
```bash
python namma_yatri_api_client.py --action timeblocks
```

## Integration with Other Applications

You can integrate this API with various applications:

### Web Frontend

Create a frontend web application using React, Vue, or Angular that calls these API endpoints to display recommendations:

```javascript
// Example fetch in JavaScript
fetch('http://localhost:5000/api/get-recommendations?time=14:30')
  .then(response => response.json())
  .then(data => {
    // Display recommendations in the UI
    console.log(data.top_recommendation);
  });
```

### Mobile App Integration

For a mobile app, you can call these endpoints from your app's backend or directly from the mobile frontend:

```kotlin
// Example in Kotlin for Android
val url = "http://localhost:5000/api/get-recommendations?time=14:30"
val request = Request.Builder().url(url).build()

client.newCall(request).enqueue(object : Callback {
    override fun onResponse(call: Call, response: Response) {
        val data = JSONObject(response.body?.string())
        // Use the recommendation data
    }
    
    override fun onFailure(call: Call, e: IOException) {
        // Handle error
    }
})
```

### Cron Job for Regular Updates

You can set up a cron job to periodically fetch recommendations and update your systems:

```bash
# Example cron job that gets recommendations every hour
0 * * * * curl -s "http://localhost:5000/api/get-recommendations" > /tmp/current_recommendations.json
```

## Deployment

### Local Deployment

For local development and testing, simply run the Flask server as described above.

### Production Deployment

For production, consider using:

1. Gunicorn as a WSGI server:
```bash
gunicorn -w 4 -b 0.0.0.0:5000 "namma_yatri_api_server:app"
```

2. Docker for containerization:
```
# Example Dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY . .
RUN pip install -r requirements.txt

EXPOSE 5000
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "namma_yatri_api_server:app"]
```

3. Cloud deployment options:
   - AWS Elastic Beanstalk
   - Google Cloud Run
   - Heroku
   - Azure App Service

## Performance Considerations

- The API server caches the model in memory, so recommendations are fast once the model is loaded
- For high-traffic deployments, consider adding a caching layer (Redis, Memcached)
- The model training process is computationally intensive but only happens when explicitly called

## Security Considerations

When deploying to production:

1. Add authentication to protect sensitive endpoints (especially train/load model)
2. Use HTTPS to encrypt all API traffic
3. Implement rate limiting to prevent abuse
4. Validate all input parameters to prevent injection attacks

## License

This project is licensed under the MIT License - see the LICENSE file for details.