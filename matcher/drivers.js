// drivers.js
export const mockDrivers = [
	{
		id: 'd-10234',
		name: 'Rajesh Kumar',
		phone: '+91 9876543210',
		email: 'rajesh.k@example.com',
		rating: 4.8,
		profileImage: 'https://i.pravatar.cc/150?img=32',
		vehicle: {
			model: 'Maruti Suzuki Swift',
			number: 'KA 01 AB 1234',
			color: 'White',
			type: 'Hatchback'
		},
		accountStatus: 'active',
		onboardingDate: '2022-06-15',
		currentLocation: {
			lat: 12.9716,
			lng: 77.5946
		},
		preferredAreas: ['Indiranagar', 'Koramangala', 'Whitefield'],
		workingHours: {
			start: '08:00',
			end: '20:00'
		},
		serviceRadius: 10, // in km
		completedRides: 1247,
		totalEarnings: 245800,
		availableForRides: true,
		activeRide: null,
		languages: ['English', 'Hindi', 'Kannada'],
		preferences: {
			acceptsCash: true,
			acceptsDigitalPayments: true,
			acEnabled: true
		},
		dailyStats: {
			earnings: 1250,
			completedRides: 8,
			declinedRides: 2,
			acceptanceRate: 80,
			onlineHours: 7.5
		}
	},
	{
		id: 'd-10235',
		name: 'Priya Singh',
		phone: '+91 9876543211',
		email: 'priya.s@example.com',
		rating: 4.9,
		profileImage: 'https://i.pravatar.cc/150?img=20',
		vehicle: {
			model: 'Honda City',
			number: 'KA 05 MJ 5678',
			color: 'Silver',
			type: 'Sedan'
		},
		accountStatus: 'active',
		onboardingDate: '2021-08-10',
		currentLocation: {
			lat: 12.9782,
			lng: 77.6408
		},
		preferredAreas: ['HSR Layout', 'BTM Layout', 'Electronic City'],
		workingHours: {
			start: '09:00',
			end: '21:00'
		},
		serviceRadius: 12, // in km
		completedRides: 2135,
		totalEarnings: 392600,
		availableForRides: true,
		activeRide: null,
		languages: ['English', 'Hindi', 'Tamil'],
		preferences: {
			acceptsCash: true,
			acceptsDigitalPayments: true,
			acEnabled: true
		},
		dailyStats: {
			earnings: 890,
			completedRides: 6,
			declinedRides: 1,
			acceptanceRate: 86,
			onlineHours: 5.2
		}
	}
]

