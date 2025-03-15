'use client'

import { useState, useEffect } from 'react'
import useSocket from '@/hooks/useSocket'
import Navbar from '@/components/ui/Navbar'
import { motion } from 'framer-motion'

export default function MatcherPage() {
	// Socket connection
	const { isConnected, lastMessage, sendMessage } = useSocket('ws://localhost:5005')
	
	// Pool state
	const [availableDrivers, setAvailableDrivers] = useState([])
	const [availableUsers, setAvailableUsers] = useState([])
	const [connections, setConnections] = useState({ driversCount: 0, usersCount: 0 })
	const [matchHistory, setMatchHistory] = useState([])
	const [isMatchingAll, setIsMatchingAll] = useState(false)
	
	// Register as matcher on connection
	useEffect(() => {
		if (isConnected) {
			sendMessage({
				type: 'matcher_register'
			})
		}
	}, [isConnected, sendMessage])
	
	// Handle incoming messages
	useEffect(() => {
		if (!lastMessage) return
		
		const { type } = lastMessage
		
		switch (type) {
			case 'pool_update':
				// Update pools of available drivers and users
				if (lastMessage.availableDrivers) {
					setAvailableDrivers(lastMessage.availableDrivers)
				}
				if (lastMessage.availableUsers) {
					setAvailableUsers(lastMessage.availableUsers)
				}
				if (lastMessage.connections) {
					setConnections(lastMessage.connections)
				}
				
				// If match info is provided, add to history
				if (lastMessage.matchInfo) {
					const { matchInfo } = lastMessage
					
					setMatchHistory(prev => [
						{
							...matchInfo,
							timestamp: new Date().toISOString()
						},
						...prev
					])
				}
				break
				
			case 'match_result':
				// Handle match result
				const matchResult = {
					success: lastMessage.success,
					message: lastMessage.message,
					rideId: lastMessage.rideId,
					timestamp: new Date().toISOString(),
					status: 'pending'
				}
				
				setMatchHistory(prev => [matchResult, ...prev])
				break
				
			case 'match_rejected':
				// Update match history for rejected match
				setMatchHistory(prev => 
					prev.map(match => 
						match.rideId === lastMessage.rideId
							? { ...match, status: 'rejected' }
							: match
					)
				)
				break
		}
	}, [lastMessage])
	
	// Function to match a specific driver and user
	const matchDriverWithUser = (userId, driverId) => {
		sendMessage({
			type: 'match_request',
			userId,
			driverId
		})
	}
	
	// Function to match all available drivers and users
	const matchAll = () => {
		setIsMatchingAll(true)
		
		// Match each user with an available driver
		const drivers = [...availableDrivers]
		const users = [...availableUsers]
		
		if (drivers.length === 0 || users.length === 0) {
			setIsMatchingAll(false)
			return
		}
		
		// Match each user with a driver using a simple algorithm
		// In a real app, you'd use distance, preferences, etc.
		users.forEach((user, index) => {
			if (index < drivers.length) {
				const driver = drivers[index]
				
				// Introduce a small delay between matches
				setTimeout(() => {
					matchDriverWithUser(user.id, driver.id)
				}, index * 1000) // 1 second between each match
			}
		})
		
		// End matching after all matches have been made
		setTimeout(() => {
			setIsMatchingAll(false)
		}, users.length * 1000 + 500)
	}
	
	// Calculate distance between two coordinates (simplified version)
	const calculateDistance = (lat1, lon1, lat2, lon2) => {
		const R = 6371 // Radius of the earth in km
		const dLat = deg2rad(lat2 - lat1)
		const dLon = deg2rad(lon2 - lon1)
		const a =
			Math.sin(dLat / 2) * Math.sin(dLat / 2) +
			Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
		return R * c // Distance in km
	}
	
	const deg2rad = (deg) => {
		return deg * (Math.PI / 180)
	}
	
	return (
		<div className="min-h-screen bg-gray-950 text-white">
			<Navbar />
			
			<div className="container mx-auto px-4 py-8">
				<motion.div 
					className="flex items-center justify-between"
					initial={{ opacity: 0, y: -10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3 }}
				>
					<h1 className="text-3xl font-bold mb-6 text-white">Ride Matcher</h1>
					{isConnected ? (
						<span className="text-sm font-medium px-3 py-1 rounded-full bg-emerald-900/40 text-emerald-400 border border-emerald-800">
							Connected
						</span>
					) : (
						<span className="text-sm font-medium px-3 py-1 rounded-full bg-red-900/40 text-red-400 border border-red-800">
							Disconnected
						</span>
					)}
				</motion.div>
				
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
					{/* Stats Cards */}
					<motion.div 
						className="card bg-gray-900 shadow rounded-xl overflow-hidden border border-gray-800"
						initial={{ opacity: 0, y: -20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.3 }}
					>
						<div className="p-6">
							<h2 className="text-xl font-bold text-white mb-4">Connection Status</h2>
							<div className="grid grid-cols-2 gap-4">
								<div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
									<p className="text-gray-400 text-sm">Connected Drivers</p>
									<p className="text-3xl font-bold text-white">{connections.driversCount}</p>
								</div>
								<div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
									<p className="text-gray-400 text-sm">Connected Users</p>
									<p className="text-3xl font-bold text-white">{connections.usersCount}</p>
								</div>
							</div>
						</div>
					</motion.div>
					
					<motion.div 
						className="card bg-gray-900 shadow rounded-xl overflow-hidden border border-gray-800"
						initial={{ opacity: 0, y: -20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.3, delay: 0.1 }}
					>
						<div className="p-6">
							<h2 className="text-xl font-bold text-white mb-4">Available for Matching</h2>
							<div className="grid grid-cols-2 gap-4">
								<div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
									<p className="text-gray-400 text-sm">Available Drivers</p>
									<p className="text-3xl font-bold text-white">{availableDrivers.length}</p>
								</div>
								<div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
									<p className="text-gray-400 text-sm">Available Users</p>
									<p className="text-3xl font-bold text-white">{availableUsers.length}</p>
								</div>
							</div>
						</div>
					</motion.div>
					
					<motion.div 
						className="card bg-gray-900 shadow rounded-xl overflow-hidden border border-gray-800"
						initial={{ opacity: 0, y: -20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.3, delay: 0.2 }}
					>
						<div className="p-6">
							<h2 className="text-xl font-bold text-white mb-4">Match All</h2>
							<button 
								className={`btn w-full py-3 px-4 rounded-xl font-bold text-white ${
									isMatchingAll 
										? 'bg-purple-700 hover:bg-purple-800' 
										: 'bg-purple-600 hover:bg-purple-700'
								} transition-all flex items-center justify-center`}
								onClick={matchAll}
								disabled={isMatchingAll || availableDrivers.length === 0 || availableUsers.length === 0}
							>
								{isMatchingAll ? (
									<>
										<svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
											<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
											<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
										</svg>
										Matching...
									</>
								) : (
									<>Match All Available</>
								)}
							</button>
							<p className="text-gray-400 text-xs mt-3">
								This will attempt to match all available users with drivers based on proximity and availability.
							</p>
						</div>
					</motion.div>
				</div>
				
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Available Drivers */}
					<motion.div 
						className="card bg-gray-900 shadow-2xl rounded-xl overflow-hidden border border-gray-800"
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.3 }}
					>
						<div className="p-6">
							<h2 className="text-xl font-bold text-white mb-4">Available Drivers</h2>
							
							{availableDrivers.length === 0 ? (
								<div className="bg-gray-800 p-5 rounded-xl text-center border border-gray-700">
									<p className="text-gray-400">No drivers available</p>
								</div>
							) : (
								<div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
									{availableDrivers.map((driver) => (
										<motion.div 
											key={driver.id}
											className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700"
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											transition={{ duration: 0.3 }}
										>
											<div className="p-4">
												<div className="flex items-center mb-3">
													<div className="w-10 h-10 rounded-full bg-gray-700 mr-3 overflow-hidden">
														<img 
															src={driver.profileImage} 
															alt={driver.name} 
															className="w-full h-full object-cover"
														/>
													</div>
													<div>
														<h3 className="font-bold text-white">{driver.name}</h3>
														<div className="flex items-center">
															<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-400 mr-1" viewBox="0 0 20 20" fill="currentColor">
																<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
															</svg>
															<p className="text-sm text-gray-300">{driver.rating}</p>
														</div>
													</div>
												</div>
												
												<div className="bg-gray-700 p-2 rounded-lg mb-3">
													<p className="text-xs text-gray-400">Vehicle</p>
													<p className="text-sm text-white">
														{driver.vehicle.color} {driver.vehicle.model} ({driver.vehicle.number})
													</p>
												</div>
												
												<div className="grid grid-cols-2 gap-2 mb-3">
													<div className="bg-gray-700 p-2 rounded-lg">
														<p className="text-xs text-gray-400">Completed Rides</p>
														<p className="text-sm text-white">{driver.completedRides}+</p>
													</div>
													<div className="bg-gray-700 p-2 rounded-lg">
														<p className="text-xs text-gray-400">Service Area</p>
														<p className="text-sm text-white">{driver.serviceRadius} km</p>
													</div>
												</div>
											</div>
										</motion.div>
									))}
								</div>
							)}
						</div>
					</motion.div>
					
					{/* Available Users */}
					<motion.div 
						className="card bg-gray-900 shadow-2xl rounded-xl overflow-hidden border border-gray-800"
						initial={{ opacity: 0, y: -20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.3 }}
					>
						<div className="p-6">
							<h2 className="text-xl font-bold text-white mb-4">Available Users</h2>
							
							{availableUsers.length === 0 ? (
								<div className="bg-gray-800 p-5 rounded-xl text-center border border-gray-700">
									<p className="text-gray-400">No users available</p>
								</div>
							) : (
								<div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
									{availableUsers.map((user) => (
										<motion.div 
											key={user.id}
											className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700"
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											transition={{ duration: 0.3 }}
										>
											<div className="p-4">
												<div className="flex items-center mb-3">
													<div className="w-10 h-10 rounded-full bg-gray-700 mr-3 overflow-hidden">
														<img 
															src={user.profileImage} 
															alt={user.name} 
															className="w-full h-full object-cover"
														/>
													</div>
													<div>
														<h3 className="font-bold text-white">{user.name}</h3>
														<div className="flex items-center">
															<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-400 mr-1" viewBox="0 0 20 20" fill="currentColor">
																<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
															</svg>
															<p className="text-sm text-gray-300">{user.rating}</p>
														</div>
													</div>
												</div>
												
												<div className="bg-gray-700 p-2 rounded-lg mb-3">
													<p className="text-xs text-gray-400">Pickup Location</p>
													<p className="text-sm text-white">{user.rideRequest.pickupLocation.address}</p>
												</div>
												
												<div className="bg-gray-700 p-2 rounded-lg mb-3">
													<p className="text-xs text-gray-400">Destination</p>
													<p className="text-sm text-white">{user.rideRequest.dropLocation.address}</p>
												</div>
												
												<div className="grid grid-cols-3 gap-2 mb-3">
													<div className="bg-gray-700 p-2 rounded-lg">
														<p className="text-xs text-gray-400">Fare</p>
														<p className="text-sm text-white">₹{user.rideRequest.estimatedFare}</p>
													</div>
													<div className="bg-gray-700 p-2 rounded-lg">
														<p className="text-xs text-gray-400">Distance</p>
														<p className="text-sm text-white">{user.rideRequest.estimatedDistance} km</p>
													</div>
													<div className="bg-gray-700 p-2 rounded-lg">
														<p className="text-xs text-gray-400">Scheduled</p>
														<p className="text-sm text-white">{user.rideRequest.scheduledTime}</p>
													</div>
												</div>
												
												<div className="grid grid-cols-1 gap-2">
													{availableDrivers.map((driver) => {
														// Calculate distance between user and driver
														const distance = calculateDistance(
															user.currentLocation.lat,
															user.currentLocation.lng,
															driver.currentLocation.lat,
															driver.currentLocation.lng
														).toFixed(1)
														
														return (
															<button
																key={driver.id}
																onClick={() => matchDriverWithUser(user.id, driver.id)}
																className="bg-purple-600 hover:bg-purple-700 transition-all text-white py-2 px-3 rounded-lg text-sm flex items-center justify-between"
															>
																<span>Match with {driver.name}</span>
																<span className="text-xs bg-purple-900 px-2 py-1 rounded-full">{distance} km</span>
															</button>
														)
													})}
												</div>
											</div>
										</motion.div>
									))}
								</div>
							)}
						</div>
					</motion.div>
					
					{/* Match History */}
					<motion.div 
						className="card bg-gray-900 shadow-2xl rounded-xl overflow-hidden border border-gray-800"
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.3 }}
					>
						<div className="p-6">
							<h2 className="text-xl font-bold text-white mb-4">Match History</h2>
							
							{matchHistory.length === 0 ? (
								<div className="bg-gray-800 p-5 rounded-xl text-center border border-gray-700">
									<p className="text-gray-400">No match history yet</p>
								</div>
							) : (
								<div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
									{matchHistory.map((match, index) => (
										<motion.div 
											key={match.rideId || index}
											className={`rounded-xl overflow-hidden border ${
												match.status === 'accepted' ? 'bg-emerald-900/20 border-emerald-800' : 
												match.status === 'rejected' ? 'bg-red-900/20 border-red-800' : 
												'bg-gray-800 border-gray-700'
											}`}
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											transition={{ duration: 0.3 }}
										>
											<div className="p-4">
												<div className="flex items-center justify-between mb-3">
													<h3 className="font-bold text-white">
														{match.status === 'accepted' ? 'Accepted Match' : 
														match.status === 'rejected' ? 'Rejected Match' : 
														'Pending Match'}
													</h3>
													<div className={`text-xs px-2 py-1 rounded-full ${
														match.status === 'accepted' ? 'bg-emerald-900/40 text-emerald-400' : 
														match.status === 'rejected' ? 'bg-red-900/40 text-red-400' : 
														'bg-yellow-900/40 text-yellow-400'
													}`}>
														{match.status === 'accepted' ? 'Accepted' : 
														match.status === 'rejected' ? 'Rejected' : 
														'Pending'}
													</div>
												</div>
												
												{match.rideId && (
													<div className="bg-gray-700 p-2 rounded-lg mb-3">
														<p className="text-xs text-gray-400">Ride ID</p>
														<p className="text-sm text-white">{match.rideId}</p>
													</div>
												)}
												
												{match.user && match.driver && (
													<div className="grid grid-cols-2 gap-2 mb-3">
														<div className="bg-gray-700 p-2 rounded-lg">
															<p className="text-xs text-gray-400">User</p>
															<p className="text-sm text-white">{match.user}</p>
														</div>
														<div className="bg-gray-700 p-2 rounded-lg">
															<p className="text-xs text-gray-400">Driver</p>
															<p className="text-sm text-white">{match.driver}</p>
														</div>
													</div>
												)}
												
												{match.timestamp && (
													<div className="text-right">
														<p className="text-xs text-gray-400">
															{new Date(match.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
														</p>
													</div>
												)}
											</div>
										</motion.div>
									))}
								</div>
							)}
						</div>
					</motion.div>
				</div>
			</div>
		</div>
	)
}