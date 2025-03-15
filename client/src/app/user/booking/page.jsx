'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/ui/Navbar'
import RideMap from '@/components/maps/RideMap'
import StandLocations from '@/components/maps/StandLocations'
import { mockUserLocation, mockStandLocations, mockPricingData } from '@/utils/mockData'
import { motion } from 'framer-motion'

export default function UserBooking() {
	const [userLocation, setUserLocation] = useState(mockUserLocation)
	const [destination, setDestination] = useState('')
	const [pickupLocation, setPickupLocation] = useState('Current Location')
	const [estimatedTime, setEstimatedTime] = useState(15)
	const [estimatedFare, setEstimatedFare] = useState(0)
	const [pricingData, setPricingData] = useState(mockPricingData)
	const [bookingStep, setBookingStep] = useState(1)
	const [selectedVehicle, setSelectedVehicle] = useState('auto')
	const [standLocations, setStandLocations] = useState(mockStandLocations)
	const [showStands, setShowStands] = useState(false)
	const [paymentMethod, setPaymentMethod] = useState('cash')
	
	useEffect(() => {
		if (destination) {
			const baseFare = selectedVehicle === 'auto' ? 50 : selectedVehicle === 'mini' ? 80 : 120
			const estimatedDistance = Math.floor(Math.random() * 8) + 3
			const surgeMultiplier = Math.random() > 0.7 ? 1.5 : 1.2
			
			setEstimatedFare(Math.round(baseFare + (estimatedDistance * 12 * surgeMultiplier)))
			setEstimatedTime(Math.floor(Math.random() * 10) + 10)
		}
	}, [destination, selectedVehicle])
	
	const handleSearch = (e) => {
		e.preventDefault()
		if (destination) {
			setBookingStep(2)
		}
	}
	
	const confirmBooking = () => {
		setBookingStep(3)
		setTimeout(() => {
			setBookingStep(4)
		}, 3000)
	}
	
	return (
		<div className="min-h-screen bg-gray-900 text-white">
			<Navbar />
			
			<div className="container mx-auto px-4 py-8">
				<motion.h1 
					className="text-3xl font-bold mb-6 text-white"
					initial={{ opacity: 0, y: -10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3 }}
				>
					Book a Ride
				</motion.h1>
				
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					<div className="lg:col-span-1">
						<motion.div 
							className="card bg-gray-800 shadow-xl border border-gray-700"
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.3, delay: 0.1 }}
						>
							<div className="card-body">
								{bookingStep === 1 && (
									<>
										<h2 className="card-title text-white">Where to?</h2>
										<form onSubmit={handleSearch}>
											<div className="form-control mt-4">
												<div className="input-group">
													<span className="bg-gray-700 px-4 flex items-center text-gray-300">
														<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
														</svg>
													</span>
													<input 
														type="text" 
														value={pickupLocation}
														onChange={(e) => setPickupLocation(e.target.value)}
														className="input bg-gray-700 border-gray-600 text-white w-full" 
													/>
												</div>
											</div>
											
											<div className="form-control mt-4">
												<div className="input-group">
													<span className="bg-gray-700 px-4 flex items-center text-gray-300">
														<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
														</svg>
													</span>
													<input 
														type="text" 
														placeholder="Destination" 
														value={destination}
														onChange={(e) => setDestination(e.target.value)}
														className="input bg-gray-700 border-gray-600 text-white w-full" 
														required
													/>
												</div>
											</div>
											
											<div className="form-control mt-4">
												<label className="label cursor-pointer">
													<span className="label-text text-gray-300">Show pickup stands near me</span> 
													<input 
														type="checkbox" 
														className="toggle bg-gray-700"
														style={{ backgroundColor: showStands ? "#10b981" : "#374151" }}
														checked={showStands} 
														onChange={() => setShowStands(!showStands)} 
													/>
												</label>
												<label className="label text-xs text-gray-400">
													<span>Using stands reduces wait time and fare during peak hours</span>
												</label>
											</div>
											
											<motion.button 
												type="submit" 
												className="btn bg-emerald-500 text-white hover:bg-emerald-600 border-none w-full mt-4"
												whileHover={{ scale: 1.02 }}
												whileTap={{ scale: 0.98 }}
											>
												Search
											</motion.button>
										</form>
									</>
								)}
								
								{bookingStep === 2 && (
									<>
										<h2 className="card-title text-white">Choose a ride</h2>
										
										<div className="flex flex-col gap-4 mt-4">
											<motion.div 
												className={`card ${selectedVehicle === 'auto' ? 'bg-emerald-900/70 border-emerald-500' : 'bg-gray-700 border-gray-600'} cursor-pointer border transition-all`}
												onClick={() => setSelectedVehicle('auto')}
												whileHover={{ scale: 1.02 }}
												whileTap={{ scale: 0.98 }}
											>
												<div className="card-body p-4">
													<div className="flex justify-between items-center">
														<div className="flex items-center gap-2">
															<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
																<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
															</svg>
															<div>
																<p className="font-bold text-white">Auto</p>
																<p className="text-xs text-gray-300">{estimatedTime} min</p>
															</div>
														</div>
														<div>
															<p className="font-bold text-white">₹{Math.round(estimatedFare * 0.8)}</p>
															<p className="text-xs line-through text-gray-400">₹{estimatedFare}</p>
														</div>
													</div>
												</div>
											</motion.div>
											
											<motion.div 
												className={`card ${selectedVehicle === 'mini' ? 'bg-emerald-900/70 border-emerald-500' : 'bg-gray-700 border-gray-600'} cursor-pointer border transition-all`}
												onClick={() => setSelectedVehicle('mini')}
												whileHover={{ scale: 1.02 }}
												whileTap={{ scale: 0.98 }}
											>
												<div className="card-body p-4">
													<div className="flex justify-between items-center">
														<div className="flex items-center gap-2">
															<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
																<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
															</svg>
															<div>
																<p className="font-bold text-white">Mini</p>
																<p className="text-xs text-gray-300">{estimatedTime - 2} min</p>
															</div>
														</div>
														<div>
															<p className="font-bold text-white">₹{Math.round(estimatedFare * 1.2)}</p>
														</div>
													</div>
												</div>
											</motion.div>
											
											<motion.div 
												className={`card ${selectedVehicle === 'premium' ? 'bg-emerald-900/70 border-emerald-500' : 'bg-gray-700 border-gray-600'} cursor-pointer border transition-all`}
												onClick={() => setSelectedVehicle('premium')}
												whileHover={{ scale: 1.02 }}
												whileTap={{ scale: 0.98 }}
											>
												<div className="card-body p-4">
													<div className="flex justify-between items-center">
														<div className="flex items-center gap-2">
															<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
																<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
															</svg>
															<div>
																<p className="font-bold text-white">Premium</p>
																<p className="text-xs text-gray-300">{estimatedTime - 4} min</p>
															</div>
														</div>
														<div>
															<p className="font-bold text-white">₹{Math.round(estimatedFare * 1.5)}</p>
														</div>
													</div>
												</div>
											</motion.div>
										</div>
										
										<div className="form-control mt-4">
											<label className="label text-sm font-bold text-white">
												Payment Method
											</label>
											<div className="flex gap-2">
												<label className="label cursor-pointer justify-start gap-2">
													<input 
														type="radio" 
														name="payment" 
														className="radio" 
														style={{ backgroundColor: paymentMethod === 'cash' ? "#10b981" : "#374151" }}
														checked={paymentMethod === 'cash'}
														onChange={() => setPaymentMethod('cash')}
													/>
													<span className="label-text text-gray-300">Cash</span> 
												</label>
												<label className="label cursor-pointer justify-start gap-2">
													<input 
														type="radio" 
														name="payment" 
														className="radio" 
														style={{ backgroundColor: paymentMethod === 'wallet' ? "#10b981" : "#374151" }}
														checked={paymentMethod === 'wallet'}
														onChange={() => setPaymentMethod('wallet')}
													/>
													<span className="label-text text-gray-300">Wallet</span> 
												</label>
												<label className="label cursor-pointer justify-start gap-2">
													<input 
														type="radio" 
														name="payment" 
														className="radio" 
														style={{ backgroundColor: paymentMethod === 'card' ? "#10b981" : "#374151" }}
														checked={paymentMethod === 'card'}
														onChange={() => setPaymentMethod('card')}
													/>
													<span className="label-text text-gray-300">Card</span> 
												</label>
											</div>
										</div>
										
										<div className="mt-4">
											<motion.button 
												className="btn bg-emerald-500 text-white hover:bg-emerald-600 border-none w-full"
												onClick={confirmBooking}
												whileHover={{ scale: 1.02 }}
												whileTap={{ scale: 0.98 }}
											>
												Confirm {selectedVehicle.charAt(0).toUpperCase() + selectedVehicle.slice(1)}
											</motion.button>
											<motion.button 
												className="btn bg-gray-700 text-gray-300 hover:bg-gray-600 border-none w-full mt-2"
												onClick={() => setBookingStep(1)}
												whileHover={{ scale: 1.02 }}
												whileTap={{ scale: 0.98 }}
											>
												Back
											</motion.button>
										</div>
									</>
								)}
								
								{bookingStep === 3 && (
									<div className="flex flex-col items-center justify-center py-8">
										<div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-500"></div>
										<h3 className="font-bold text-lg mt-4 text-white">Finding your ride...</h3>
										<p className="text-sm text-gray-400 mt-2">This may take a moment</p>
										<p className="text-xs text-gray-500 mt-4">Matching with nearby drivers</p>
									</div>
								)}
								
								{bookingStep === 4 && (
									<>
										<div className="bg-emerald-900/50 text-emerald-100 p-4 rounded-lg mb-4 border border-emerald-700">
											<div className="flex items-center">
												<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
												</svg>
												<h3 className="font-bold">Driver found!</h3>
											</div>
										</div>
										
										<div className="flex items-center gap-4 mb-4">
											<div className="avatar">
												<div className="w-16 rounded-full">
													<img src="https://plus.unsplash.com/premium_photo-1739786996022-5ed5b56834e2?q=80&w=2080&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" />
												</div>
											</div>
											<div>
												<h3 className="font-bold text-lg text-white">Rahul K.</h3>
												<div className="flex items-center">
													<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
														<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
													</svg>
													<span className="text-sm ml-1 text-gray-300">4.8</span>
													<span className="text-xs ml-2 text-gray-400">1240+ rides</span>
												</div>
												<p className="text-sm text-gray-300">KA 01 AB 1234 • White Auto</p>
											</div>
										</div>
										
										<div className="bg-gray-700 p-4 rounded-lg mb-4 border border-gray-600">
											<div className="flex justify-between mb-2">
												<span className="text-sm text-gray-300">ETA:</span>
												<span className="font-bold text-white">5 min</span>
											</div>
											<div className="flex justify-between mb-2">
												<span className="text-sm text-gray-300">Fare:</span>
												<span className="font-bold text-white">₹{selectedVehicle === 'auto' ? Math.round(estimatedFare * 0.8) : selectedVehicle === 'mini' ? Math.round(estimatedFare * 1.2) : Math.round(estimatedFare * 1.5)}</span>
											</div>
											<div className="flex justify-between">
												<span className="text-sm text-gray-300">Payment:</span>
												<span className="font-bold text-white">{paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1)}</span>
											</div>
										</div>
										
										<div className="flex gap-2">
											<motion.button 
												className="btn btn-outline border-gray-500 text-gray-300 hover:bg-gray-700 flex-1"
												whileHover={{ scale: 1.02 }}
												whileTap={{ scale: 0.98 }}
											>
												<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
												</svg>
												Call
											</motion.button>
											<motion.button 
												className="btn btn-outline border-gray-500 text-gray-300 hover:bg-gray-700 flex-1"
												whileHover={{ scale: 1.02 }}
												whileTap={{ scale: 0.98 }}
											>
												<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
												</svg>
												Chat
											</motion.button>
										</div>
										
										<motion.button 
											className="btn bg-red-500 text-white hover:bg-red-600 border-none w-full mt-4"
											whileHover={{ scale: 1.02 }}
											whileTap={{ scale: 0.98 }}
										>
											Cancel Ride
										</motion.button>
									</>
								)}
							</div>
						</motion.div>
					</div>
					
					<div className="lg:col-span-2">
						<motion.div 
							className="card bg-gray-800 shadow-xl border border-gray-700"
							initial={{ opacity: 0, y: -20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.3, delay: 0.2 }}
						>
							<div className="card-body">
								<h2 className="card-title text-white">Map</h2>
								<div className="h-[70vh] w-full rounded-lg overflow-hidden">
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
										/>
									)}
								</div>
								
								{bookingStep === 2 && (
									<div className="alert bg-blue-900/50 mt-4 border border-blue-700">
										<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-blue-400 shrink-0 w-6 h-6">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
										</svg>
										<span className="text-blue-100">Current surge pricing: 1.5x. Consider using a nearby stand to get regular pricing.</span>
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