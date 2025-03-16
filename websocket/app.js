// server.js
const http = require('http')
const express = require('express')
const WebSocket = require('ws')
const path = require('path')
const cors = require('cors')

// Initialize Express app
const app = express()
const server = http.createServer(app)

// Create WebSocket server
const wss = new WebSocket.Server({ server })

// Enable CORS
app.use(cors())
app.use(express.json())
app.use(express.static(path.join(__dirname, 'build')))

// Store connected clients with their roles
const clients = new Map()
const drivers = new Map()
const users = new Map()
const rides = new Map()

// Debug helper function
function logStatus() {
	console.log(`Stats - Clients: ${clients.size}, Drivers: ${drivers.size}, Users: ${users.size}, Rides: ${rides.size}`)
}

// WebSocket connection handler
wss.on('connection', (ws) => {
	// Generate a temporary ID
	const clientId = 'client-' + Math.random().toString(36).substr(2, 9)
	
	// Add new client to the set
	clients.set(clientId, { ws, role: 'unknown', status: 'connected' })
	console.log('Client connected. Total clients:', clients.size)
	
	// Send welcome message
	ws.send(JSON.stringify({
		type: 'info',
		message: 'Connected to WebSocket server',
		clientId
	}))
	
	// Handle messages from client
	ws.on('message', (message) => {
		try {
			const data = JSON.parse(message.toString())
			console.log('Received message type:', data.type, 'from clientId:', clientId)
			
			// Process different message types
			switch (data.type) {
				case 'driver_status':
					handleDriverStatus(clientId, data)
					break
					
				case 'booking_request':
					handleBookingRequest(clientId, data)
					break
					
				case 'driver_accepted':
					handleDriverAccepted(clientId, data)
					break
					
				case 'driver_declined':
					handleDriverDeclined(clientId, data)
					break
					
				case 'cancel_ride':
					handleCancelRide(clientId, data)
					break
					
				case 'user_identity':
					handleUserIdentity(clientId, data)
					break
					
				default:
					// Echo message back to sender for confirmation
					ws.send(JSON.stringify({
						type: 'confirmation',
						message: 'Message received: ' + message.toString()
					}))
			}
			
			// Log system status after each message
			logStatus()
		} catch (error) {
			console.error('Error processing message:', error)
			ws.send(JSON.stringify({
				type: 'error',
				message: 'Invalid message format'
			}))
		}
	})
	
	// Handle client disconnection
	ws.on('close', () => {
		const client = clients.get(clientId)
		if (client) {
			if (client.role === 'driver') {
				drivers.delete(client.driverId)
			} else if (client.role === 'user') {
				users.delete(client.userId)
			}
			clients.delete(clientId)
		}
		console.log('Client disconnected. Remaining clients:', clients.size)
	})
})

// Handle user identity registration
function handleUserIdentity(clientId, data) {
	const client = clients.get(clientId)
	if (client) {
		client.role = 'user'
		client.userId = data.userId
		
		// Store in users map
		users.set(data.userId, clientId)
		
		console.log(`User ${data.userId} registered with client ${clientId}`)
		
		// Confirm registration
		client.ws.send(JSON.stringify({
			type: 'identity_confirmed',
			userId: data.userId
		}))
	}
}

// Handle driver status updates
function handleDriverStatus(clientId, data) {
	const client = clients.get(clientId)
	if (client) {
		// Update client role
		client.role = 'driver'
		client.status = data.isAvailable ? 'available' : 'busy'
		client.location = data.location
		client.driverId = data.driverId
		
		// Add to drivers map using driverId as key
		drivers.set(data.driverId, clientId)
		
		// Confirm update
		client.ws.send(JSON.stringify({
			type: 'status_updated',
			status: client.status
		}))
		
		console.log(`Driver ${data.driverId} (${clientId}) is now ${client.status}. Total drivers: ${drivers.size}`)
	}
}

// Handle booking requests
function handleBookingRequest(clientId, data) {
	const client = clients.get(clientId)
	if (client) {
		// Update client role
		client.role = 'user'
		client.userId = data.userId
		
		// Store in users map
		users.set(data.userId, clientId)
		
		// Create a ride entry
		const rideId = 'ride-' + Math.random().toString(36).substr(2, 9)
		rides.set(rideId, {
			id: rideId,
			userId: data.userId,
			userClientId: clientId,
			pickupLocation: data.pickupLocation,
			destination: data.destination,
			vehicleType: data.vehicleType,
			estimatedFare: data.estimatedFare,
			status: 'pending',
			timestamp: data.timestamp,
			paymentMethod: data.paymentMethod
		})
		
		// Confirm booking request receipt
		client.ws.send(JSON.stringify({
			type: 'booking_received',
			rideId,
			message: 'Looking for drivers'
		}))
		
		// Find available drivers
		let availableDriversFound = false
		for (const [driverId, clientId] of drivers.entries()) {
			const driver = clients.get(clientId)
			if (driver && driver.status === 'available') {
				// Send booking request to driver
				driver.ws.send(JSON.stringify({
					type: 'booking_request',
					rideId,
					userId: data.userId,
					userName: 'User ' + data.userId.substr(-4),
					pickupLocation: data.pickupLocation,
					destination: data.destination,
					estimatedFare: data.estimatedFare,
					estimatedDistance: calculateDistance(driver.location, data.pickupLocation),
					timestamp: data.timestamp
				}))
				availableDriversFound = true
			}
		}
		
		if (!availableDriversFound) {
			// No available drivers
			client.ws.send(JSON.stringify({
				type: 'no_drivers',
				message: 'No drivers available at the moment. Please try again later.'
			}))
		}
		
		console.log(`Booking request from user ${data.userId} (${clientId}). Ride ID: ${rideId}`)
	}
}

