'use client'

import { useState } from 'react'
import Navbar from '@/components/ui/Navbar'
import RideMap from '@/components/maps/RideMap'
import { 
	mockUserLocation, 
	mockCarpoolMatches, 
	mockAlertMessages,
	mockIcons 
} from '@/utils/mockData'
import { motion } from 'framer-motion'

export default function UserCarpooling() {
	const [userLocation, setUserLocation] = useState(mockUserLocation)
	const [destination, setDestination] = useState('')
	const [date, setDate] = useState('')
	const [time, setTime] = useState('')
	const [passengers, setPassengers] = useState(1)
	const [showMatches, setShowMatches] = useState(false)
	const [matches, setMatches] = useState([])
	const [bookingDetails, setBookingDetails] = useState(null)
	
	const handleSearch = (e) => {
		e.preventDefault()
		setMatches(mockCarpoolMatches)
		setShowMatches(true)
	}
	
	const bookCarpool = (carpoolId) => {
		const selected = matches.find(match => match.id === carpoolId)
		setBookingDetails(selected)
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
					Carpooling
				</motion.h1>
				
				<motion.div 
					className="alert bg-purple-900/50 mb-6 border border-purple-700"
					initial={{ opacity: 0, y: -10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3, delay: 0.1 }}
				>
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-purple-400 shrink-0 w-6 h-6">
						{mockIcons.info}
					</svg>
					<span className="text-purple-100">{mockAlertMessages.carpoolSavings}</span>
				</motion.div>
				
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					<div className="lg:col-span-1">
						<motion.div 
							className="card bg-gray-800 shadow-xl border border-gray-700"
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.3, delay: 0.2 }}
						>
							<div className="card-body">
								<h2 className="card-title text-white font-bold">Find a Carpool</h2>
								
								{!bookingDetails ? (
									<form onSubmit={handleSearch}>
										<div className="form-control mt-4">
											<label className="label">
												<span className="label-text text-gray-300 font-medium">Pickup Location</span>
											</label>
											<input 
												type="text" 
												className="input bg-gray-700 border-gray-600 text-white w-full focus:border-purple-500" 
												defaultValue="Current Location"
											/>
										</div>
										
										<div className="form-control mt-4">
											<label className="label">
												<span className="label-text text-gray-300 font-medium">Destination</span>
											</label>
											<input 
												type="text" 
												className="input bg-gray-700 border-gray-600 text-white w-full focus:border-purple-500" 
												placeholder="Where are you going?"
												value={destination}
												onChange={(e) => setDestination(e.target.value)}
												required
											/>
										</div>
										
										<div className="form-control mt-4">
											<label className="label">
												<span className="label-text text-gray-300 font-medium">Date</span>
											</label>
											<input 
												type="date" 
												className="input bg-gray-700 border-gray-600 text-white w-full focus:border-purple-500" 
												value={date}
												onChange={(e) => setDate(e.target.value)}
												required
											/>
										</div>
										
										<div className="form-control mt-4">
											<label className="label">
												<span className="label-text text-gray-300 font-medium">Time</span>
											</label>
											<input 
												type="time" 
												className="input bg-gray-700 border-gray-600 text-white w-full focus:border-purple-500" 
												value={time}
												onChange={(e) => setTime(e.target.value)}
												required
											/>
										</div>
										
										<div className="form-control mt-4">
											<label className="label">
												<span className="label-text text-gray-300 font-medium">Passengers</span>
											</label>
											<select 
												className="select bg-gray-700 border-gray-600 text-white w-full focus:border-purple-500"
												value={passengers}
												onChange={(e) => setPassengers(parseInt(e.target.value))}
											>
												<option value="1">1 passenger</option>
												<option value="2">2 passengers</option>
												<option value="3">3 passengers</option>
												<option value="4">4 passengers</option>
											</select>
										</div>
										
										<motion.button 
											type="submit" 
											className="btn bg-purple-500 text-white hover:bg-purple-600 border-none w-full mt-6 font-bold"
											whileHover={{ scale: 1.02 }}
											whileTap={{ scale: 0.98 }}
										>
											Search Carpools
										</motion.button>
									</form>
								) : (
									<div>
										<div className="bg-purple-900/50 text-purple-100 p-4 rounded-lg mb-4 border border-purple-700">
											<div className="flex items-center">
												<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													{mockIcons.check}
												</svg>
												<h3 className="font-bold">Carpool Booked!</h3>
											</div>
										</div>
										
										<div className="flex items-center gap-4 mb-4">
											<div className="avatar">
												<div className="w-16 rounded-full bg-gray-700">
													<img src="/api/placeholder/64/64" alt="placeholder" />
												</div>
											</div>
											<div>
												<h3 className="font-bold text-lg text-white">{bookingDetails.driver}</h3>
												<div className="flex items-center">
													<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
														{mockIcons.star}
													</svg>
													<span className="text-sm ml-1 text-gray-300">{bookingDetails.rating}</span>
												</div>
												<p className="text-sm text-gray-300">KA 01 AB 1234 • White Sedan</p>
											</div>
										</div>
										
										<div className="bg-gray-700 p-4 rounded-lg mb-4 border border-gray-600">
											<div className="flex justify-between mb-2">
												<span className="text-sm text-gray-300 font-medium">Departure:</span>
												<span className="font-bold text-white">{bookingDetails.departureTime}</span>
											</div>
											<div className="flex justify-between mb-2">
												<span className="text-sm text-gray-300 font-medium">Fare:</span>
												<div>
													<span className="font-bold text-white">₹{bookingDetails.fare}</span>
													<span className="text-xs line-through ml-2 text-gray-400">₹{bookingDetails.regularFare}</span>
												</div>
											</div>
											<div className="flex justify-between mb-2">
												<span className="text-sm text-gray-300 font-medium">Co-passengers:</span>
												<span className="font-bold text-white">{bookingDetails.passengers} / {bookingDetails.maxPassengers}</span>
											</div>
											<div className="flex justify-between">
												<span className="text-sm text-gray-300 font-medium">Route:</span>
												<span className="font-bold text-white">{bookingDetails.route}</span>
											</div>
										</div>
										
										<div className="flex gap-2">
											<motion.button 
												className="btn btn-outline border-gray-500 text-gray-300 hover:bg-gray-700 flex-1"
												whileHover={{ scale: 1.02 }}
												whileTap={{ scale: 0.98 }}
											>
												<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													{mockIcons.call}
												</svg>
												Call
											</motion.button>
											<motion.button 
												className="btn btn-outline border-gray-500 text-gray-300 hover:bg-gray-700 flex-1"
												whileHover={{ scale: 1.02 }}
												whileTap={{ scale: 0.98 }}
											>
												<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													{mockIcons.chat}
												</svg>
												Chat
											</motion.button>
										</div>
										
										<motion.button 
											className="btn bg-red-500 text-white hover:bg-red-600 border-none w-full mt-4 font-bold"
											onClick={() => setBookingDetails(null)}
											whileHover={{ scale: 1.02 }}
											whileTap={{ scale: 0.98 }}
										>
											Cancel Booking
										</motion.button>
									</div>
								)}
							</div>
						</motion.div>
					</div>
					
					<div className="lg:col-span-2">
						<motion.div 
							className="card bg-gray-800 shadow-xl mb-6 border border-gray-700"
							initial={{ opacity: 0, y: -20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.3, delay: 0.2 }}
						>
							<div className="card-body">
								<h2 className="card-title text-white font-bold">Map</h2>
								<div className="h-64 lg:h-96 w-full rounded-lg overflow-hidden">
									<RideMap 
										userLocation={userLocation} 
										showRouteEstimate={destination ? true : false}
									/>
								</div>
							</div>
						</motion.div>
						
						{showMatches && !bookingDetails && (
							<motion.div 
								className="card bg-gray-800 shadow-xl border border-gray-700"
								initial={{ opacity: 0, y: -20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.3, delay: 0.3 }}
							>
								<div className="card-body">
									<h2 className="card-title text-white font-bold">Available Carpools</h2>
									
									<div className="grid grid-cols-1 gap-4 mt-4">
										{matches.map((match, index) => (
											<motion.div 
												key={match.id} 
												className="card bg-gray-700 hover:bg-gray-650 border border-gray-600 hover:border-purple-500 transition-all"
												initial={{ opacity: 0, x: -20 }}
												animate={{ opacity: 1, x: 0 }}
												transition={{ duration: 0.3, delay: 0.3 + (index * 0.1) }}
												whileHover={{ y: -5 }}
											>
												<div className="card-body p-4">
													<div className="flex justify-between items-start">
														<div className="flex gap-3">
															<div className="avatar">
																<div className="w-12 rounded-full bg-gray-600">
																	<img src="/api/placeholder/48/48" alt="placeholder" />
																</div>
															</div>
															<div>
																<h3 className="font-bold text-white">{match.driver} • ⭐ {match.rating}</h3>
																<p className="text-sm text-gray-300">
																	Departing at {match.departureTime} • {match.route}
																</p>
																<div className="mt-1">
																	<span className="badge bg-purple-500 text-white font-bold">{match.passengers}/{match.maxPassengers} passengers</span>
																	<span className="badge bg-gray-600 text-gray-200 ml-2">Pickup: {match.pickupDistance} km</span>
																</div>
															</div>
														</div>
														<div className="text-right">
															<p className="font-bold text-lg text-white">₹{match.fare}</p>
															<p className="text-sm line-through text-gray-400">₹{match.regularFare}</p>
															<p className="text-xs text-emerald-400 font-medium">Save {Math.round((match.regularFare - match.fare) / match.regularFare * 100)}%</p>
														</div>
													</div>
													<div className="card-actions justify-end mt-2">
														<motion.button 
															className="btn btn-sm bg-purple-500 text-white hover:bg-purple-600 border-none font-bold"
															onClick={() => bookCarpool(match.id)}
															whileHover={{ scale: 1.05 }}
															whileTap={{ scale: 0.95 }}
														>
															Book Carpool
														</motion.button>
													</div>
												</div>
											</motion.div>
										))}
									</div>
								</div>
							</motion.div>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}