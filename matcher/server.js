// server.js
const WebSocket = require('ws')
const http = require('http')
const { v4: uuidv4 } = require('uuid')

// Import initial mock data
const { mockDrivers } = require('./drivers')
const { mockUsers } = require('./drivers')

// Create HTTP server
const server = http.createServer()
const wss = new WebSocket.Server({ server })

// Store for active connections
const connections = {
	drivers: {},
	users: {},
	matcher: null
}

// Store for available drivers and users
const activePool = {
	drivers: [],
	users: []
}

// Ride matching state
const rides = {}

// Broadcast to all connections or specific user/driver
function broadcast(message, excludeId = null) {
	const data = JSON.stringify(message)
	
	wss.clients.forEach(client => {
		if (client.readyState === WebSocket.OPEN && client.id !== excludeId) {
			client.send(data)
		}
	})
}

function sendToClient(clientId, message) {
	// Find client in connections
	let targetClient = null
	
	// Check in drivers
	if (connections.drivers[clientId]) {
		targetClient = connections.drivers[clientId]
	} 
	// Check in users
	else if (connections.users[clientId]) {
		targetClient = connections.users[clientId]
	}
	
	if (targetClient && targetClient.socket.readyState === WebSocket.OPEN) {
		targetClient.socket.send(JSON.stringify(message))
		return true
	}
	
	console.log(`Failed to send message to client ${clientId} - not found or not connected`)
	return false
}

// Match driver with user
function matchDriverWithUser(userId, driverId) {
	// Find user in activePool first
	const userIndex = activePool.users.findIndex(u => u.id === userId)
	const driverIndex = activePool.drivers.findIndex(d => d.id === driverId)
	
	if (userIndex === -1 || driverIndex === -1) {
		console.log(`Match failed: User (${userId}) or driver (${driverId}) not found in active pool`)
		return {
			success: false,
			message: 'User or driver not found in active pool'
		}
	}
	
	const user = activePool.users[userIndex]
	const driver = activePool.drivers[driverIndex]
	
	// Create unique ride ID
	const rideId = `ride-${uuidv4()}`
	
	// Create the ride object
	rides[rideId] = {
		id: rideId,
		user,
		driver,
		status: 'pending',
		requestTime: new Date().toISOString(),
		pickupLocation: user.rideRequest.pickupLocation,
		dropLocation: user.rideRequest.dropLocation,
		estimatedFare: user.rideRequest.estimatedFare,
		estimatedDistance: user.rideRequest.estimatedDistance,
		estimatedTime: user.rideRequest.estimatedTime,
		scheduledTime: user.rideRequest.scheduledTime,
	}
	
	// Check if the user is connected before sending booking request
	if (!connections.users[userId]) {
		console.log(`User ${userId} not connected, cannot send booking request`)
		return {
			success: false,
			message: 'User not connected'
		}
	}
	
	// Send booking request to the user
	console.log(`Sending booking request to user ${userId}`)
	sendToClient(userId, {
		type: 'booking_request',
		rideId,
		driverId: driver.id,
		driverName: driver.name,
		driverRating: driver.rating,
		vehicleDetails: driver.vehicle,
		estimatedArrival: Math.floor(Math.random() * 5) + 3, // 3-8 minutes
		estimatedFare: user.rideRequest.estimatedFare,
		pickupTime: user.rideRequest.scheduledTime,
		pickup: user.rideRequest.pickupLocation.address,
		destination: user.rideRequest.dropLocation.address
	})
	
	return {
		success: true,
		rideId
	}
}

