
export const mockDriverLocation = {
    lat: 13.0827,
    lng: 80.2707
  }
  
  export const mockUserLocation = {
    lat: 13.0850,
    lng: 80.2700
  }
  
  export const mockDailyStats = {
    completedRides: 8,
    declinedRides: 2,
    earnings: 1250,
    rating: 4.8,
    onlineHours: 5
  }
  
  export const mockWeeklyEarnings = [
    { day: 'Mon', amount: 950 },
    { day: 'Tue', amount: 1100 },
    { day: 'Wed', amount: 950 },
    { day: 'Thu', amount: 1250 },
    { day: 'Fri', amount: 1500 },
    { day: 'Sat', amount: 1800 },
    { day: 'Sun', amount: 1350 }
  ]
  
  
  export const mockHeatmapData = {
    morning: [
      { lat: 13.0827, lng: 80.2707, intensity: 0.8 }, 
      { lat: 13.0569, lng: 80.2425, intensity: 0.9 }, 
      { lat: 12.9830, lng: 80.2594, intensity: 0.6 }, 
      { lat: 13.0878, lng: 80.2785, intensity: 0.7 }, 
      { lat: 13.0102, lng: 80.2123, intensity: 0.5 }, 
      { lat: 13.0067, lng: 80.2206, intensity: 0.8 }, 
      { lat: 13.1067, lng: 80.2847, intensity: 0.7 }, 
      { lat: 12.9165, lng: 80.1525, intensity: 0.9 }, 
      { lat: 12.9456, lng: 80.1405, intensity: 0.9 }, 
      { lat: 12.9010, lng: 80.2279, intensity: 0.6 }, 
    ],
    afternoon: [
      { lat: 13.0827, lng: 80.2707, intensity: 0.6 }, 
      { lat: 13.0569, lng: 80.2425, intensity: 0.7 }, 
      { lat: 12.9830, lng: 80.2594, intensity: 0.5 }, 
      { lat: 13.0878, lng: 80.2785, intensity: 0.5 }, 
      { lat: 13.0102, lng: 80.2123, intensity: 0.6 }, 
      { lat: 13.0067, lng: 80.2206, intensity: 0.5 }, 
      { lat: 13.1067, lng: 80.2847, intensity: 0.4 }, 
      { lat: 12.9165, lng: 80.1525, intensity: 0.5 }, 
      { lat: 12.9456, lng: 80.1405, intensity: 0.5 }, 
      { lat: 12.9010, lng: 80.2279, intensity: 0.7 }, 
      { lat: 13.0836, lng: 80.2181, intensity: 0.8 }, 
      { lat: 13.0406, lng: 80.2339, intensity: 0.8 }, 
    ],
    evening: [
      { lat: 13.0827, lng: 80.2707, intensity: 0.9 }, 
      { lat: 13.0569, lng: 80.2425, intensity: 0.8 }, 
      { lat: 12.9830, lng: 80.2594, intensity: 0.8 }, 
      { lat: 13.0878, lng: 80.2785, intensity: 0.7 }, 
      { lat: 13.0102, lng: 80.2123, intensity: 0.8 }, 
      { lat: 13.0067, lng: 80.2206, intensity: 0.7 }, 
      { lat: 13.1067, lng: 80.2847, intensity: 0.6 }, 
      { lat: 12.9165, lng: 80.1525, intensity: 0.9 }, 
      { lat: 12.9456, lng: 80.1405, intensity: 0.9 }, 
      { lat: 12.9010, lng: 80.2279, intensity: 0.8 }, 
      { lat: 13.0836, lng: 80.2181, intensity: 0.7 }, 
      { lat: 13.0406, lng: 80.2339, intensity: 0.6 }, 
      { lat: 13.0474, lng: 80.0689, intensity: 0.8 }, 
      { lat: 13.0818, lng: 80.2945, intensity: 0.7 }, 
    ]
  }
  
  export const mockStandLocations = [
    { 
      id: 1, 
      lat: 13.0827, 
      lng: 80.2707, 
      name: "Central Chennai Stand", 
      availableDrivers: 5,
      waitTime: 2,
      surgeDiscount: "30%",
      distance: "0.2 km"
    },
    { 
      id: 2, 
      lat: 13.0569, 
      lng: 80.2425, 
      name: "T Nagar Stand", 
      availableDrivers: 3,
      waitTime: 3,
      surgeDiscount: "25%",
      distance: "1.3 km"
    },
    { 
      id: 3, 
      lat: 13.0102, 
      lng: 80.2123, 
      name: "Guindy Stand", 
      availableDrivers: 4,
      waitTime: 4,
      surgeDiscount: "20%",
      distance: "2.1 km"
    },
    { 
      id: 4, 
      lat: 13.0836, 
      lng: 80.2181, 
      name: "Anna Nagar Stand", 
      availableDrivers: 6,
      waitTime: 1,
      surgeDiscount: "35%",
      distance: "1.8 km"
    },
    { 
      id: 5, 
      lat: 12.9165, 
      lng: 80.1525, 
      name: "Sholinganallur Stand", 
      availableDrivers: 8,
      waitTime: 1,
      surgeDiscount: "40%",
      distance: "3.5 km"
    }
  ]
  
  export const mockRewardsData = {
    tier: "Gold",
    points: 785,
    nextTier: "Platinum",
    pointsToNextTier: 215,
    badges: [
      "Peak Hero",
      "Weekend Warrior",
      "5-Star Driver",
      "Marathon Driver",
      "Passenger Favorite"
    ]
  }
  
  export const mockDriverProfile = {
    name: "Rahul Kumar",
    joiningDate: "Jan 2023",
    tier: "Gold",
    nextTier: "Platinum",
    progress: 70,
    totalPoints: 785,
    badges: [
      "Peak Hero",
      "Weekend Warrior",
      "5-Star Driver",
      "Marathon Driver",
      "Passenger Favorite"
    ]
  }
  
  export const mockRecentRides = [
    {
      date: "Today, 10:30 AM",
      destination: "Chennai Central",
      fare: 180,
      driver: "Suresh P.",
      type: "Individual"
    },
    {
      date: "Yesterday, 6:15 PM",
      destination: "T Nagar",
      fare: 150,
      driver: "Mohan K.",
      type: "Individual"
    },
    {
      date: "Mar 12, 9:45 AM",
      destination: "Sholinganallur",
      fare: 220,
      driver: "Priya S.",
      type: "Carpool"
    },
    {
      date: "Mar 10, 5:30 PM",
      destination: "Anna Nagar",
      fare: 190,
      driver: "Vijay R.",
      type: "Individual"
    },
    {
      date: "Mar 8, 8:15 AM",
      destination: "Airport",
      fare: 350,
      driver: "Anand M.",
      type: "Shuttle"
    }
  ]
  
  export const mockPricingData = {
    baseFare: 50,
    perKm: 12,
    perMinute: 1.5,
    surgeMultiplier: 1.5,
    standDiscount: 0.3
  }