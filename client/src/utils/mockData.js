export const mockDriverLocation = {
	lat: 13.0827,
	lng: 80.2707
}

export const mockUserLocation = { lat: 12.9716, lng: 77.5946 }

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
		{ lat: 12.9010, lng: 80.2279, intensity: 0.6 }
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
		{ lat: 13.0406, lng: 80.2339, intensity: 0.8 }
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
		{ lat: 13.0818, lng: 80.2945, intensity: 0.7 }
	]
}

export const mockStandLocations = [
	{
		id: 1,
		lat: 13.0827,
		lng: 80.2707,
		name: 'Central Chennai Stand',
		availableDrivers: 5,
		waitTime: 2,
		surgeDiscount: '30%',
		distance: '0.2 km'
	},
	{
		id: 2,
		lat: 13.0569,
		lng: 80.2425,
		name: 'T Nagar Stand',
		availableDrivers: 3,
		waitTime: 3,
		surgeDiscount: '25%',
		distance: '1.3 km'
	},
	{
		id: 3,
		lat: 13.0102,
		lng: 80.2123,
		name: 'Guindy Stand',
		availableDrivers: 4,
		waitTime: 4,
		surgeDiscount: '20%',
		distance: '2.1 km'
	},
	{
		id: 4,
		lat: 13.0836,
		lng: 80.2181,
		name: 'Anna Nagar Stand',
		availableDrivers: 6,
		waitTime: 1,
		surgeDiscount: '35%',
		distance: '1.8 km'
	},
	{
		id: 5,
		lat: 12.9165,
		lng: 80.1525,
		name: 'Sholinganallur Stand',
		availableDrivers: 8,
		waitTime: 1,
		surgeDiscount: '40%',
		distance: '3.5 km'
	}
]

export const mockRewardsData = {
	tier: 'Gold',
	points: 785,
	nextTier: 'Platinum',
	pointsToNextTier: 215,
	badges: [
		'Peak Hero',
		'Weekend Warrior',
		'5-Star Driver',
		'Marathon Driver',
		'Passenger Favorite'
	]
}

export const mockDriverProfile = {
	name: 'Rahul Kumar',
	joiningDate: 'Jan 2023',
	tier: 'Gold',
	nextTier: 'Platinum',
	progress: 110,
	totalPoints: 785,
	badges: [
		'Peak Hero',
		'Weekend Warrior',
		'5-Star Driver',
		'Marathon Driver',
		'Passenger Favorite'
	]
}

export const mockRecentRides = [
	{
		date: 'Today, 10:30 AM',
		destination: 'Chennai Central',
		fare: 180,
		driver: 'Suresh P.',
		type: 'Individual'
	},
	{
		date: 'Yesterday, 6:15 PM',
		destination: 'T Nagar',
		fare: 150,
		driver: 'Mohan K.',
		type: 'Individual'
	},
	{
		date: 'Mar 12, 9:45 AM',
		destination: 'Sholinganallur',
		fare: 220,
		driver: 'Priya S.',
		type: 'Carpool'
	},
	{
		date: 'Mar 10, 5:30 PM',
		destination: 'Anna Nagar',
		fare: 190,
		driver: 'Vijay R.',
		type: 'Individual'
	},
	{
		date: 'Mar 8, 8:15 AM',
		destination: 'Airport',
		fare: 350,
		driver: 'Anand M.',
		type: 'Shuttle'
	}
]

export const mockPricingData = {
	baseFare: 50,
	perKm: 12,
	perMinute: 1.5,
	surgeMultiplier: 1.5,
	standDiscount: 0.3
}

export const mockShuttleRoutes = [
	{
		id: 1,
		name: 'IT Corridor Express',
		from: 'Central Station',
		to: 'Siruseri IT Park',
		stops: 6,
		fare: 40,
		regularFare: 150,
		schedule: ['7:00 AM', '8:00 AM', '9:00 AM', '5:00 PM', '6:00 PM', '7:00 PM'],
		status: 'Running'
	},
	{
		id: 2,
		name: 'Airport Shuttle',
		from: 'T Nagar',
		to: 'Airport',
		stops: 4,
		fare: 60,
		regularFare: 180,
		schedule: ['6:00 AM', '8:00 AM', '10:00 AM', '12:00 PM', '2:00 PM', '4:00 PM', '6:00 PM', '8:00 PM'],
		status: 'Running'
	},
	{
		id: 3,
		name: 'Anna Nagar - Velachery',
		from: 'Anna Nagar',
		to: 'Velachery',
		stops: 8,
		fare: 35,
		regularFare: 130,
		schedule: ['7:30 AM', '8:30 AM', '9:30 AM', '5:30 PM', '6:30 PM', '7:30 PM'],
		status: 'Running'
	},
	{
		id: 4,
		name: 'North Chennai Connect',
		from: 'Broadway',
		to: 'Tiruvottiyur',
		stops: 7,
		fare: 30,
		regularFare: 120,
		schedule: ['7:15 AM', '8:15 AM', '9:15 AM', '5:15 PM', '6:15 PM', '7:15 PM'],
		status: 'Launching Soon'
	}
]