// WebSocket connection handler
wss.on('connection', (ws) => {
	// Assign a unique ID to this connection
	ws.id = uuidv4()
	
	console.log(`New connection: ${ws.id}`)
	
	// Handle messages from clients
	ws.on('message', (message) => {
		try {
			const data = JSON.parse(message)
			console.log('Received message:', data)
			
			// Handle different message types
			switch(data.type) {
				case 'driver_register':
					// Register this connection as a driver
					const driverId = data.driverId
					
					// Check if driver data exists in mock data
					const driverData = mockDrivers.find(d => d.id === driverId)
					if (!driverData) {
						ws.send(JSON.stringify({
							type: 'error',
							message: `Driver with ID ${driverId} not found in mock data`
						}))
						return
					}
					
					// Register the driver connection
					connections.drivers[driverId] = {
						id: driverId,
						socket: ws,
						status: 'available'
					}
					ws.clientType = 'driver'
					ws.clientId = driverId
					
					// Add driver to active pool if not already there
					if (!activePool.drivers.some(d => d.id === driverId)) {
						activePool.drivers.push(driverData)
					}
					
					console.log(`Driver registered: ${driverId}`)
					
					// Notify driver of successful registration
					ws.send(JSON.stringify({
						type: 'registration_success',
						message: 'Driver registered successfully',
						pool: {
							driversCount: Object.keys(connections.drivers).length,
							usersCount: Object.keys(connections.users).length
						}
					}))
					
					// Update matcher if connected
					if (connections.matcher) {
						connections.matcher.socket.send(JSON.stringify({
							type: 'pool_update',
							availableDrivers: activePool.drivers,
							availableUsers: activePool.users,
							connections: {
								driversCount: Object.keys(connections.drivers).length,
								usersCount: Object.keys(connections.users).length
							}
						}))
					}
					break
					
				case 'user_register':
					// Register this connection as a user
					const userId = data.userId
					
					// Check if user data exists in mock data
					const userData = mockUsers.find(u => u.id === userId)
					if (!userData) {
						ws.send(JSON.stringify({
							type: 'error',
							message: `User with ID ${userId} not found in mock data`
						}))
						return
					}
					
					// Register the user connection
					connections.users[userId] = {
						id: userId,
						socket: ws,
						status: 'looking'
					}
					ws.clientType = 'user'
					ws.clientId = userId
					
					// Add user to active pool if not already there
					if (!activePool.users.some(u => u.id === userId)) {
						activePool.users.push(userData)
					}
					
					console.log(`User registered: ${userId}`)
					
					// Notify user of successful registration
					ws.send(JSON.stringify({
						type: 'registration_success',
						message: 'User registered successfully',
						pool: {
							driversCount: Object.keys(connections.drivers).length,
							usersCount: Object.keys(connections.users).length
						}
					}))
					
					// Update matcher if connected
					if (connections.matcher) {
						connections.matcher.socket.send(JSON.stringify({
							type: 'pool_update',
							availableDrivers: activePool.drivers,
							availableUsers: activePool.users,
							connections: {
								driversCount: Object.keys(connections.drivers).length,
								usersCount: Object.keys(connections.users).length
							}
						}))
					}
					break
					
				case 'matcher_register':
					// Register this connection as the matcher
					connections.matcher = {
						socket: ws,
						id: ws.id
					}
					ws.clientType = 'matcher'
					
					console.log('Matcher registered')
					
					// Send available drivers and users to the matcher
					ws.send(JSON.stringify({
						type: 'pool_update',
						availableDrivers: activePool.drivers,
						availableUsers: activePool.users,
						connections: {
							driversCount: Object.keys(connections.drivers).length,
							usersCount: Object.keys(connections.users).length
						}
					}))
					break
					
				case 'match_request':
					// Manual match request from matcher
					if (ws.clientType !== 'matcher') {
						ws.send(JSON.stringify({
							type: 'error',
							message: 'Only matcher can request matches'
						}))
						return
					}
					
					const requestedUser = data.userId
					const requestedDriver = data.driverId
					
					// Validate that both user and driver exist in active pools
					const userExists = activePool.users.some(u => u.id === requestedUser)
					const driverExists = activePool.drivers.some(d => d.id === requestedDriver)
					
					if (!userExists || !driverExists) {
						ws.send(JSON.stringify({
							type: 'match_result',
							success: false,
							message: `Match failed: User (${requestedUser}) or driver (${requestedDriver}) not found in active pool`
						}))
						return
					}
					
					// Validate that both user and driver are connected
					const userConnected = connections.users[requestedUser] !== undefined
					const driverConnected = connections.drivers[requestedDriver] !== undefined
					
					if (!userConnected || !driverConnected) {
						ws.send(JSON.stringify({
							type: 'match_result',
							success: false,
							message: `Match failed: User (${requestedUser}) or driver (${requestedDriver}) not connected`
						}))
						return
					}
					
					const result = matchDriverWithUser(requestedUser, requestedDriver)
					
					ws.send(JSON.stringify({
						type: 'match_result',
						success: result.success,
						message: result.message || 'Match request sent',
						rideId: result.rideId
					}))
					break
					
				case 'booking_response':
					// User responding to booking request
					const { rideId, response } = data
					const ride = rides[rideId]
					
					if (!ride) {
						ws.send(JSON.stringify({
							type: 'error',
							message: 'Ride not found'
						}))
						return
					}
					
					if (response === 'accept') {
						// User accepted the ride
						ride.status = 'accepted'
						
						// Remove user and driver from active pools
						activePool.users = activePool.users.filter(u => u.id !== ride.user.id)
						activePool.drivers = activePool.drivers.filter(d => d.id !== ride.driver.id)
						
						// Check if driver is still connected
						if (!connections.drivers[ride.driver.id]) {
							ws.send(JSON.stringify({
								type: 'error',
								message: 'Driver is no longer connected, cannot complete booking'
							}))
							
							// Put user back in active pool
							if (!activePool.users.some(u => u.id === ride.user.id)) {
								activePool.users.push(ride.user)
							}
							
							return
						}
						
						// Notify the driver
						sendToClient(ride.driver.id, {
							type: 'ride_accepted',
							rideId,
							user: {
								id: ride.user.id,
								name: ride.user.name,
								rating: ride.user.rating
							},
							pickup: ride.pickupLocation,
							destination: ride.dropLocation,
							estimatedFare: ride.estimatedFare,
							timestamp: new Date().toISOString()
						})
						
						// Update matcher
						if (connections.matcher) {
							connections.matcher.socket.send(JSON.stringify({
								type: 'pool_update',
								availableDrivers: activePool.drivers,
								availableUsers: activePool.users,
								matchInfo: {
									rideId,
									status: 'accepted',
									user: ride.user.id,
									driver: ride.driver.id
								}
							}))
						}
					} else if (response === 'reject') {
						// User rejected the ride
						ride.status = 'rejected'
						
						// Put driver back in active pool if connected
						if (connections.drivers[ride.driver.id]) {
							// Check if driver is already in the pool
							if (!activePool.drivers.some(d => d.id === ride.driver.id)) {
								activePool.drivers.push(ride.driver)
								console.log(`Driver ${ride.driver.id} returned to active pool after rejection`)
							}
						}
						
						// Notify matcher
						if (connections.matcher) {
							connections.matcher.socket.send(JSON.stringify({
								type: 'match_rejected',
								rideId,
								userId: ride.user.id,
								driverId: ride.driver.id,
								activePool: {
									availableDrivers: activePool.drivers,
									availableUsers: activePool.users
								}
							}))
						}
					} else if (response === 'remind') {
						// User wants a reminder
						ride.status = 'remind'
						
						// Schedule a reminder in 30 seconds for demo
						setTimeout(() => {
							if (rides[rideId] && rides[rideId].status === 'remind') {
								// Check if user is still connected
								if (connections.users[ride.user.id]) {
									sendToClient(ride.user.id, {
										type: 'booking_reminder',
										rideId,
										driverId: ride.driver.id,
										driverName: ride.driver.name,
										pickupTime: ride.scheduledTime
									})
								} else {
									console.log(`Cannot send reminder: User ${ride.user.id} no longer connected`)
								}
							}
						}, 30000)
					}
					
					ws.send(JSON.stringify({
						type: 'booking_processed',
						rideId,
						status: ride.status
					}))
					break
					
				case 'driver_status': {
					// Driver updating their status (available/unavailable)
					if (ws.clientType !== 'driver') {
						ws.send(JSON.stringify({
							type: 'error',
							message: 'Only drivers can update status'
						}))
						return
					}
					
					const { isAvailable, location } = data
					const driverId = ws.clientId
					
					// Update driver status in connections
					if (connections.drivers[driverId]) {
						connections.drivers[driverId].status = isAvailable ? 'available' : 'unavailable'
					} else {
						ws.send(JSON.stringify({
							type: 'error',
							message: 'Driver not registered'
						}))
						return
					}
					
					// Find driver in mock data
					const driver = mockDrivers.find(d => d.id === driverId)
					if (!driver) {
						ws.send(JSON.stringify({
							type: 'error',
							message: 'Driver data not found'
						}))
						return
					}
					
					// Update driver in active pool
					const driverIndex = activePool.drivers.findIndex(d => d.id === driverId)
					
					if (isAvailable) {
						if (driverIndex >= 0) {
							// Update existing driver in pool
							activePool.drivers[driverIndex].availableForRides = true
							
							if (location) {
								activePool.drivers[driverIndex].currentLocation = location
							}
						} else {
							// Add driver to pool
							const driverCopy = JSON.parse(JSON.stringify(driver))
							driverCopy.availableForRides = true
							
							if (location) {
								driverCopy.currentLocation = location
							}
							
							activePool.drivers.push(driverCopy)
						}
					} else if (driverIndex >= 0) {
						// Remove driver from active pool when unavailable
						activePool.drivers.splice(driverIndex, 1)
					}
					
					// Notify matcher of pool update
					if (connections.matcher) {
						connections.matcher.socket.send(JSON.stringify({
							type: 'pool_update',
							availableDrivers: activePool.drivers,
							availableUsers: activePool.users,
							connections: {
								driversCount: Object.keys(connections.drivers).length,
								usersCount: Object.keys(connections.users).length
							}
						}))
					}
					
					ws.send(JSON.stringify({
						type: 'status_updated',
						status: isAvailable ? 'available' : 'unavailable'
					}))
					break
				}
					
				default:
					console.log('Unknown message type:', data.type)
					ws.send(JSON.stringify({
						type: 'error',
						message: `Unknown message type: ${data.type}`
					}))
			}
		} catch (error) {
			console.error('Error handling message:', error)
			ws.send(JSON.stringify({
				type: 'error',
				message: 'Error processing message: ' + error.message
			}))
		}
	})
	
	// Handle client disconnect
	ws.on('close', () => {
		console.log(`Connection closed: ${ws.id}, client type: ${ws.clientType}, client ID: ${ws.clientId}`)
		
		// Remove from appropriate connection pool
		if (ws.clientType === 'driver' && ws.clientId) {
			delete connections.drivers[ws.clientId]
			
			// Remove from active pool
			const driverIndex = activePool.drivers.findIndex(d => d.id === ws.clientId)
			if (driverIndex !== -1) {
				activePool.drivers.splice(driverIndex, 1)
			}
		} else if (ws.clientType === 'user' && ws.clientId) {
			delete connections.users[ws.clientId]
			
			// Remove from active pool
			const userIndex = activePool.users.findIndex(u => u.id === ws.clientId)
			if (userIndex !== -1) {
				activePool.users.splice(userIndex, 1)
			}
		} else if (ws.clientType === 'matcher') {
			connections.matcher = null
		}
		
		// Update matcher with new pool
		if (connections.matcher && connections.matcher.socket.readyState === WebSocket.OPEN) {
			connections.matcher.socket.send(JSON.stringify({
				type: 'pool_update',
				availableDrivers: activePool.drivers,
				availableUsers: activePool.users,
				connections: {
					driversCount: Object.keys(connections.drivers).length,
					usersCount: Object.keys(connections.users).length
				}
			}))
		}
	})
	
	// Send initial connection acknowledgment
	ws.send(JSON.stringify({
		type: 'connection_established',
		message: 'Connected to ride-matching service',
		connectionId: ws.id
	}))
})

// Start the server
const PORT = 5005
server.listen(PORT, () => {
	console.log(`WebSocket server running on port ${PORT}`)
})