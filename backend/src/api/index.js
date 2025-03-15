const express = require('express');
// const { default: setupPubSubService } = require('../loaders/pubsub');

// const { publishMessage } = await setupPubSubService();
// await publishMessage({ text: 'This is a test message', timestamp: new Date().toISOString() });
// console.log('Test message published');

module.exports = () => {
  const app = express.Router();
  app.get('/driver/dashboard', (req, res) => {
    res.json(DriverDashboard);
  });

  app.get('/heatmap', (req, res) => {
    res.json(heatMapData);
  });
  //TODO: add routes here...

  return app;
};

const heatMapData = {
  "heatmapData": {
    "morning": [
      {"lat": 12.9716, "lng": 77.5946, "weight": 0.9},
      {"lat": 12.9766, "lng": 77.5993, "weight": 0.8},
      {"lat": 12.9698, "lng": 77.6010, "weight": 0.7},
      {"lat": 12.9780, "lng": 77.5886, "weight": 0.9},
      {"lat": 12.9738, "lng": 77.6150, "weight": 0.6},
      {"lat": 12.9840, "lng": 77.6043, "weight": 0.8},
      {"lat": 12.9626, "lng": 77.5876, "weight": 0.5},
      {"lat": 12.9893, "lng": 77.5913, "weight": 0.7},
      {"lat": 12.9754, "lng": 77.6234, "weight": 0.6},
      {"lat": 13.0115, "lng": 77.5671, "weight": 0.8}
    ],
    "afternoon": [
      {"lat": 12.9716, "lng": 77.5946, "weight": 0.5},
      {"lat": 12.9766, "lng": 77.5993, "weight": 0.4},
      {"lat": 12.9698, "lng": 77.6010, "weight": 0.6},
      {"lat": 12.9780, "lng": 77.5886, "weight": 0.4},
      {"lat": 12.9738, "lng": 77.6150, "weight": 0.7},
      {"lat": 12.9840, "lng": 77.6043, "weight": 0.5},
      {"lat": 12.9626, "lng": 77.5876, "weight": 0.6},
      {"lat": 12.9893, "lng": 77.5913, "weight": 0.4},
      {"lat": 12.9754, "lng": 77.6234, "weight": 0.8},
      {"lat": 13.0115, "lng": 77.5671, "weight": 0.5}
    ],
    "evening": [
      {"lat": 12.9716, "lng": 77.5946, "weight": 0.7},
      {"lat": 12.9766, "lng": 77.5993, "weight": 0.9},
      {"lat": 12.9698, "lng": 77.6010, "weight": 0.8},
      {"lat": 12.9780, "lng": 77.5886, "weight": 0.6},
      {"lat": 12.9738, "lng": 77.6150, "weight": 0.9},
      {"lat": 12.9840, "lng": 77.6043, "weight": 0.7},
      {"lat": 12.9626, "lng": 77.5876, "weight": 0.8},
      {"lat": 12.9893, "lng": 77.5913, "weight": 0.9},
      {"lat": 12.9754, "lng": 77.6234, "weight": 0.7},
      {"lat": 13.0115, "lng": 77.5671, "weight": 0.6}
    ]
  },
  "standLocations": [
    {
      "id": "s1",
      "name": "Tech Park Stand",
      "lat": 12.9766,
      "lng": 77.5993,
      "capacity": 12,
      "available": 5,
      "type": "designated",
      "rush": "high"
    },
    {
      "id": "s2",
      "name": "Central Business District",
      "lat": 12.9716,
      "lng": 77.5946,
      "capacity": 18,
      "available": 2,
      "type": "premium",
      "rush": "high"
    },
    {
      "id": "s3",
      "name": "Shopping Mall Hub",
      "lat": 12.9780,
      "lng": 77.5886,
      "capacity": 10,
      "available": 8,
      "type": "designated",
      "rush": "medium"
    },
    {
      "id": "s4",
      "name": "Airport Terminal",
      "lat": 13.0115,
      "lng": 77.5671,
      "capacity": 25,
      "available": 12,
      "type": "priority",
      "rush": "high"
    },
    {
      "id": "s5",
      "name": "Central Station",
      "lat": 12.9793,
      "lng": 77.5913,
      "capacity": 15,
      "available": 3,
      "type": "premium",
      "rush": "high"
    },
    {
      "id": "s6",
      "name": "University Gate",
      "lat": 12.9738,
      "lng": 77.6150,
      "capacity": 8,
      "available": 6,
      "type": "standard",
      "rush": "medium"
    }
  ],
  "driverLocation": {
    "lat": 12.9730,
    "lng": 77.6010
  },
  "incentives": [
    {
      "area": "Tech Park",
      "time": "8:30 - 9:30 AM",
      "surge": "1.8x",
      "bonus": 30
    },
    {
      "area": "Central Business District",
      "time": "5:30 - 7:00 PM",
      "surge": "2.1x",
      "bonus": 40
    },
    {
      "area": "Shopping Mall",
      "time": "7:00 - 8:30 PM",
      "surge": "1.5x",
      "bonus": 25
    },
    {
      "area": "Airport",
      "time": "10:00 PM - 12:00 AM",
      "surge": "1.7x",
      "bonus": 35
    }
  ],
  "demandTrends": [
    {
      "period": "Next 30 mins",
      "averageFare": 180,
      "demandLevel": 85,
      "prediction": "Very High"
    },
    {
      "period": "1-2 hours",
      "averageFare": 150,
      "demandLevel": 60,
      "prediction": "Moderate"
    },
    {
      "period": "2-4 hours",
      "averageFare": 120,
      "demandLevel": 30,
      "prediction": "Low"
    }
  ],
  "recommendedAreas": [
    {
      "name": "Tech Park",
      "distance": 3.2,
      "highlight": false
    },
    {
      "name": "Central Station",
      "distance": 5.1,
      "highlight": true
    },
    {
      "name": "Shopping Mall",
      "distance": 2.8,
      "highlight": false
    },
    {
      "name": "Airport",
      "distance": 15.3,
      "highlight": true
    }
  ],
  "dailyChallenges": {
    "target": 5,
    "reward": 500,
    "description": "Complete 5 peak hour rides to earn a bonus of ₹500 today!"
  },
  "demandInfo": {
    "morning": "Morning peak shows high demand near tech parks and business districts.",
    "afternoon": "Afternoon demand is concentrated around shopping areas and universities.",
    "evening": "Evening peak shows high demand in residential areas and entertainment districts."
  }
}