export const mockScheduleRoutes = [
	{
		id: 1,
		name: 'Indiranagar IT Express',
		from: 'Majestic',
		to: 'Electronic City',
		stops: ['Majestic', 'Indiranagar', 'Domlur', 'Koramangala', 'HSR Layout', 'Electronic City'],
		schedule: { 
			weekday: ['7:00 AM', '8:00 AM', '9:00 AM'], 
			weekend: ['8:00 AM', '10:00 AM'] 
		},
		fare: 40,
		regularFare: 150,
		status: 'Running'
	},
	{
		id: 2,
		name: 'Whitefield Tech Shuttle',
		from: 'Silk Board',
		to: 'Whitefield',
		stops: ['Silk Board', 'BTM Layout', 'Marathahalli', 'ITPL', 'Whitefield'],
		schedule: { 
			weekday: ['6:00 AM', '8:00 AM', '10:00 AM'], 
			weekend: ['6:00 AM', '9:00 AM'] 
		},
		fare: 60,
		regularFare: 180,
		status: 'Running'
	}
]

export const mockAlertInfo = {
	shuttleInfo: 'Shuttles offer fixed-route transportation at significantly lower prices during peak hours. Each shuttle can accommodate up to 20 passengers.',
	savingsInfo: 'Using shuttle services can save you up to 70% compared to individual rides during peak hours.',
	bookingAlert: 'Shuttles follow fixed routes with designated stops. Book in advance to secure your seat.'
}

export const mockPromoData = [
	'₹50 off on next ride',
	'Refer a friend and earn ₹100',
	'Get 20% off on carpooling',
	'Free shuttle ride on weekends'
]

export const mockPeakHourTips = [
	'Book 15 minutes in advance during peak hours',
	'Consider carpooling to save money and time',
	'Check shuttle services for common routes',
	'Use designated pickup stands for faster service'
]

export const mockCarpoolMatches = [
	{
		id: 1,
		driver: "Ankit S.",
		rating: 4.8,
		departureTime: "8:30 AM",
		timeOffset: -15, 
		passengers: 2,
		maxPassengers: 3,
		fare: 80,
		regularFare: 160,
		pickupDistance: 0.2,
		dropoffDistance: 0.3,
		route: "Via Anna Nagar"
	},
	{
		id: 2,
		driver: "Priya M.",
		rating: 4.9,
		departureTime: "8:45 AM",
		timeOffset: 0, 
		passengers: 1,
		maxPassengers: 3,
		fare: 90,
		regularFare: 180,
		pickupDistance: 0.1,
		dropoffDistance: 0.2,
		route: "Via T. Nagar"
	},
	{
		id: 3,
		driver: "Rajesh K.",
		rating: 4.7,
		departureTime: "9:00 AM",
		timeOffset: 15, 
		passengers: 2,
		maxPassengers: 4,
		fare: 110,
		regularFare: 150,
		pickupDistance: 0.3,
		dropoffDistance: 0.4,
		route: "Via Guindy"
	},
	{
		id: 4,
		driver: "Divya S.",
		rating: 4.6,
		departureTime: "8:15 AM",
		timeOffset: -30, 
		passengers: 1,
		maxPassengers: 3,
		fare: 65,
		regularFare: 140,
		pickupDistance: 0.4,
		dropoffDistance: 0.5,
		route: "Via Adyar"
	},
	{
		id: 5,
		driver: "Vikram M.",
		rating: 4.9,
		departureTime: "9:15 AM",
		timeOffset: 30, 
		passengers: 2,
		maxPassengers: 4,
		fare: 85,
		regularFare: 170,
		pickupDistance: 0.2,
		dropoffDistance: 0.3,
		route: "Via Chetpet"
	}
]

export const mockFilterOptions = {
	timeFlexibility: [
		{ value: 15, label: '±15 min' },
		{ value: 30, label: '±30 min' },
		{ value: 60, label: '±1 hour' }
	],
	sortBy: [
		{ value: 'price', label: 'Price' },
		{ value: 'time', label: 'Departure Time' },
		{ value: 'rating', label: 'Driver Rating' }
	]
}

export const mockAlertMessages = {
	carpoolSavings: 'Carpooling reduces your fare by up to 50% during peak hours!',
	carpoolBenefits: 'Carpooling saves you up to 50% during peak hours and reduces congestion!',
	noCarpools: 'No carpools available for your route and time. Try adjusting your criteria.',
	enterDestination: 'Enter your destination and time to find available carpools.'
}

export const mockIcons = {
	info: '',
	check: '',
	warning: '',
	star: '',
	call: '',
	chat: ''
}