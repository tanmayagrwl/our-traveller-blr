'use client'

import { useState } from 'react'
import Navbar from '@/components/ui/Navbar'
import RideMap from '@/components/maps/RideMap'
import { mockUserLocation } from '@/utils/mockData'
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
		
		const mockMatches = [
			{
				id: 1,
				driver: "Ankit S.",
				rating: 4.8,
				departureTime: "8:30 AM",
				passengers: 2,
				maxPassengers: 3,
				fare: 80,
				regularFare: 160,
				pickupDistance: 0.2,
				dropoffDistance: 0.3,
				route: "Via Anna Nagar"
			},
			{
				id: 2,
				driver: "Priya M.",
				rating: 4.9,
				departureTime: "8:45 AM",
				passengers: 1,
				maxPassengers: 3,
				fare: 90,
				regularFare: 180,
				pickupDistance: 0.1,
				dropoffDistance: 0.2,
				route: "Via T. Nagar"
			},
			{
				id: 3,
				driver: "Rajesh K.",
				rating: 4.7,
				departureTime: "9:00 AM",
				passengers: 2,
				maxPassengers: 4,
				fare: 70,
				regularFare: 150,
				pickupDistance: 0.3,
				dropoffDistance: 0.4,
				route: "Via Guindy"
			}
		]
		
		setMatches(mockMatches)
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
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
					</svg>
					<span className="text-purple-100">Carpooling reduces your fare by up to 50% during peak hours!</span>
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
								<h2 className="card-title text-white">Find a Carpool</h2>
								
								{!bookingDetails ? (
									<form onSubmit={handleSearch}>
										<div className="form-control mt-4">
											<label className="label">
												<span className="label-text text-gray-300">Pickup Location</span>
											</label>
											<input 
												type="text" 
												className="input bg-gray-700 border-gray-600 text-white w-full" 
												defaultValue="Current Location"
											/>
										</div>
										
										<div className="form-control mt-4">
											<label className="label">
												<span className="label-text text-gray-300">Destination</span>
											</label>
											<input 
												type="text" 
												className="input bg-gray-700 border-gray-600 text-white w-full" 
												placeholder="Where are you going?"
												value={destination}
												onChange={(e) => setDestination(e.target.value)}
												required
											/>
										</div>
										
										<div className="form-control mt-4">
											<label className="label">
												<span className="label-text text-gray-300">Date</span>
											</label>
											<input 
												type="date" 
												className="input bg-gray-700 border-gray-600 text-white w-full" 
												value={date}
												onChange={(e) => setDate(e.target.value)}
												required
											/>
										</div>
										
										<div className="form-control mt-4">
											<label className="label">
												<span className="label-text text-gray-300">Time</span>
											</label>
											<input 
												type="time" 
												className="input bg-gray-700 border-gray-600 text-white w-full" 
												value={time}
												onChange={(e) => setTime(e.target.value)}
												required
											/>
										</div>
										
										<div className="form-control mt-4">
											<label className="label">
												<span className="label-text text-gray-300">Passengers</span>
											</label>
											<select 
												className="select bg-gray-700 border-gray-600 text-white w-full"
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
											className="btn bg-purple-500 text-white hover:bg-purple-600 border-none w-full mt-6"
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
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
												</svg>
												<h3 className="font-bold">Carpool Booked!</h3>
											</div>
										</div>
										
										<div className="flex items-center gap-4 mb-4">
											<div className="avatar">
												<div className="w-16 rounded-full">
													<img src="https://daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg" />
												</div>
											</div>
											<div>
												<h3 className="font-bold text-lg text-white">{bookingDetails.driver}</h3>
												<div className="flex items-center">
													<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
														<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
													</svg>
													<span className="text-sm ml-1 text-gray-300">{bookingDetails.rating}</span>
												</div>
												<p className="text-sm text-gray-300">KA 01 AB 1234 • White Sedan</p>
											</div>
										</div>
										
										<div className="bg-gray-700 p-4 rounded-lg mb-4 border border-gray-600">
											<div className="flex justify-between mb-2">
												<span className="text-sm text-gray-300">Departure:</span>
												<span className="font-bold text-white">{bookingDetails.departureTime}</span>
											</div>
											<div className="flex justify-between mb-2">
												<span className="text-sm text-gray-300">Fare:</span>
												<div>
													<span className="font-bold text-white">₹{bookingDetails.fare}</span>
													<span className="text-xs line-through ml-2 text-gray-400">₹{bookingDetails.regularFare}</span>
												</div>
											</div>
											<div className="flex justify-between mb-2">
												<span className="text-sm text-gray-300">Co-passengers:</span>
												<span className="font-bold text-white">{bookingDetails.passengers} / {bookingDetails.maxPassengers}</span>
											</div>
											<div className="flex justify-between">
												<span className="text-sm text-gray-300">Route:</span>
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
								<h2 className="card-title text-white">Map</h2>
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
									<h2 className="card-title text-white">Available Carpools</h2>
									
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
																<div className="w-12 rounded-full">
																	<img src="https://daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg" />
																</div>
															</div>
															<div>
																<h3 className="font-bold text-white">{match.driver} • ⭐ {match.rating}</h3>
																<p className="text-sm text-gray-300">
																	Departing at {match.departureTime} • {match.route}
																</p>
																<div className="mt-1">
																	<span className="badge bg-purple-500 text-white">{match.passengers}/{match.maxPassengers} passengers</span>
																	<span className="badge bg-gray-600 text-gray-200 ml-2">Pickup: {match.pickupDistance} km</span>
																</div>
															</div>
														</div>
														<div className="text-right">
															<p className="font-bold text-lg text-white">₹{match.fare}</p>
															<p className="text-sm line-through text-gray-400">₹{match.regularFare}</p>
															<p className="text-xs text-emerald-400">Save {Math.round((match.regularFare - match.fare) / match.regularFare * 100)}%</p>
														</div>
													</div>
													<div className="card-actions justify-end mt-2">
														<motion.button 
															className="btn btn-sm bg-purple-500 text-white hover:bg-purple-600 border-none"
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