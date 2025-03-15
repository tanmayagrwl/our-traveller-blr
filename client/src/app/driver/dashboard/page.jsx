'use client'

import { useState, useEffect, useCallback } from 'react'
import Navbar from '@/components/ui/Navbar'
import RideMap from '@/components/maps/RideMap'
import { motion, AnimatePresence } from 'framer-motion'
import { DriverDashboard as dashboardData } from '@/utils/response/driver/dashboard'
import useSocket from '@/hooks/useSocket'

export default function DriverDashboard() {
	// Core state
	const [driverData, setDriverData] = useState(dashboardData)
	const [isAvailable, setIsAvailable] = useState(true)
	const [activeRide, setActiveRide] = useState(null)
	const [driverId] = useState('driver-' + Math.floor(Math.random() * 10000))
	
	// WebSocket connection
	const { isConnected, lastMessage, sendMessage } = useSocket('ws://localhost:5000')
	
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
							lat: driverData.location.current.lat + (Math.random() * 0.05 - 0.025),
							lng: driverData.location.current.lng + (Math.random() * 0.05 - 0.025)
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
						activeRides: [...prev.activeRides, newRide]
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
					activeRides: prev.activeRides.filter(ride => ride.id !== lastMessage.rideId)
				}))
				break
				
			case 'status_updated':
				// Confirmation of driver status update
				console.log('Driver status updated:', lastMessage.status)
				break
		}
	}, [lastMessage, isAvailable, driverData.location.current, activeRide])
	
	// Update driver availability status on WebSocket and when status changes
	useEffect(() => {
		if (isConnected) {
			sendMessage({
				type: 'driver_status',
				driverId,
				isAvailable,
				location: driverData.location.current,
				timestamp: new Date().toISOString()
			})
		}
	}, [isAvailable, isConnected, sendMessage, driverId, driverData.location.current])
	
	// Calculate acceptance rate
	const getAcceptanceRate = useCallback(() => {
		const { completedRides, declinedRides } = driverData.stats.daily
		const total = completedRides + declinedRides
		
		if (total === 0) return 0
		return Math.round((completedRides / total) * 100)
	}, [driverData.stats.daily])
	
	// Accept a ride request
	const acceptRide = (ride) => {
		// Send acceptance to WebSocket
		sendMessage({
			type: 'driver_accepted',
			rideId: ride.id,
			driverId,
			driver: {
				name: driverData.name || 'Rahul K.',
				rating: driverData.rating || 4.8,
				rides: driverData.totalRides || '1240+',
				vehicleNumber: driverData.vehicleNumber || 'KA 01 AB 1234',
				vehicleType: driverData.vehicleType || 'White Auto'
			},
			estimatedArrival: 5
		})
		
		setActiveRide(ride)
		setDriverData(prev => ({
			...prev,
			activeRides: prev.activeRides.filter(r => r.id !== ride.id),
			stats: {
				...prev.stats,
				daily: {
					...prev.stats.daily,
					completedRides: prev.stats.daily.completedRides + 1,
					earnings: prev.stats.daily.earnings + ride.estimatedFare
				}
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
			activeRides: prev.activeRides.filter(ride => ride.id !== rideId),
			stats: {
				...prev.stats,
				daily: {
					...prev.stats.daily,
					declinedRides: prev.stats.daily.declinedRides + 1
				}
			}
		}))
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
					<h1 className="text-3xl font-bold mb-6 text-white">Driver Dashboard</h1>
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
				
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					<div className="lg:col-span-1">
						<motion.div 
							className="card bg-gray-900 shadow-2xl border border-gray-800 rounded-xl overflow-hidden mb-6"
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.3 }}
						>
							<div className="card-body p-6">
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
									</div>
								)}
								
								<div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 mb-6">
									<div className="grid grid-cols-3 divide-x divide-gray-700">
										<div className="p-4 text-center">
											<p className="text-sm text-gray-400 mb-1">Earnings</p>
											<p className="font-bold text-xl text-emerald-400">₹{driverData.stats.daily.earnings}</p>
											<p className="text-xs text-gray-400 mt-1">Today</p>
										</div>
										<div className="p-4 text-center">
											<p className="text-sm text-gray-400 mb-1">Rides</p>
											<p className="font-bold text-xl text-white">{driverData.stats.daily.completedRides}</p>
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
										{driverData.stats.daily.comparedToYesterday}% more than yesterday
									</div>
								</div>
								
								<div className="bg-gray-800 p-5 rounded-xl border border-gray-700">
									<h3 className="font-bold text-white mb-3">Reward Status</h3>
									<div className="flex items-center mb-4">
										<div className="relative h-12 w-12">
											<svg viewBox="0 0 36 36" className="h-12 w-12 rotate-[-90deg]">
												<path
													className="stroke-gray-700 fill-none"
													strokeWidth="3"
													strokeLinecap="round"
													d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
												/>
												<path
													className="stroke-emerald-500 fill-none"
													strokeWidth="3"
													strokeLinecap="round"
													strokeDasharray={`${driverData.rewards.points}, 100`}
													d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
												/>
											</svg>
											<div className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-sm font-bold text-white">
												{driverData.rewards.points}%
											</div>
										</div>
										<div className="ml-4 flex-1">
											<div className="flex items-center justify-between">
												<p className="font-bold text-white">{driverData.rewards.level} Level</p>
												<p className="text-xs text-gray-400">{driverData.rewards.points}/{driverData.rewards.points + driverData.rewards.pointsToNextLevel}</p>
											</div>
											<div className="w-full bg-gray-700 rounded-full h-2 mt-2">
												<div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${driverData.rewards.points}%` }}></div>
											</div>
										</div>
									</div>
									<div className="flex flex-wrap gap-2">
										{driverData.rewards.badges.map((badge, index) => (
											<span 
												key={index} 
												className={`px-2 py-1 rounded-full text-xs font-medium 
													${badge.type === 'primary' ? 'bg-emerald-900/50 text-emerald-300 border border-emerald-700' : 
													badge.type === 'secondary' ? 'bg-purple-900/50 text-purple-300 border border-purple-700' : 
													'bg-gray-800 text-gray-300 border border-gray-700'}`}
											>
												{badge.name}
											</span>
										))}
									</div>
								</div>
							</div>
						</motion.div>
					</div>
					
					<div className="lg:col-span-2">
						<motion.div 
							className="card bg-gray-900 shadow-2xl border border-gray-800 rounded-xl overflow-hidden mb-6"
							initial={{ opacity: 0, y: -20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.3 }}
						>
							<div className="card-body p-6">
								<h2 className="card-title text-xl font-bold text-white mb-4">Live Map</h2>
								<div className="h-[40vh] lg:h-[50vh] w-full rounded-xl overflow-hidden border border-gray-800">
									<RideMap 
										driverLocation={driverData.location.current} 
										pickupLocation={activeRide?.pickupLocation}
										dropLocation={activeRide?.dropLocation}
										showRoute={activeRide ? true : false}
									/>
								</div>
								
								{activeRide && (
									<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
										<div className="bg-gray-800 rounded-xl p-4 flex items-center border border-gray-700">
											<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-emerald-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
											</svg>
											<div>
												<p className="text-gray-400 text-sm">Pickup</p>
												<p className="text-white font-bold">3 min away</p>
											</div>
										</div>
										
										<div className="bg-gray-800 rounded-xl p-4 flex items-center border border-gray-700">
											<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-emerald-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
											</svg>
											<div>
												<p className="text-gray-400 text-sm">Trip Distance</p>
												<p className="text-white font-bold">{activeRide?.estimatedDistance || 0} km</p>
											</div>
										</div>
										
										<div className="bg-gray-800 rounded-xl p-4 flex items-center border border-gray-700">
											<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-emerald-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
											</svg>
											<div>
												<p className="text-gray-400 text-sm">Earnings</p>
												<p className="text-white font-bold">₹{activeRide?.estimatedFare || 0}</p>
											</div>
										</div>
									</div>
								)}
							</div>
						</motion.div>
						
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
									{driverData.activeRides.length === 0 ? (
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
					</div>
				</div>
			</div>
		</div>
	)
}