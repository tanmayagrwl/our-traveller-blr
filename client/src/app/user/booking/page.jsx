'use client'

import { useState, useEffect, useCallback } from 'react'
import Navbar from '@/components/ui/Navbar'
import RideMap from '@/components/maps/RideMapUser'
import StandLocations from '@/components/maps/StandLocations'
import { mockUserLocation, mockStandLocations } from '@/utils/mockData'
import { motion, AnimatePresence } from 'framer-motion'
import useSocket from '@/hooks/useSocket'

export default function UserBooking() {
	// Core state
	const [userLocation, setUserLocation] = useState(mockUserLocation)
	const [destination, setDestination] = useState('')
	const [pickupLocation, setPickupLocation] = useState('...')
	const [bookingStep, setBookingStep] = useState(1)
	const [selectedVehicle, setSelectedVehicle] = useState('auto')
	const [showStands, setShowStands] = useState(false)
	const [paymentMethod, setPaymentMethod] = useState('cash')
	const [standLocations] = useState(mockStandLocations)
	
	// Ride specifics
	const [estimatedTime, setEstimatedTime] = useState(15)
	const [estimatedFare, setEstimatedFare] = useState(0)
	const [driverDetails, setDriverDetails] = useState(null)
	const [riderId] = useState('user-' + Math.floor(Math.random() * 10000))
	
	// Socket connection
	const { isConnected, lastMessage, sendMessage } = useSocket('ws://localhost:5000')
	
	// Calculate fare when destination or vehicle type changes
	useEffect(() => {
		if (!destination) return
		
		const baseFare = selectedVehicle === 'auto' ? 50 : selectedVehicle === 'mini' ? 80 : 120
		const estimatedDistance = Math.floor(Math.random() * 8) + 3
		const surgeMultiplier = Math.random() > 0.7 ? 1.5 : 1.2
		
		setEstimatedFare(Math.round(baseFare + (estimatedDistance * 12 * surgeMultiplier)))
		setEstimatedTime(Math.floor(Math.random() * 10) + 10)
	}, [destination, selectedVehicle])
	
	// Get current fare based on vehicle
	const getCurrentFare = useCallback(() => {
		if (selectedVehicle === 'auto') return Math.round(estimatedFare * 0.8)
		if (selectedVehicle === 'mini') return Math.round(estimatedFare * 1.2) 
		return Math.round(estimatedFare * 1.5)
	}, [estimatedFare, selectedVehicle])

	useEffect(() => {
		if (!lastMessage) return
		
		const { type } = lastMessage
		
		switch (type) {
			case 'driver_accepted':
				console.log('Driver accepted ride:', lastMessage.driver)
				setDriverDetails(lastMessage.driver)
				setBookingStep(4)
				break
				
			case 'booking_received':
				// Confirmation that booking was received by server
				console.log('Booking received by server:', lastMessage.rideId)
				setDriverDetails(lastMessage.driver)
				break
				
			case 'no_drivers':
				setTimeout(() => {
					// Mock driver details as fallback
					setDriverDetails({
						name: 'Rahul K.',
						rating: 4.8,
						rides: '1240+',
						vehicleNumber: 'KA 01 AB 1234',
						vehicleType: 'White Auto'
					})
					setBookingStep(4)
				}, 1500)
				break
				
			case 'ride_cancelled':
				setBookingStep(1)
				setDestination('')
				setDriverDetails(null)
				break
		}
	}, [lastMessage, setDriverDetails, setBookingStep, setDestination])
	
	// Form submission for destination search
	const handleSearch = (e) => {
		e.preventDefault()
		if (destination.trim()) {
			setBookingStep(2)
		}
	}
	
	// Send booking request
	const confirmBooking = () => {
		setBookingStep(3)
		
		const bookingData = {
			type: 'booking_request',
			pickupLocation: pickupLocation === 'Current Location' ? userLocation : { lat: 0, lng: 0, address: pickupLocation },
			destination,
			userId: riderId,
			vehicleType: selectedVehicle,
			paymentMethod,
			estimatedFare: getCurrentFare(),
			timestamp: new Date().toISOString()
		}
		
		if (isConnected) {
			sendMessage(bookingData)
		}
		
		setTimeout(() => {
			if (bookingStep === 3 && !driverDetails) {
				setDriverDetails({
					name: 'Rahul K.',
					rating: 4.8,
					rides: '1240+',
					vehicleNumber: 'KA 01 AB 1234',
					vehicleType: `White ${selectedVehicle.charAt(0).toUpperCase() + selectedVehicle.slice(1)}`
				})
				setBookingStep(4)
			}
		}, 2000)
	}
	
	const cancelRide = () => {
		if (driverDetails) {
			sendMessage({
				type: 'cancel_ride',
				userId: riderId,
				timestamp: new Date().toISOString()
			})
		}
		
		setBookingStep(1)
		setDestination('')
		setDriverDetails(null)
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
					<h1 className="text-3xl font-bold mb-6 text-white">Book a Ride</h1>
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
							className="card bg-gray-900 shadow-2xl border border-gray-800 rounded-xl overflow-hidden"
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.3, delay: 0.1 }}
						>
							<div className="card-body p-6">
								<AnimatePresence mode="wait">
									{bookingStep === 1 && (
										<motion.div
											key="step1"
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											exit={{ opacity: 0 }}
										>
											<h2 className="card-title text-xl font-bold text-white mb-4">Where to?</h2>
											<form onSubmit={handleSearch}>
												<div className="form-control mb-4">
													<label className="label font-medium text-gray-300">Pickup Location</label>
													<div className="input-group">
														<span className="bg-gray-800 px-4 flex items-center text-emerald-400 border-r border-gray-700">
															<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
																<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
																<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
															</svg>
														</span>
														<input 
															type="text" 
															value={pickupLocation}
															onChange={(e) => setPickupLocation(e.target.value)}
															className="input bg-gray-800 border-gray-700 text-white w-full focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" 
														/>
													</div>
												</div>
												
												<div className="form-control mb-4">
													<label className="label font-medium text-gray-300">Destination</label>
													<div className="input-group">
														<span className="bg-gray-800 px-4 flex items-center text-emerald-400 border-r border-gray-700">
															<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
																<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
																<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
															</svg>
														</span>
														<input 
															type="text" 
															placeholder="Where are you going?" 
															value={destination}
															onChange={(e) => setDestination(e.target.value)}
															className="input bg-gray-800 border-gray-700 text-white w-full focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" 
															required
														/>
													</div>
												</div>
												
												<div className="form-control mb-4">
													<label className="flex items-center justify-between cursor-pointer bg-gray-800 p-3 rounded-lg border border-gray-700">
														<div>
															<span className="label-text font-medium text-gray-300">Show pickup stands</span>
															<p className="text-xs text-gray-400 mt-1">Reduces wait time and fare during peak hours</p>
														</div>
														<input 
															type="checkbox" 
															className="toggle bg-gray-700"
															style={{ backgroundColor: showStands ? "#10b981" : "#374151" }}
															checked={showStands} 
															onChange={() => setShowStands(!showStands)} 
														/>
													</label>
												</div>
												
												<motion.button 
													type="submit" 
													className="btn bg-emerald-600 text-white hover:bg-emerald-700 border-none w-full font-bold"
													whileHover={{ scale: 1.02 }}
													whileTap={{ scale: 0.98 }}
													disabled={!destination.trim()}
												>
													Find Rides
												</motion.button>
											</form>
										</motion.div>
									)}
									
									{bookingStep === 2 && (
										<motion.div
											key="step2"
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											exit={{ opacity: 0 }}
										>
											<h2 className="card-title text-xl font-bold text-white mb-4">Choose a ride</h2>
											
											<div className="flex flex-col gap-4 mb-4">
												<motion.div 
													className={`rounded-lg ${selectedVehicle === 'auto' ? 'bg-emerald-900/30 border-emerald-500' : 'bg-gray-800 border-gray-700'} cursor-pointer border-2 transition-all hover:border-emerald-500`}
													onClick={() => setSelectedVehicle('auto')}
													whileHover={{ y: -2 }}
													whileTap={{ scale: 0.98 }}
												>
													<div className="p-4">
														<div className="flex justify-between items-center">
															<div className="flex items-center gap-3">
																<div className="p-2 bg-emerald-900/50 rounded-lg">
																	<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
																		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
																	</svg>
																</div>
																<div>
																	<p className="font-bold text-white">Auto</p>
																	<p className="text-sm text-gray-300">{estimatedTime} min</p>
																</div>
															</div>
															<div className="text-right">
																<p className="font-bold text-white text-lg">₹{Math.round(estimatedFare * 0.8)}</p>
																<p className="text-xs line-through text-gray-400">₹{estimatedFare}</p>
															</div>
															{selectedVehicle === 'auto' && (
																<div className="absolute right-2 top-2">
																	<div className="w-4 h-4 bg-emerald-500 rounded-full"></div>
																</div>
															)}
														</div>
													</div>
												</motion.div>
												
												<motion.div 
													className={`rounded-lg ${selectedVehicle === 'mini' ? 'bg-emerald-900/30 border-emerald-500' : 'bg-gray-800 border-gray-700'} cursor-pointer border-2 transition-all hover:border-emerald-500`}
													onClick={() => setSelectedVehicle('mini')}
													whileHover={{ y: -2 }}
													whileTap={{ scale: 0.98 }}
												>
													<div className="p-4">
														<div className="flex justify-between items-center">
															<div className="flex items-center gap-3">
																<div className="p-2 bg-emerald-900/50 rounded-lg">
																	<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
																		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
																	</svg>
																</div>
																<div>
																	<p className="font-bold text-white">Mini</p>
																	<p className="text-sm text-gray-300">{estimatedTime - 2} min</p>
																</div>
															</div>
															<div className="text-right">
																<p className="font-bold text-white text-lg">₹{Math.round(estimatedFare * 1.2)}</p>
															</div>
															{selectedVehicle === 'mini' && (
																<div className="absolute right-2 top-2">
																	<div className="w-4 h-4 bg-emerald-500 rounded-full"></div>
																</div>
															)}
														</div>
													</div>
												</motion.div>
												
												<motion.div 
													className={`rounded-lg ${selectedVehicle === 'premium' ? 'bg-emerald-900/30 border-emerald-500' : 'bg-gray-800 border-gray-700'} cursor-pointer border-2 transition-all hover:border-emerald-500`}
													onClick={() => setSelectedVehicle('premium')}
													whileHover={{ y: -2 }}
													whileTap={{ scale: 0.98 }}
												>
													<div className="p-4">
														<div className="flex justify-between items-center">
															<div className="flex items-center gap-3">
																<div className="p-2 bg-emerald-900/50 rounded-lg">
																	<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
																		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
																	</svg>
																</div>
																<div>
																	<p className="font-bold text-white">Premium</p>
																	<p className="text-sm text-gray-300">{estimatedTime - 4} min</p>
																</div>
															</div>
															<div className="text-right">
																<p className="font-bold text-white text-lg">₹{Math.round(estimatedFare * 1.5)}</p>
															</div>
															{selectedVehicle === 'premium' && (
																<div className="absolute right-2 top-2">
																	<div className="w-4 h-4 bg-emerald-500 rounded-full"></div>
																</div>
															)}
														</div>
													</div>
												</motion.div>
											</div>
											
											<div className="bg-gray-800 p-4 rounded-lg border border-gray-700 mb-4">
												<h3 className="font-bold text-white mb-2">Payment Method</h3>
												<div className="grid grid-cols-3 gap-2">
													<label className="flex flex-col items-center justify-center gap-2 p-3 cursor-pointer rounded-lg transition-all hover:bg-gray-700" style={{ backgroundColor: paymentMethod === 'cash' ? "rgba(16, 185, 129, 0.2)" : "" }}>
														<input 
															type="radio" 
															name="payment" 
															className="radio" 
															checked={paymentMethod === 'cash'}
															onChange={() => setPaymentMethod('cash')}
															hidden
														/>
														<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
														</svg>
														<span className="text-sm font-medium text-gray-300">Cash</span>
													</label>
													<label className="flex flex-col items-center justify-center gap-2 p-3 cursor-pointer rounded-lg transition-all hover:bg-gray-700" style={{ backgroundColor: paymentMethod === 'wallet' ? "rgba(16, 185, 129, 0.2)" : "" }}>
														<input 
															type="radio" 
															name="payment" 
															className="radio" 
															checked={paymentMethod === 'wallet'}
															onChange={() => setPaymentMethod('wallet')}
															hidden
														/>
														<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
														</svg>
														<span className="text-sm font-medium text-gray-300">Wallet</span>
													</label>
													<label className="flex flex-col items-center justify-center gap-2 p-3 cursor-pointer rounded-lg transition-all hover:bg-gray-700" style={{ backgroundColor: paymentMethod === 'card' ? "rgba(16, 185, 129, 0.2)" : "" }}>
														<input 
															type="radio" 
															name="payment" 
															className="radio" 
															checked={paymentMethod === 'card'}
															onChange={() => setPaymentMethod('card')}
															hidden
														/>
														<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
														</svg>
														<span className="text-sm font-medium text-gray-300">Card</span>
													</label>
												</div>
											</div>
											
											<div className="flex flex-col gap-2">
												<motion.button 
													className="btn bg-emerald-600 text-white hover:bg-emerald-700 border-none w-full font-bold"
													onClick={confirmBooking}
													whileHover={{ scale: 1.02 }}
													whileTap={{ scale: 0.98 }}
												>
													Confirm {selectedVehicle.charAt(0).toUpperCase() + selectedVehicle.slice(1)}
												</motion.button>
												<motion.button 
													className="btn bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700 w-full font-medium"
													onClick={() => setBookingStep(1)}
													whileHover={{ scale: 1.02 }}
													whileTap={{ scale: 0.98 }}
												>
													Back
												</motion.button>
											</div>
										</motion.div>
									)}
									
									{bookingStep === 3 && (
										<motion.div
											key="step3"
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											exit={{ opacity: 0 }}
											className="flex flex-col items-center justify-center py-8"
										>
											<div className="animate-spin rounded-full h-20 w-20 border-b-4 border-t-4 border-emerald-500"></div>
											<h3 className="font-bold text-xl mt-6 text-white">Finding your ride...</h3>
											<p className="text-base text-gray-300 mt-2">This may take a moment</p>
											<p className="text-sm text-gray-400 mt-4">Matching with nearby {selectedVehicle} drivers</p>
											
											{!isConnected && (
												<div className="bg-red-900/30 text-red-100 p-5 rounded-lg mt-6 border border-red-800 w-full">
													<div className="flex items-center">
														<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
														</svg>
														<h3 className="font-bold text-lg">Connection error</h3>
													</div>
													<p className="text-base mt-2 ml-9">Reconnecting to booking service...</p>
												</div>
											)}
										</motion.div>
									)}
									
									{bookingStep === 4 && driverDetails && (
										<motion.div
											key="step4"
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											exit={{ opacity: 0 }}
										>
											<div className="bg-emerald-900/30 text-emerald-100 p-4 rounded-lg mb-5 border border-emerald-800">
												<div className="flex items-center">
													<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
													</svg>
													<h3 className="font-bold text-lg">Driver found!</h3>
												</div>
											</div>
											
											<div className="flex items-center gap-4 mb-5 bg-gray-800 p-4 rounded-lg border border-gray-700">
												<div className="avatar">
													<div className="w-20 h-20 rounded-full ring-2 ring-emerald-500 ring-offset-2 ring-offset-gray-800">
														<img src="https://plus.unsplash.com/premium_photo-1739786996022-5ed5b56834e2?q=80&w=2080&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Driver" />
													</div>
												</div>
												<div>
													<h3 className="font-bold text-xl text-white">{driverDetails.name}</h3>
													<div className="flex items-center mt-1">
														<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
															<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
														</svg>
														<span className="text-base ml-1 font-medium text-white">{driverDetails.rating}</span>
														<span className="text-sm ml-2 text-gray-300">· {driverDetails.rides} rides</span>
													</div>
													<p className="text-base text-gray-300 mt-1">{driverDetails.vehicleNumber} · {driverDetails.vehicleType}</p>
												</div>
											</div>
											
											<div className="bg-gray-800 p-5 rounded-lg mb-5 border border-gray-700">
												<div className="grid grid-cols-3 gap-4">
													<div className="text-center">
														<p className="text-sm text-gray-400">ETA</p>
														<p className="font-bold text-lg text-white">5 min</p>
													</div>
													<div className="text-center border-x border-gray-700">
														<p className="text-sm text-gray-400">Fare</p>
														<p className="font-bold text-lg text-white">₹{getCurrentFare()}</p>
													</div>
													<div className="text-center">
														<p className="text-sm text-gray-400">Payment</p>
														<p className="font-bold text-lg text-white">{paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1)}</p>
													</div>
												</div>
											</div>
											
											<div className="grid grid-cols-2 gap-4 mb-4">
												<motion.button 
													className="btn-lg bg-gray-800 text-white hover:bg-gray-700 rounded-xl flex items-center justify-center gap-2 py-3 font-medium"
													whileHover={{ scale: 1.03 }}
													whileTap={{ scale: 0.97 }}
												>
													<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
													</svg>
													Chat
												</motion.button>
											</div>
											
											<motion.button 
												className="btn bg-red-600 text-white hover:bg-red-700 border-none w-full font-bold flex items-center justify-center gap-2 py-4"
												onClick={cancelRide}
												whileHover={{ scale: 1.02 }}
												whileTap={{ scale: 0.98 }}
											>
												<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
												</svg>
												Cancel Ride
											</motion.button>
										</motion.div>
									)}
								</AnimatePresence>
							</div>
						</motion.div>
					</div>
					
					<div className="lg:col-span-2">
						<motion.div 
							className="card bg-gray-900 shadow-2xl border border-gray-800 rounded-xl overflow-hidden"
							initial={{ opacity: 0, y: -20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.3, delay: 0.2 }}
						>
							<div className="card-body p-6">
								<h2 className="card-title text-xl font-bold text-white mb-4">Live Map</h2>
								<div className="h-[70vh] w-full rounded-xl overflow-hidden border border-gray-800">
									{showStands ? (
										<StandLocations
											standLocations={standLocations}
											userLocation={userLocation}
											showStandsBenefits={true}
										/>
									) : (
										<RideMap 
											userLocation={userLocation} 
											showRouteEstimate={destination ? true : false}
											driverLocation={bookingStep === 4 ? { lat: userLocation.lat + 0.002, lng: userLocation.lng + 0.001 } : null}
											destination={destination || ""}
										/>
									)}
								</div>
								
								{bookingStep === 2 && (
									<div className="bg-blue-900/40 p-4 mt-4 rounded-lg border border-blue-800 flex items-start gap-3">
										<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-blue-400 shrink-0 w-6 h-6 mt-1">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
										</svg>
										<div>
											<h3 className="font-bold text-blue-100">Surge Pricing Active</h3>
											<p className="text-blue-200 mt-1">Current surge multiplier: 1.5x. Using a nearby stand can reduce your fare by up to 20%.</p>
										</div>
									</div>
								)}
								
								{bookingStep === 4 && (
									<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
										<div className="bg-gray-800 rounded-xl p-4 flex items-center border border-gray-700">
											<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-emerald-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
											</svg>
											<div>
												<p className="text-gray-400 text-sm">Est. Arrival</p>
												<p className="text-white font-bold text-lg">5 min</p>
											</div>
										</div>
										
										<div className="bg-gray-800 rounded-xl p-4 flex items-center border border-gray-700">
											<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-emerald-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
											</svg>
											<div>
												<p className="text-gray-400 text-sm">Distance</p>
												<p className="text-white font-bold text-lg">3.2 km</p>
											</div>
										</div>
										
										<div className="bg-gray-800 rounded-xl p-4 flex items-center border border-gray-700">
											<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-emerald-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
											</svg>
											<div>
												<p className="text-gray-400 text-sm">Payment</p>
												<p className="text-white font-bold text-lg">{paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1)}</p>
											</div>
										</div>
									</div>
								)}
							</div>
						</motion.div>
					</div>
				</div>
			</div>
		</div>
	)
}