// Handle driver accepting a ride
function handleDriverAccepted(clientId, data) {
	const driver = clients.get(clientId)
	if (driver) {
		// Update driver status
		driver.status = 'busy'
		driver.currentRide = data.rideId
		
		const ride = rides.get(data.rideId)
		if (ride) {
			// Update ride status
			ride.status = 'accepted'
			ride.driverId = data.driverId
			ride.driverClientId = clientId
			ride.driver = data.driver
			
			console.log(`Driver ${data.driverId} (${clientId}) accepted ride ${data.rideId} for user ${ride.userId}`)
			
			// Find user and notify
			const userClientId = users.get(ride.userId)
			const userClient = clients.get(userClientId)
			
			if (userClient) {
				console.log(`Notifying user ${ride.userId} (${userClientId}) about driver acceptance`)
				userClient.ws.send(JSON.stringify({
					type: 'driver_accepted',
					rideId: data.rideId,
					driver: data.driver,
					estimatedArrival: data.estimatedArrival || 5
				}))
			} else {
				console.log(`User ${ride.userId} not found or disconnected`)
			}
		} else {
			console.log(`Ride ${data.rideId} not found when driver ${data.driverId} accepted`)
		}
	}
}

// Handle driver declining a ride
function handleDriverDeclined(clientId, data) {
	const ride = rides.get(data.rideId)
	if (ride && ride.status === 'pending') {
		// Try to find another driver
		let anotherDriverFound = false
		for (const [driverId, driverClientId] of drivers.entries()) {
			if (driverClientId !== clientId) {
				const driver = clients.get(driverClientId)
				if (driver && driver.status === 'available') {
					// Send booking request to another driver
					driver.ws.send(JSON.stringify({
						type: 'booking_request',
						rideId: data.rideId,
						userId: ride.userId,
						userName: 'User ' + ride.userId.substr(-4),
						pickupLocation: ride.pickupLocation,
						destination: ride.destination,
						estimatedFare: ride.estimatedFare,
						timestamp: ride.timestamp
					}))
					anotherDriverFound = true
					break
				}
			}
		}
		
		if (!anotherDriverFound) {
			// No other drivers available
			const userClientId = users.get(ride.userId)
			const userClient = clients.get(userClientId)
			
			if (userClient) {
				userClient.ws.send(JSON.stringify({
					type: 'no_drivers',
					rideId: data.rideId,
					message: 'All drivers are busy. Please try again later.'
				}))
			}
		}
		
		console.log(`Driver ${data.driverId} declined ride ${data.rideId}`)
	}
}

// Handle cancellation of a ride
function handleCancelRide(clientId, data) {
	// Find ride by user ID
	let cancelledRide = null
	for (const [rideId, ride] of rides.entries()) {
		if (ride.userId === data.userId) {
			cancelledRide = ride
			// Update ride status
			ride.status = 'cancelled'
			
			// Find driver and notify
			if (ride.driverClientId) {
				const driverClient = clients.get(ride.driverClientId)
				if (driverClient) {
					driverClient.ws.send(JSON.stringify({
						type: 'ride_cancelled',
						rideId,
						message: 'Ride was cancelled by the user'
					}))
					
					// Update driver status back to available
					driverClient.status = 'available'
					driverClient.currentRide = null
				}
			}
			
			// Also notify the user for confirmation
			const userClientId = users.get(ride.userId)
			if (userClientId) {
				const userClient = clients.get(userClientId)
				if (userClient) {
					userClient.ws.send(JSON.stringify({
						type: 'ride_cancelled',
						rideId,
						message: 'Your ride has been cancelled'
					}))
				}
			}
			
			console.log(`Ride ${rideId} cancelled by user ${data.userId}`)
			break
		}
	}
	
	if (!cancelledRide) {
		const client = clients.get(clientId)
		if (client) {
			client.ws.send(JSON.stringify({
				type: 'error',
				message: 'No active ride found to cancel'
			}))
		}
	}
}

// REST API route to send a message to all clients
app.post('/api/send', (req, res) => {
	const { message } = req.body
	
	if (!message) {
		return res.status(400).json({ error: 'Message is required' })
	}
	
	// Broadcast message to all connected clients
	const broadcastMessage = JSON.stringify({
		type: 'broadcast',
		message: message,
		timestamp: new Date().toISOString()
	})
	
	for (const client of clients.values()) {
		if (client.ws.readyState === WebSocket.OPEN) {
			client.ws.send(broadcastMessage)
		}
	}
	
	res.json({ success: true, clientCount: clients.size })
})

// REST API endpoint to get status
app.get('/api/status', (req, res) => {
	res.json({
		clientsCount: clients.size,
		driversCount: drivers.size,
		usersCount: users.size,
		ridesCount: rides.size
	})
})

// Simple distance calculation helper
function calculateDistance(point1, point2) {
	if (!point1 || !point2) return 0
	
	// Simplified distance calculation
	const latDiff = (point1.lat - point2.lat) * 111 // approx 111km per degree
	const lngDiff = (point1.lng - point2.lng) * 111 * Math.cos(point1.lat * Math.PI / 180)
	return Math.sqrt(latDiff * latDiff + lngDiff * lngDiff).toFixed(1)
}

// Serve React app for any other routes
app.get('*', (req, res) => {
	res.sendFile(path.join(__dirname, 'build', 'index.html'))
})

// Start the server
const PORT = process.env.PORT || 5000
server.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
})