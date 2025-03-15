'use client'

import { useState, useEffect, useCallback } from 'react'
import Navbar from '@/components/ui/Navbar'
import { motion, AnimatePresence } from 'framer-motion'
import { mockDrivers } from '@/utils/drivers'
import useSocket from '@/hooks/useSocket'

export default function DriverDashboard() {
	const [driverData, setDriverData] = useState(mockDrivers?.[0] || {})
	const [isAvailable, setIsAvailable] = useState(true)
	const [activeRide, setActiveRide] = useState(null)
	const [driverId, setDriverId] = useState('d-10234') // Default to first driver
	
	// WebSocket connection
	const { isConnected, lastMessage, sendMessage } = useSocket('ws://localhost:5005')
	
	// Register driver with WebSocket on connection
	useEffect(() => {
		if (isConnected) {
			sendMessage({
				type: 'driver_register',
				driverId
			})
		}
	}, [isConnected, sendMessage, driverId])
	
	// Handle WebSocket messages
	useEffect(() => {
		if (!lastMessage) return
		
		const { type } = lastMessage
		
		switch (type) {
			case 'booking_request':
				if (isAvailable) {
					// Add new ride request from WebSocket
					const newRide = {
						id: lastMessage.userId || lastMessage.rideId || Math.floor(Math.random() * 1000),
						pickupLocation: lastMessage.pickupLocation,
						dropLocation: {
							lat: driverData.currentLocation.lat + (Math.random() * 0.05 - 0.025),
							lng: driverData.currentLocation.lng + (Math.random() * 0.05 - 0.025)
						},
						estimatedFare: lastMessage.estimatedFare || Math.floor(Math.random() * 200) + 100,
						estimatedDistance: lastMessage.estimatedDistance || Math.floor(Math.random() * 8) + 2,
						estimatedTime: Math.floor(Math.random() * 30) + 10,
						passengerRating: (Math.random() * 2 + 3).toFixed(1),
						passengerName: lastMessage.userName || `User ${Math.floor(Math.random() * 100)}`,
						timestamp: lastMessage.timestamp || new Date().toISOString(),
						rewardPoints: 20,
						destination: lastMessage.destination
					}
					
					setDriverData(prev => ({
						...prev,
						activeRides: [...(prev.activeRides || []), newRide]
					}))
				}
				break
				
			case 'ride_cancelled':
				// Handle ride cancellation
				if (activeRide && activeRide.id === lastMessage.rideId) {
					setActiveRide(null)
					setIsAvailable(true)
					
					// Show notification
					alert('Ride has been cancelled by the user')
				}
				
				// Also remove from active rides list if present
				setDriverData(prev => ({
					...prev,
					activeRides: (prev.activeRides || []).filter(ride => ride.id !== lastMessage.rideId)
				}))
				break
				
			case 'status_updated':
				// Confirmation of driver status update
				console.log('Driver status updated:', lastMessage.status)
				break
				
			case 'ride_accepted':
				// User accepted the ride request
				if (lastMessage.rideId) {
					// Create active ride from the acceptance message
					const newActiveRide = {
						id: lastMessage.rideId,
						passengerName: lastMessage.user?.name || 'User',
						passengerRating: lastMessage.user?.rating || 4.5,
						pickupLocation: lastMessage.pickup,
						dropLocation: lastMessage.destination,
						estimatedFare: lastMessage.estimatedFare,
						timestamp: lastMessage.timestamp,
						status: 'accepted'
					}
					
					setActiveRide(newActiveRide)
					setIsAvailable(false)
					
					// Update driver stats
					setDriverData(prev => ({
						...prev,
						activeRides: (prev.activeRides || []).filter(r => r.id !== lastMessage.rideId),
						dailyStats: {
							...prev.dailyStats,
							completedRides: prev.dailyStats.completedRides + 1,
							earnings: prev.dailyStats.earnings + newActiveRide.estimatedFare
						}
					}))
					
					// Simulate ride completion time (1 minute for demo)
					setTimeout(() => {
						setActiveRide(null)
						setIsAvailable(true)
					}, 60000)
				}
				break
		}
	}, [lastMessage, isAvailable, driverData, activeRide])
	
	// Update driver availability status on WebSocket and when status changes
	useEffect(() => {
		if (isConnected) {
			sendMessage({
				type: 'driver_status',
				driverId,
				isAvailable,
				location: driverData.currentLocation,
				timestamp: new Date().toISOString()
			})
		}
	}, [isAvailable, isConnected, sendMessage, driverId, driverData.currentLocation])
	
	// Calculate acceptance rate
	const getAcceptanceRate = useCallback(() => {
		const { completedRides, declinedRides } = driverData.dailyStats || { completedRides: 0, declinedRides: 0 }
		const total = completedRides + declinedRides
		
		if (total === 0) return 0
		return Math.round((completedRides / total) * 100)
	}, [driverData.dailyStats])
	
	// Accept a ride request
	const acceptRide = (ride) => {
		// Send acceptance to WebSocket
		sendMessage({
			type: 'driver_accepted',
			rideId: ride.id,
			driverId,
			driver: {
				name: driverData.name || 'Driver Name',
				rating: driverData.rating || 4.8,
				rides: driverData.completedRides || '1240+',
				vehicleNumber: driverData.vehicle?.number || 'KA 01 AB 1234',
				vehicleType: driverData.vehicle?.type || 'White Auto'
			},
			estimatedArrival: 5
		})
		
		setActiveRide(ride)
		setDriverData(prev => ({
			...prev,
			activeRides: (prev.activeRides || []).filter(r => r.id !== ride.id),
			dailyStats: {
				...prev.dailyStats,
				completedRides: prev.dailyStats.completedRides + 1,
				earnings: prev.dailyStats.earnings + ride.estimatedFare
			}
		}))
		setIsAvailable(false)
		
		// Simulate ride completion time (1 minute for demo)
		setTimeout(() => {
			setActiveRide(null)
			setIsAvailable(true)
		}, 60000)
	}
	
	// Decline a ride request
	const declineRide = (rideId) => {
		// Send decline to WebSocket
		sendMessage({
			type: 'driver_declined',
			rideId,
			driverId
		})
		
		setDriverData(prev => ({
			...prev,
			activeRides: (prev.activeRides || []).filter(ride => ride.id !== rideId),
			dailyStats: {
				...prev.dailyStats,
				declinedRides: prev.dailyStats.declinedRides + 1
			}
		}))
	}
	
	// Handle driver change for demo
	const handleDriverChange = (newDriverId) => {
		// Clear any active rides when switching drivers
		setActiveRide(null)
		
		const selectedDriver = mockDrivers.find(driver => driver.id === newDriverId)
		if (selectedDriver) {
			setDriverData(selectedDriver)
			setDriverId(newDriverId)
			
			// Re-register as the new driver
			if (isConnected) {
				sendMessage({
					type: 'driver_register',
					driverId: newDriverId
				})
			}
		}
	}
	
	return (
		<div className="min-h-screen bg-gray-950 text-white">
			<Navbar />
			
			<div className="container mx-auto px-4 py-8">
				<motion.div 
					className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6"
					initial={{ opacity: 0, y: -10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3 }}
				>
					<div>
						<h1 className="text-3xl font-bold text-white">Driver Dashboard</h1>
						<p className="text-gray-400 mt-1">Manage rides and track earnings</p>
					</div>
					
					{/* Connection status indicator */}
					<div className="mt-4 md:mt-0 flex items-center">
						{isConnected ? (
							<span className="text-sm font-medium px-3 py-1 rounded-full bg-emerald-900/40 text-emerald-400 border border-emerald-800">
								Connected
							</span>
						) : (
							<span className="text-sm font-medium px-3 py-1 rounded-full bg-red-900/40 text-red-400 border border-red-800">
								Disconnected
							</span>
						)}
						
						{/* Driver switcher for demo purposes */}
						<select 
							className="ml-4 bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600"
							value={driverId}
							onChange={(e) => handleDriverChange(e.target.value)}
						>
							{mockDrivers.map(driver => (
								<option key={driver.id} value={driver.id}>
									{driver.name}
								</option>
							))}
						</select>
					</div>
				</motion.div>
				
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					<div className="lg:col-span-1">
						<motion.div 
							className="card bg-gray-900 shadow-2xl border border-gray-800 rounded-xl overflow-hidden mb-6"
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.3 }}
						>
							<div className="card-body p-6">
								<div className="flex items-center mb-6">
									<div className="w-16 h-16 rounded-full bg-gray-800 overflow-hidden mr-4">
										<img 
											src={driverData.profileImage} 
											alt={driverData.name} 
											className="w-full h-full object-cover"
										/>
									</div>
									<div>
										<h2 className="text-xl font-bold text-white">{driverData.name}</h2>
										<div className="flex items-center mt-1">
											<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-400 mr-1" viewBox="0 0 20 20" fill="currentColor">
												<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
											</svg>
											<p className="text-gray-300">{driverData.rating} · {driverData.completedRides}+ rides</p>
										</div>
									</div>
								</div>
								
								<h2 className="card-title text-xl font-bold text-white mb-4">Driver Status</h2>
								
								<div className="bg-gray-800 p-4 rounded-xl border border-gray-700 mb-4">
									<label className="flex items-center justify-between cursor-pointer">
										<div>
											<span className="text-base font-medium text-white">Available for rides</span>
											<p className="text-sm text-gray-400 mt-1">
												{isAvailable ? 'You are visible to nearby riders' : 'You are currently offline'}
											</p>
										</div>
										<div className="relative">
											<input 
												type="checkbox" 
												className="sr-only"
												checked={isAvailable} 
												onChange={() => setIsAvailable(!isAvailable)}
											/>
											<div className={`block w-14 h-8 rounded-full transition ${isAvailable ? 'bg-emerald-600' : 'bg-gray-600'}`}></div>
											<div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition transform ${isAvailable ? 'translate-x-6' : ''}`}></div>
										</div>
									</label>
								</div>
								
								{activeRide && (
									<div className="bg-emerald-900/30 p-5 rounded-xl mb-6 border border-emerald-800">
										<div className="flex items-center mb-3">
											<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
											</svg>
											<h3 className="font-bold text-lg text-emerald-100">Active Ride</h3>
										</div>
										
										<div className="grid grid-cols-2 gap-3">
											<div className="bg-emerald-900/40 p-3 rounded-lg">
												<p className="text-sm text-emerald-200 mb-1">Passenger</p>
												<p className="font-bold text-white">{activeRide.passengerName}</p>
											</div>
											<div className="bg-emerald-900/40 p-3 rounded-lg">
												<p className="text-sm text-emerald-200 mb-1">Rating</p>
												<div className="flex items-center">
													<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-400 mr-1" viewBox="0 0 20 20" fill="currentColor">
														<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
													</svg>
													<p className="font-bold text-white">{activeRide.passengerRating}</p>
												</div>
											</div>
											<div className="bg-emerald-900/40 p-3 rounded-lg">
												<p className="text-sm text-emerald-200 mb-1">Destination</p>
												<p className="font-bold text-white">{activeRide.destination || 'Unknown'}</p>
											</div>
											<div className="bg-emerald-900/40 p-3 rounded-lg">
												<p className="text-sm text-emerald-200 mb-1">Fare</p>
												<p className="font-bold text-white">₹{activeRide.estimatedFare}</p>
											</div>
										</div>
										
										<button 
											className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg mt-4 transition-all"
											onClick={() => setActiveRide(null)}
										>
											Cancel Ride
										</button>
									</div>
								)}
								
								<div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 mb-6">
									<div className="grid grid-cols-3 divide-x divide-gray-700">
										<div className="p-4 text-center">
											<p className="text-sm text-gray-400 mb-1">Earnings</p>
											<p className="font-bold text-xl text-emerald-400">₹{driverData.dailyStats?.earnings || 0}</p>
											<p className="text-xs text-gray-400 mt-1">Today</p>
										</div>
										<div className="p-4 text-center">
											<p className="text-sm text-gray-400 mb-1">Rides</p>
											<p className="font-bold text-xl text-white">{driverData.dailyStats?.completedRides || 0}</p>
											<p className="text-xs text-gray-400 mt-1">Completed</p>
										</div>
										<div className="p-4 text-center">
											<p className="text-sm text-gray-400 mb-1">Acceptance</p>
											<p className="font-bold text-xl text-white">{getAcceptanceRate()}%</p>
										</div>
									</div>
									<div className="px-4 py-3 bg-gray-900 text-xs text-gray-400 flex items-center justify-center">
										<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
										</svg>
										{driverData.dailyStats?.comparedToYesterday || 0}% more than yesterday
									</div>
								</div>
								
								<div className="bg-gray-800 p-5 rounded-xl border border-gray-700">
									<h3 className="font-bold text-white mb-3">Vehicle Information</h3>
									<div className="space-y-3">
										<div className="grid grid-cols-2 gap-3">
											<div className="bg-gray-700 p-3 rounded-lg">
												<p className="text-xs text-gray-400 mb-1">Model</p>
												<p className="text-sm font-bold text-white">{driverData.vehicle?.model || "Unknown"}</p>
											</div>
											<div className="bg-gray-700 p-3 rounded-lg">
												<p className="text-xs text-gray-400 mb-1">Number</p>
												<p className="text-sm font-bold text-white">{driverData.vehicle?.number || "Unknown"}</p>
											</div>
										</div>
										<div className="grid grid-cols-2 gap-3">
											<div className="bg-gray-700 p-3 rounded-lg">
												<p className="text-xs text-gray-400 mb-1">Color</p>
												<p className="text-sm font-bold text-white">{driverData.vehicle?.color || "Unknown"}</p>
											</div>
											<div className="bg-gray-700 p-3 rounded-lg">
												<p className="text-xs text-gray-400 mb-1">Type</p>
												<p className="text-sm font-bold text-white">{driverData.vehicle?.type || "Unknown"}</p>
											</div>
										</div>
									</div>
								</div>
							</div>
						</motion.div>
					</div>
					
					<div className="lg:col-span-2">
						<motion.div 
							className="card bg-gray-900 shadow-2xl border border-gray-800 rounded-xl overflow-hidden"
							initial={{ opacity: 0, y: -20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.3, delay: 0.1 }}
						>
							<div className="card-body p-6">
								<h2 className="card-title text-xl font-bold text-white mb-4">Incoming Ride Requests</h2>
								
								{!isConnected && (
									<div className="bg-red-900/30 p-5 rounded-xl mb-5 border border-red-800">
										<div className="flex items-center">
											<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
											</svg>
											<div>
												<h3 className="font-bold text-lg text-red-100">Connection error</h3>
												<p className="text-red-200 mt-1">Unable to receive ride requests. Reconnecting to service...</p>
											</div>
										</div>
									</div>
								)}
								
								<AnimatePresence>
									{!driverData.activeRides?.length ? (
										<motion.div 
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											exit={{ opacity: 0 }}
											className="bg-gray-800 p-5 rounded-xl text-white border border-gray-700"
										>
											<div className="flex flex-col items-center justify-center py-8">
												<svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
												</svg>
												<h3 className="font-bold text-lg text-white mb-1">No ride requests</h3>
												<p className="text-gray-400 text-center">You'll see ride requests here when they become available</p>
												
												{!isAvailable && (
													<div className="mt-4 p-3 bg-gray-700 rounded-lg text-sm text-gray-300">
														<span className="font-bold">Tip:</span> Toggle 'Available for rides' to receive requests
													</div>
												)}
											</div>
										</motion.div>
									) : (
										<div className="space-y-4">
											{driverData.activeRides.map((ride, index) => (
												<motion.div 
													key={ride.id} 
													className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-emerald-600 transition-all"
													initial={{ opacity: 0, x: 20 }}
													animate={{ opacity: 1, x: 0 }}
													exit={{ opacity: 0, x: -20 }}
													transition={{ duration: 0.3, delay: index * 0.1 }}
												>
													<div className="p-5">
														<div className="flex justify-between items-start mb-4">
															<div>
																<div className="flex items-center">
																	<h3 className="font-bold text-xl text-white">{ride.passengerName}</h3>
																	<div className="flex items-center ml-2 bg-gray-700 px-2 py-1 rounded-full">
																		<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-400 mr-1" viewBox="0 0 20 20" fill="currentColor">
																			<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
																		</svg>
																		<span className="text-sm font-medium text-white">{ride.passengerRating}</span>
																	</div>
																</div>
																<p className="text-gray-300 mt-1">Destination: {ride.destination || 'Unknown location'}</p>
															</div>
															<div className="px-3 py-1 rounded-full bg-purple-900/40 text-purple-300 text-sm font-medium border border-purple-800">
																+{ride.rewardPoints} points
															</div>
														</div>
														
														<div className="grid grid-cols-3 gap-3 mb-4">
															<div className="bg-gray-700 p-3 rounded-lg text-center">
																<p className="text-xs text-gray-400 mb-1">Distance</p>
																<p className="font-bold text-white">{ride.estimatedDistance} km</p>
															</div>
															<div className="bg-gray-700 p-3 rounded-lg text-center">
																<p className="text-xs text-gray-400 mb-1">Time</p>
																<p className="font-bold text-white">{ride.estimatedTime} min</p>
															</div>
															<div className="bg-gray-700 p-3 rounded-lg text-center">
																<p className="text-xs text-gray-400 mb-1">Fare</p>
																<p className="font-bold text-white">₹{ride.estimatedFare}</p>
															</div>
														</div>
														
														<div className="grid grid-cols-2 gap-3">
															<motion.button 
																className="btn-lg bg-gray-700 text-white font-medium rounded-xl py-3 flex items-center justify-center gap-2 border border-gray-600 hover:bg-gray-600 transition-all"
																onClick={() => declineRide(ride.id)}
																whileHover={{ scale: 1.02 }}
																whileTap={{ scale: 0.98 }}
															>
																<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
																	<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
																</svg>
																Decline
															</motion.button>
															<motion.button 
																className="btn-lg bg-emerald-600 text-white font-bold rounded-xl py-3 flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all"
																onClick={() => acceptRide(ride)}
																whileHover={{ scale: 1.02 }}
																whileTap={{ scale: 0.98 }}
															>
																<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
																	<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
																</svg>
																Accept
															</motion.button>
														</div>
													</div>
												</motion.div>
											))}
										</div>
									)}
								</AnimatePresence>
							</div>
						</motion.div>
						
						<motion.div 
							className="card bg-gray-900 shadow-2xl border border-gray-800 rounded-xl overflow-hidden mt-6"
							initial={{ opacity: 0, y: -20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.3, delay: 0.2 }}
						>
							<div className="card-body p-6">
								<h2 className="card-title text-xl font-bold text-white mb-4">Earnings Overview</h2>
								
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div className="bg-gray-800 p-5 rounded-xl border border-gray-700">
										<h3 className="font-bold text-white mb-4">Earnings Summary</h3>
										
										<div className="space-y-4">
											<div>
												<div className="flex justify-between text-sm mb-1">
													<span className="text-gray-400">Today</span>
													<span className="text-white font-medium">₹{driverData.dailyStats?.earnings || 0}</span>
												</div>
												<div className="w-full bg-gray-700 rounded-full h-2">
													<div 
														className="bg-emerald-500 h-2 rounded-full" 
														style={{ width: `${Math.min(100, ((driverData.dailyStats?.earnings || 0) / 2000) * 100)}%` }}
													></div>
												</div>
											</div>
											
											<div>
												<div className="flex justify-between text-sm mb-1">
													<span className="text-gray-400">This Week</span>
													<span className="text-white font-medium">₹{(driverData.dailyStats?.earnings || 0) * 5}</span>
												</div>
												<div className="w-full bg-gray-700 rounded-full h-2">
													<div 
														className="bg-purple-500 h-2 rounded-full" 
														style={{ width: `${Math.min(100, (((driverData.dailyStats?.earnings || 0) * 5) / 10000) * 100)}%` }}
													></div>
												</div>
											</div>
											
											<div>
												<div className="flex justify-between text-sm mb-1">
													<span className="text-gray-400">This Month</span>
													<span className="text-white font-medium">₹{(driverData.dailyStats?.earnings || 0) * 20}</span>
												</div>
												<div className="w-full bg-gray-700 rounded-full h-2">
													<div 
														className="bg-blue-500 h-2 rounded-full" 
														style={{ width: `${Math.min(100, (((driverData.dailyStats?.earnings || 0) * 20) / 40000) * 100)}%` }}
													></div>
												</div>
											</div>
										</div>
									</div>
									
									<div className="bg-gray-800 p-5 rounded-xl border border-gray-700">
										<h3 className="font-bold text-white mb-4">Recent Payments</h3>
										
										<div className="space-y-4">
											<div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
												<div className="flex items-center">
													<div className="bg-emerald-900/50 p-2 rounded-lg mr-3">
														<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
														</svg>
													</div>
													<div>
														<p className="text-white font-medium">Trip Payment</p>
														<p className="text-xs text-gray-400">Today, 2:30 PM</p>
													</div>
												</div>
												<p className="text-emerald-400 font-bold">+₹180</p>
											</div>
											
											<div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
												<div className="flex items-center">
													<div className="bg-emerald-900/50 p-2 rounded-lg mr-3">
														<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
														</svg>
													</div>
													<div>
														<p className="text-white font-medium">Trip Payment</p>
														<p className="text-xs text-gray-400">Today, 11:15 AM</p>
													</div>
												</div>
												<p className="text-emerald-400 font-bold">+₹250</p>
											</div>
											
											<div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
												<div className="flex items-center">
													<div className="bg-purple-900/50 p-2 rounded-lg mr-3">
														<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
														</svg>
													</div>
													<div>
														<p className="text-white font-medium">Incentive Bonus</p>
														<p className="text-xs text-gray-400">Yesterday</p>
													</div>
												</div>
												<p className="text-purple-400 font-bold">+₹100</p>
											</div>
										</div>
									</div>
								</div>
								
								<div className="mt-6 bg-gray-800 p-5 rounded-xl border border-gray-700">
									<div className="flex items-center justify-between mb-4">
										<h3 className="font-bold text-white">Activity Timeline</h3>
										<span className="text-xs text-gray-400">Last 24 hours</span>
									</div>
									
									<div className="relative pl-8 space-y-6 before:absolute before:left-4 before:h-full before:border-l-2 before:border-gray-700">
										<div className="relative">
											<span className="absolute left-[-32px] top-0 flex items-center justify-center w-6 h-6 rounded-full bg-emerald-900 border-2 border-gray-800">
												<svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
												</svg>
											</span>
											<time className="block text-xs text-gray-500 mb-1">Today, 2:30 PM</time>
											<h4 className="text-white font-medium">Completed a ride</h4>
											<p className="text-sm text-gray-400">Indiranagar to Koramangala · ₹180</p>
										</div>
										
										<div className="relative">
											<span className="absolute left-[-32px] top-0 flex items-center justify-center w-6 h-6 rounded-full bg-emerald-900 border-2 border-gray-800">
												<svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
												</svg>
											</span>
											<time className="block text-xs text-gray-500 mb-1">Today, 11:15 AM</time>
											<h4 className="text-white font-medium">Completed a ride</h4>
											<p className="text-sm text-gray-400">MG Road to Whitefield · ₹250</p>
										</div>
										
										<div className="relative">
											<span className="absolute left-[-32px] top-0 flex items-center justify-center w-6 h-6 rounded-full bg-red-900 border-2 border-gray-800">
												<svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
												</svg>
											</span>
											<time className="block text-xs text-gray-500 mb-1">Today, 10:30 AM</time>
											<h4 className="text-white font-medium">Ride request declined</h4>
											<p className="text-sm text-gray-400">HSR Layout to Electronic City</p>
										</div>
										
										<div className="relative">
											<span className="absolute left-[-32px] top-0 flex items-center justify-center w-6 h-6 rounded-full bg-blue-900 border-2 border-gray-800">
												<svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
												</svg>
											</span>
											<time className="block text-xs text-gray-500 mb-1">Today, 9:00 AM</time>
											<h4 className="text-white font-medium">Started shift</h4>
											<p className="text-sm text-gray-400">Went online in Indiranagar area</p>
										</div>
									</div>
								</div>
							</div>
						</motion.div>
					</div>
				</div>
			</div>
		</div>
	)
}