export const DriverDashboard = {
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
      pointsToNextLevel: 10,
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
  