// users.js
export const mockUsers = [
	{
		id: 'u-20456',
		name: 'Amit Patel',
		phone: '+91 9898989898',
		email: 'amit.p@example.com',
		rating: 4.7,
		profileImage: 'https://i.pravatar.cc/150?img=12',
		accountStatus: 'active',
		registrationDate: '2023-01-10',
		currentLocation: {
			lat: 12.9716,
			lng: 77.5946, // Near Rajesh (driver 1)
			address: 'Cubbon Park, Bengaluru'
		},
		savedLocations: [
			{
				name: 'Home',
				lat: 12.9354,
				lng: 77.6237,
				address: '123 Residency Road, Bengaluru'
			},
			{
				name: 'Work',
				lat: 12.9780,
				lng: 77.7575,
				address: 'Whitefield Tech Park, Bengaluru'
			}
		],
		paymentMethods: [
			{
				id: 'pm-1',
				type: 'card',
				last4: '4242',
				isDefault: true
			},
			{
				id: 'pm-2',
				type: 'upi',
				handle: 'amit@upi',
				isDefault: false
			}
		],
		rideHistory: [
			{
				id: 'ride-10001',
				date: '2023-10-20',
				pickup: 'Home',
				dropoff: 'Work',
				fare: 320,
				driverId: 'd-10235',
				rating: 5
			}
		],
		preferences: {
			favoriteDrivers: ['d-10235'],
			preferredPayment: 'card'
		},
		rideRequest: {
			pickupLocation: {
				lat: 12.9716,
				lng: 77.5946,
				address: 'Cubbon Park, Bengaluru'
			},
			dropLocation: {
				lat: 12.9780,
				lng: 77.7575,
				address: 'Whitefield Tech Park, Bengaluru'
			},
			scheduledTime: '18:30',
			estimatedFare: 350,
			estimatedDistance: 12.4,
			estimatedTime: 45,
			vehicleType: 'any',
			paymentMethod: 'card'
		}
	},
	{
		id: 'u-20457',
		name: 'Meera Sharma',
		phone: '+91 9898989899',
		email: 'meera.s@example.com',
		rating: 4.9,
		profileImage: 'https://i.pravatar.cc/150?img=5',
		accountStatus: 'active',
		registrationDate: '2022-05-15',
		currentLocation: {
			lat: 12.9782,
			lng: 77.6408, // Near Priya (driver 2)
			address: 'Indiranagar, Bengaluru'
		},
		savedLocations: [
			{
				name: 'Home',
				lat: 12.9767,
				lng: 77.6440,
				address: '456 100ft Road, Indiranagar, Bengaluru'
			},
			{
				name: 'Work',
				lat: 12.9150,
				lng: 77.6500,
				address: 'Koramangala Tech Hub, Bengaluru'
			}
		],
		paymentMethods: [
			{
				id: 'pm-3',
				type: 'upi',
				handle: 'meera@upi',
				isDefault: true
			}
		],
		rideHistory: [
			{
				id: 'ride-10002',
				date: '2023-10-22',
				pickup: 'Home',
				dropoff: 'Work',
				fare: 220,
				driverId: 'd-10234',
				rating: 4
			}
		],
		preferences: {
			favoriteDrivers: ['d-10234'],
			preferredPayment: 'upi'
		},
		rideRequest: {
			pickupLocation: {
				lat: 12.9782,
				lng: 77.6408,
				address: 'Indiranagar, Bengaluru'
			},
			dropLocation: {
				lat: 12.9150,
				lng: 77.6500,
				address: 'Koramangala Tech Hub, Bengaluru'
			},
			scheduledTime: '18:30',
			estimatedFare: 220,
			estimatedDistance: 7.8,
			estimatedTime: 25,
			vehicleType: 'hatchback',
			paymentMethod: 'upi'
		}
	},
	{
		id: 'u-20458',
		name: 'Vikram Reddy',
		phone: '+91 9898989900',
		email: 'vikram.r@example.com',
		rating: 4.6,
		profileImage: 'https://i.pravatar.cc/150?img=15',
		accountStatus: 'active',
		registrationDate: '2023-03-20',
		currentLocation: {
			lat: 12.9659,
			lng: 77.6065, // Somewhat near both drivers
			address: 'MG Road, Bengaluru'
		},
		savedLocations: [
			{
				name: 'Home',
				lat: 12.9540,
				lng: 77.6150,
				address: '789 Richmond Road, Bengaluru'
			},
			{
				name: 'Work',
				lat: 12.9791,
				lng: 77.6269,
				address: 'Embassy Tech Square, Bengaluru'
			}
		],
		paymentMethods: [
			{
				id: 'pm-4',
				type: 'card',
				last4: '8765',
				isDefault: false
			},
			{
				id: 'pm-5',
				type: 'upi',
				handle: 'vikram@upi',
				isDefault: true
			}
		],
		rideHistory: [
			{
				id: 'ride-10003',
				date: '2023-10-21',
				pickup: 'Home',
				dropoff: 'Work',
				fare: 180,
				driverId: 'd-10234',
				rating: 5
			}
		],
		preferences: {
			favoriteDrivers: [],
			preferredPayment: 'upi'
		},
		rideRequest: {
			pickupLocation: {
				lat: 12.9659,
				lng: 77.6065,
				address: 'MG Road, Bengaluru'
			},
			dropLocation: {
				lat: 12.9791,
				lng: 77.6269,
				address: 'Embassy Tech Square, Bengaluru'
			},
			scheduledTime: '18:30',
			estimatedFare: 180,
			estimatedDistance: 5.2,
			estimatedTime: 20,
			vehicleType: 'sedan',
			paymentMethod: 'upi'
		}
	}
]