const DriverDashboard = {
  driver: {
    id: "d-10234",
    name: "Rajesh Kumar",
    phone: "+91 9876543210",
    email: "rajesh.k@example.com",
    rating: 4.8,
    profileImage: "https://i.pravatar.cc/150?img=32",
    vehicle: {
      model: "Maruti Suzuki Swift",
      number: "KA 01 AB 1234",
      color: "White",
      type: "Hatchback"
    },
    accountStatus: "active",
    onboardingDate: "2022-06-15"
  },
  stats: {
    daily: {
      earnings: 1250,
      completedRides: 8,
      declinedRides: 2,
      totalDistance: 75,
      onlineHours: 7.5,
      comparedToYesterday: 13 // percentage
    },
    weekly: {
      earnings: [
        { day: "Mon", amount: 950 },
        { day: "Tue", amount: 1120 },
        { day: "Wed", amount: 840 },
        { day: "Thu", amount: 1250 },
        { day: "Fri", amount: 1650 },
        { day: "Sat", amount: 1800 },
        { day: "Sun", amount: 1350 }
      ],
      totalRides: 48,
      totalEarnings: 8960,
      averageRating: 4.7,
      topPerformanceDay: "Saturday"
    }
  },
  location: {
    current: {
      lat: 12.9716,
      lng: 77.5946
    },
    lastUpdated: "2025-03-15T10:15:30Z"
  },
  rewards: {
    level: "Gold",
    points: 70,
    nextLevel: "Platinum",
    pointsToNextLevel: 30,
    badges: [
      { name: "Peak Hero", type: "primary" },
      { name: "Weekend Warrior", type: "secondary" },
      { name: "5-Star Driver", type: "accent" }
    ],
    achievements: [
      { name: "100 Rides Completed", date: "2024-12-10" },
      { name: "50 Five-Star Ratings", date: "2025-01-22" }
    ]
  },
  activeRides: []
};
