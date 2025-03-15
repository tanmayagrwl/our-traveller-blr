'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/ui/Navbar'
import { motion, AnimatePresence } from 'framer-motion'
import { mockUsers } from '@/utils/drivers'
import useSocket from '@/hooks/useSocketMatcher'
import RideMap from '@/components/maps/RideMap'

export default function UserDashboard() {
	// User state
	const [userData, setUserData] = useState(mockUsers[0])
	const [userId, setUserId] = useState('u-20456') // Default to first user
	const [pickupTime, setPickupTime] = useState('18:30')
	const [isRequesting, setIsRequesting] = useState(false)
	const [activeBooking, setActiveBooking] = useState(null)
	const [toasts, setToasts] = useState([])
	const [bookingProgress, setBookingProgress] = useState(null)
	
	// WebSocket connection
	const { isConnected, lastMessage, sendMessage } = useSocket('ws://localhost:5005')
	
	// Register user with WebSocket on connection
	useEffect(() => {
		if (isConnected) {
			sendMessage({
				type: 'user_register',
				userId
			})
		}
	}, [isConnected, sendMessage, userId])
	
	// Handle incoming WebSocket messages
	useEffect(() => {
		if (!lastMessage) return
		
		const { type } = lastMessage
		
		switch (type) {
			case 'booking_request':
				// Received a booking request from a driver
				const newToast = {
					id: Date.now(),
					type: 'booking',
					title: 'New Ride Match!',
					message: `Driver ${lastMessage.driverName} has been assigned to pick you up at ${lastMessage.pickupTime}`,
					rideId: lastMessage.rideId,
					driverId: lastMessage.driverId,
					driverName: lastMessage.driverName,
					driverRating: lastMessage.driverRating,
					vehicleDetails: lastMessage.vehicleDetails,
					estimatedArrival: lastMessage.estimatedArrival,
					pickup: lastMessage.pickup,
					destination: lastMessage.destination
				}
				
				setToasts(prev => [...prev, newToast])
				break
				
			case 'booking_processed':
				// Confirmation of booking response
				if (lastMessage.status === 'accepted') {
					// Update booking progress
					setBookingProgress({
						status: 'accepted',
						steps: [
							{ id: 1, name: 'Accepting', completed: true },
							{ id: 2, name: 'Auto Scheduling', completed: false },
							{ id: 3, name: 'Driver Notified', completed: false },
							{ id: 4, name: 'Successful!', completed: false }
						]
					})
					
					// Simulate progress
					setTimeout(() => {
						setBookingProgress(prev => ({
							...prev,
							steps: prev.steps.map(step => 
								step.id === 2 ? { ...step, completed: true } : step
							)
						}))
						
						setTimeout(() => {
							setBookingProgress(prev => ({
								...prev,
								steps: prev.steps.map(step => 
									step.id === 3 ? { ...step, completed: true } : step
								)
							}))
							
							setTimeout(() => {
								setBookingProgress(prev => ({
									...prev,
									steps: prev.steps.map(step => 
										step.id === 4 ? { ...step, completed: true } : step
									)
								}))
							}, 2000)
						}, 2000)
					}, 2000)
				}
				break
				
			case 'booking_reminder':
				// Reminder for a pending booking request
				const reminderToast = {
					id: Date.now(),
					type: 'reminder',
					title: 'Ride Reminder',
					message: `Your ride with ${lastMessage.driverName} is scheduled for ${lastMessage.pickupTime}`,
					rideId: lastMessage.rideId,
					driverId: lastMessage.driverId
				}
				
				setToasts(prev => [...prev, reminderToast])
				break
		}
	}, [lastMessage])
	
	// Request a ride
	const requestRide = () => {
		setIsRequesting(true)
		
		// In a real app, this would send a ride request to the backend
		// For this demo, we're just setting up the user to receive a match
		// from the matcher page
		
		// Simulate a request delay
		setTimeout(() => {
			setIsRequesting(false)
			
			const requestToast = {
				id: Date.now(),
				type: 'info',
				title: 'Ride Requested',
				message: 'Looking for drivers in your area...'
			}
			
			setToasts(prev => [...prev, requestToast])
		}, 2000)
	}
	
	// Handle ride booking responses
	const handleBookingResponse = (rideId, response) => {
		// Remove the toast
		setToasts(prev => prev.filter(toast => toast.rideId !== rideId))
		
		// Send response to server
		sendMessage({
			type: 'booking_response',
			rideId,
			response
		})
		
		if (response === 'accept') {
			// Store the active booking
			const bookingToast = toasts.find(toast => toast.rideId === rideId)
			if (bookingToast) {
				setActiveBooking({
					rideId,
					driverName: bookingToast.driverName,
					driverRating: bookingToast.driverRating,
					vehicleDetails: bookingToast.vehicleDetails,
					estimatedArrival: bookingToast.estimatedArrival,
					pickup: bookingToast.pickup,
					destination: bookingToast.destination
				})
			}
		} else if (response === 'reject') {
			// Show rejection confirmation
			const rejectionToast = {
				id: Date.now(),
				type: 'info',
				title: 'Ride Rejected',
				message: 'You\'ve rejected this ride. We\'ll look for another driver.'
			}
			
			setToasts(prev => [...prev, rejectionToast])
		}
	}
	
	// Handle user change for demo
	const handleUserChange = (newUserId) => {
		// Clear any active bookings and toasts when switching users
		setActiveBooking(null)
		setToasts([])
		setBookingProgress(null)
		
		const selectedUser = mockUsers.find(user => user.id === newUserId)
		if (selectedUser) {
			setUserData(selectedUser)
			setUserId(newUserId)
			
			// Re-register as the new user
			if (isConnected) {
				sendMessage({
					type: 'user_register',
					userId: newUserId
				})
			}
		}
	}
	
	// Remove a toast by id
	const removeToast = (id) => {
		setToasts(prev => prev.filter(toast => toast.id !== id))
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
						<h1 className="text-3xl font-bold text-white">User Dashboard</h1>
						<p className="text-gray-400 mt-1">Book rides and manage your account</p>
					</div>
					
					{/* User switcher for demo purposes */}
					<div className="mt-4 md:mt-0">
						<select 
							className="bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600"
							value={userId}
							onChange={(e) => handleUserChange(e.target.value)}
						>
							{mockUsers.map(user => (
								<option key={user.id} value={user.id}>
									{user.name}
								</option>
							))}
						</select>
					</div>
				</motion.div>
				
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Left Column - User Details */}
					<div className="lg:col-span-1">
						<motion.div 
							className="card bg-gray-900 rounded-xl overflow-hidden border border-gray-800 mb-6"
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.3 }}
						>
							<div className="p-6">
								<div className="flex items-center mb-6">
									<div className="w-16 h-16 rounded-full bg-gray-800 overflow-hidden mr-4">
										<img 
											src={userData.profileImage} 
											alt={userData.name} 
											className="w-full h-full object-cover"
										/>
									</div>
									<div>
										<h2 className="text-xl font-bold text-white">{userData.name}</h2>
										<div className="flex items-center mt-1">
											<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-400 mr-1" viewBox="0 0 20 20" fill="currentColor">
												<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
											</svg>
											<p className="text-gray-300">{userData.rating} · Member since {new Date(userData.registrationDate).getFullYear()}</p>
										</div>
									</div>
								</div>
								
								{isConnected ? (
									<div className="bg-emerald-900/20 border border-emerald-800 rounded-lg p-3 mb-6 flex items-center">
										<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.072 0a5 5 0 010 7.07M13 12a1 1 0 11-2 0 1 1 0 012 0z" />
										</svg>
										<span className="text-emerald-400">Connected to ride service</span>
									</div>
								) : (
									<div className="bg-red-900/20 border border-red-800 rounded-lg p-3 mb-6 flex items-center">
										<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
										</svg>
										<span className="text-red-400">Disconnected from ride service</span>
									</div>
								)}
								
								<div className="mb-6">
									<h3 className="text-lg font-bold text-white mb-3">Saved Locations</h3>
									{userData.savedLocations.map((location, index) => (
										<div key={index} className="bg-gray-800 rounded-lg p-3 mb-2 border border-gray-700">
											<p className="text-sm font-bold text-white">{location.name}</p>
											<p className="text-xs text-gray-400 mt-1">{location.address}</p>
										</div>
									))}
								</div>
								
								<div>
									<h3 className="text-lg font-bold text-white mb-3">Payment Methods</h3>
									{userData.paymentMethods.map((method) => (
										<div key={method.id} className="bg-gray-800 rounded-lg p-3 mb-2 border border-gray-700 flex items-center">
											{method.type === 'card' ? (
												<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
												</svg>
											) : (
												<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
												</svg>
											)}
											<div>
												<p className="text-sm font-bold text-white">
													{method.type === 'card' ? `•••• ${method.last4}` : method.handle}
												</p>
												<p className="text-xs text-gray-400 mt-1">
													{method.type === 'card' ? 'Credit/Debit Card' : 'UPI'}
													{method.isDefault && ' · Default'}
												</p>
											</div>
										</div>
									))}
								</div>
							</div>
						</motion.div>
					</div>
					
					{/* Middle and Right Column - Map, Booking Form */}
					<div className="lg:col-span-2">
						<motion.div 
							className="card bg-gray-900 rounded-xl overflow-hidden border border-gray-800 mb-6"
							initial={{ opacity: 0, y: -20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.3 }}
						>
							<div className="p-6">
								<h2 className="text-xl font-bold text-white mb-4">Book a Ride</h2>
								
								{activeBooking ? (
									<div className="space-y-4">
										<div className="bg-emerald-900/20 border border-emerald-800 rounded-lg p-4">
											<div className="flex items-center mb-3">
												<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
												</svg>
												<h3 className="font-bold text-lg text-emerald-100">Ride Confirmed!</h3>
											</div>
											<p className="text-emerald-200 mb-4">
												Your ride with {activeBooking.driverName} has been confirmed.
												They will arrive in approximately {activeBooking.estimatedArrival} minutes.
											</p>
											
											{bookingProgress && (
												<div className="mb-4">
													<div className="flex items-center justify-between mb-2">
														{bookingProgress.steps.map((step, index) => (
															<div key={step.id} className="flex flex-col items-center">
																<div className={`w-6 h-6 rounded-full ${
																	step.completed ? 'bg-emerald-500' : 'bg-gray-700'
																} flex items-center justify-center mb-1`}>
																	{step.completed && (
																		<svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
																			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
																		</svg>
																	)}
																</div>
																<span className="text-xs text-gray-400">{step.name}</span>
																
																{/* Connect with a line except for the last item */}
																{index < bookingProgress.steps.length - 1 && (
																	<div className={`absolute left-0 right-0 h-0.5 ${
																		step.completed && bookingProgress.steps[index + 1].completed
																			? 'bg-emerald-500'
																			: 'bg-gray-700'
																	}`} style={{ width: '80%', left: '60%', top: '12px', zIndex: '-1' }}></div>
																)}
															</div>
														))}
													</div>
												</div>
											)}
											
											<div className="grid grid-cols-2 gap-4">
												<div className="bg-emerald-900/30 p-3 rounded-lg">
													<p className="text-xs text-emerald-200 mb-1">Pickup</p>
													<p className="font-medium text-white">{activeBooking.pickup}</p>
												</div>
												<div className="bg-emerald-900/30 p-3 rounded-lg">
													<p className="text-xs text-emerald-200 mb-1">Destination</p>
													<p className="font-medium text-white">{activeBooking.destination}</p>
												</div>
											</div>
										</div>
										
										<div className="h-[40vh] w-full rounded-xl overflow-hidden border border-gray-800">
											<RideMap 
												driverLocation={{ lat: 12.9716 + (Math.random() * 0.01), lng: 77.5946 + (Math.random() * 0.01) }}
												pickupLocation={userData.currentLocation}
												dropLocation={userData.rideRequest.dropLocation}
												showRoute={true}
											/>
										</div>
										
										<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
											<div className="bg-gray-800 rounded-xl p-4 flex items-center border border-gray-700">
												<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
												</svg>
												<div>
													<p className="text-gray-400 text-sm">Arrival Time</p>
													<p className="text-white font-bold">{activeBooking.estimatedArrival} min</p>
												</div>
											</div>
											<div className="bg-gray-800 rounded-xl p-4 flex items-center border border-gray-700">
												<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
												</svg>
												<div>
													<p className="text-gray-400 text-sm">Payment</p>
													<p className="text-white font-bold">
														{userData.preferences.preferredPayment === 'card' ? 'Card' : 'UPI'}
													</p>
												</div>
											</div>
											<div className="bg-gray-800 rounded-xl p-4 flex items-center border border-gray-700">
												<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
												</svg>
												<div>
													<p className="text-gray-400 text-sm">Fare</p>
													<p className="text-white font-bold">₹{userData.rideRequest.estimatedFare}</p>
												</div>
											</div>
										</div>
										
										<button
											className="w-full bg-red-600 hover:bg-red-700 transition-all text-white font-bold py-3 px-4 rounded-xl"
											onClick={() => setActiveBooking(null)}
										>
											Cancel Ride
										</button>
									</div>
								) : (
									<>
										<div className="h-[40vh] w-full rounded-xl overflow-hidden border border-gray-800 mb-6">
											<RideMap 
												driverLocation={null}
												pickupLocation={userData.currentLocation}
												dropLocation={userData.rideRequest.dropLocation}
												showRoute={true}
											/>
										</div>
										
										<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
											<div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
												<label className="block text-sm font-medium text-gray-400 mb-2">Pickup Location</label>
												<select className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-600">
													<option value="current">Current Location ({userData.currentLocation.address})</option>
													{userData.savedLocations.map((location, index) => (
														<option key={index} value={location.name}>{location.name} - {location.address}</option>
													))}
												</select>
											</div>
											<div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
												<label className="block text-sm font-medium text-gray-400 mb-2">Destination</label>
												<select className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-600">
													{userData.savedLocations.map((location, index) => (
														<option key={index} value={location.name}>{location.name} - {location.address}</option>
													))}
												</select>
											</div>
										</div>
										
										<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
											<div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
												<label className="block text-sm font-medium text-gray-400 mb-2">Pickup Time</label>
												<select 
													className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
													value={pickupTime}
													onChange={(e) => setPickupTime(e.target.value)}
												>
													<option value="now">Now</option>
													<option value="18:30">6:30 PM Today</option>
													<option value="19:00">7:00 PM Today</option>
													<option value="19:30">7:30 PM Today</option>
												</select>
											</div>
											<div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
												<label className="block text-sm font-medium text-gray-400 mb-2">Payment Method</label>
												<select className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-600">
													{userData.paymentMethods.map((method) => (
														<option key={method.id} value={method.id}>
															{method.type === 'card' ? `Card ending in ${method.last4}` : `UPI - ${method.handle}`}
															{method.isDefault ? ' (Default)' : ''}
														</option>
													))}
												</select>
											</div>
										</div>
										
										<div className="bg-gray-800 p-4 rounded-xl border border-gray-700 mb-6">
											<div className="flex justify-between items-center mb-4">
												<div>
													<h3 className="font-bold text-white">Fare Estimate</h3>
													<p className="text-gray-400 text-sm">Based on current traffic conditions</p>
												</div>
												<div className="text-right">
													<p className="text-2xl font-bold text-white">₹{userData.rideRequest.estimatedFare}</p>
													<p className="text-gray-400 text-sm">{userData.rideRequest.estimatedDistance} km · {userData.rideRequest.estimatedTime} min</p>
												</div>
											</div>
										</div>
										
										<button
											className={`w-full py-3 px-4 rounded-xl font-bold text-white ${
												isRequesting 
													? 'bg-purple-700 hover:bg-purple-800' 
													: 'bg-purple-600 hover:bg-purple-700'
											} transition-all flex items-center justify-center`}
											onClick={requestRide}
											disabled={isRequesting || !isConnected}
										>
											{isRequesting ? (
												<>
													<svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
														<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
														<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
													</svg>
													Requesting Ride...
												</>
											) : (
												<>Request Ride</>
											)}
										</button>
									</>
								)}
							</div>
						</motion.div>
					</div>
				</div>
			</div>
			
			{/* Toast Notifications */}
			<div className="fixed bottom-4 right-4 w-full max-w-sm space-y-4 z-50">
				<AnimatePresence>
					{toasts.map((toast) => (
						<motion.div
							key={toast.id}
							initial={{ opacity: 0, y: 50, scale: 0.3 }}
							animate={{ opacity: 1, y: 0, scale: 1 }}
							exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
							className={`rounded-xl border shadow-lg ${
								toast.type === 'booking' ? 'bg-purple-900/90 border-purple-700' : 
								toast.type === 'reminder' ? 'bg-blue-900/90 border-blue-700' : 
								'bg-gray-800/90 border-gray-700'
							}`}
						>
							<div className="p-4">
								<div className="flex items-center justify-between mb-3">
									<h3 className="font-bold text-white">{toast.title}</h3>
									<button 
										onClick={() => removeToast(toast.id)}
										className="text-gray-400 hover:text-white"
									>
										<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
										</svg>
									</button>
								</div>
								
								<p className="text-gray-200 mb-3">{toast.message}</p>
								
								{toast.type === 'booking' && (
									<>
										<div className="grid grid-cols-2 gap-2 mb-3">
											<div className="bg-purple-800/50 p-2 rounded-lg">
												<p className="text-xs text-purple-200">Driver</p>
												<div className="flex items-center">
													<p className="text-sm text-white">{toast.driverName}</p>
													<div className="flex items-center ml-1">
														<svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-yellow-400 mr-1" viewBox="0 0 20 20" fill="currentColor">
															<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
														</svg>
														<span className="text-xs text-white">{toast.driverRating}</span>
													</div>
												</div>
											</div>
											<div className="bg-purple-800/50 p-2 rounded-lg">
												<p className="text-xs text-purple-200">Vehicle</p>
												<p className="text-sm text-white">
													{toast.vehicleDetails?.color} {toast.vehicleDetails?.type}
												</p>
											</div>
										</div>
										
										<div className="grid grid-cols-3 gap-2">
											<button
												onClick={() => handleBookingResponse(toast.rideId, 'reject')}
												className="bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg text-sm"
											>
												Reject
											</button>
											<button
												onClick={() => handleBookingResponse(toast.rideId, 'remind')}
												className="bg-blue-700 hover:bg-blue-600 text-white py-2 rounded-lg text-sm"
											>
												Remind Me
											</button>
											<button
												onClick={() => handleBookingResponse(toast.rideId, 'accept')}
												className="bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-lg text-sm font-bold"
											>
												Accept
											</button>
										</div>
									</>
								)}
								
								{toast.type === 'reminder' && (
									<div className="grid grid-cols-2 gap-2">
										<button
											onClick={() => handleBookingResponse(toast.rideId, 'reject')}
											className="bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg text-sm"
										>
											Reject
										</button>
										<button
											onClick={() => handleBookingResponse(toast.rideId, 'accept')}
											className="bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-lg text-sm font-bold"
										>
											Accept
										</button>
									</div>
								)}
							</div>
						</motion.div>
					))}
				</AnimatePresence>
			</div>
		</div>
	)
}