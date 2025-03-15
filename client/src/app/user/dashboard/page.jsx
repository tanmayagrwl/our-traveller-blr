'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/ui/Navbar'
import RideMap from '@/components/maps/RideMap'
import { mockUserLocation, mockRecentRides } from '@/utils/mockData'
import { motion } from 'framer-motion'

export default function UserDashboard() {
	const router = useRouter()
	const [userLocation, setUserLocation] = useState(mockUserLocation)
	const [recentRides, setRecentRides] = useState(mockRecentRides)
	const [waitTime, setWaitTime] = useState(5)
	const [nearbyDrivers, setNearbyDrivers] = useState(3)
	
	useEffect(() => {
		const interval = setInterval(() => {
			setWaitTime(Math.max(3, Math.floor(Math.random() * 8)))
			setNearbyDrivers(Math.floor(Math.random() * 5) + 1)
		}, 30000)
		
		return () => clearInterval(interval)
	}, [])
	
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
					Welcome, User!
				</motion.h1>
				
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					<div className="lg:col-span-1">
						<motion.div 
							className="card bg-gray-800 shadow-xl mb-6 border border-gray-700"
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.3, delay: 0.1 }}
						>
							<div className="card-body">
								<h2 className="card-title text-white">Quick Book</h2>
								
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
											placeholder="Pickup location" 
											className="input bg-gray-700 border-gray-600 text-white w-full" 
											defaultValue="Current Location"
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
											className="input bg-gray-700 border-gray-600 text-white w-full" 
										/>
									</div>
								</div>
								
								<div className="mt-6">
									<motion.button 
										className="btn bg-emerald-500 text-white hover:bg-emerald-600 border-none w-full mb-2"
										onClick={() => router.push('/user/booking')}
										whileHover={{ scale: 1.02 }}
										whileTap={{ scale: 0.98 }}
									>
										Book Now
									</motion.button>
									
									<motion.button 
										className="btn btn-outline border-gray-500 text-gray-300 hover:bg-gray-700 hover:text-white w-full"
										onClick={() => router.push('/user/schedule')}
										whileHover={{ scale: 1.02 }}
										whileTap={{ scale: 0.98 }}
									>
										Schedule for Later
									</motion.button>
								</div>
								
								<div className="divider bg-gray-700">OR</div>
								
								<div className="flex justify-between gap-4">
									<motion.button 
										className="btn bg-purple-500 text-white hover:bg-purple-600 border-none flex-1"
										onClick={() => router.push('/user/carpooling')}
										whileHover={{ scale: 1.02 }}
										whileTap={{ scale: 0.98 }}
									>
										Carpooling
									</motion.button>
									
									<motion.button 
										className="btn bg-blue-500 text-white hover:bg-blue-600 border-none flex-1"
										onClick={() => router.push('/user/shuttle')}
										whileHover={{ scale: 1.02 }}
										whileTap={{ scale: 0.98 }}
									>
										Shuttle
									</motion.button>
								</div>
							</div>
						</motion.div>
						
						<motion.div 
							className="card bg-gray-800 shadow-xl border border-gray-700"
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.3, delay: 0.2 }}
						>
							<div className="card-body">
								<h2 className="card-title text-white">Current Status</h2>
								
								<div className="stats shadow mt-4 bg-gray-700 text-white">
									<div className="stat">
										<div className="stat-title text-gray-300">Wait Time</div>
										<div className="stat-value text-emerald-400">{waitTime} min</div>
										<div className="stat-desc text-gray-300">↘︎ 20% less than usual</div>
									</div>
									
									<div className="stat">
										<div className="stat-title text-gray-300">Nearby Drivers</div>
										<div className="stat-value text-white">{nearbyDrivers}</div>
										<div className="stat-desc text-gray-300">Available now</div>
									</div>
								</div>
								
								<div className="alert bg-blue-900/50 mt-4 border border-blue-700">
									<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-blue-400 shrink-0 w-6 h-6">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
									</svg>
									<span className="text-blue-100">Surge pricing in effect. Consider carpooling to save 30%!</span>
								</div>
							</div>
						</motion.div>
					</div>
					
					<div className="lg:col-span-2">
						<motion.div 
							className="card bg-gray-800 shadow-xl mb-6 border border-gray-700"
							initial={{ opacity: 0, y: -20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.3, delay: 0.1 }}
						>
							<div className="card-body">
								<h2 className="card-title text-white">Your Location</h2>
								<div className="h-96 w-full rounded-lg overflow-hidden">
									<RideMap userLocation={userLocation} />
								</div>
							</div>
						</motion.div>
						
						<motion.div 
							className="card bg-gray-800 shadow-xl border border-gray-700"
							initial={{ opacity: 0, y: -20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.3, delay: 0.2 }}
						>
							<div className="card-body">
								<h2 className="card-title text-white">Recent Rides</h2>
								
								<div className="overflow-x-auto">
									<table className="table bg-gray-700 text-gray-200">
										<thead className="text-gray-200">
											<tr>
												<th>Date</th>
												<th>Destination</th>
												<th>Fare</th>
												<th>Driver</th>
												<th>Type</th>
												<th>Actions</th>
											</tr>
										</thead>
										<tbody>
											{recentRides.map((ride, index) => (
												<motion.tr 
													key={index}
													className="hover:bg-gray-600"
													initial={{ opacity: 0, x: -10 }}
													animate={{ opacity: 1, x: 0 }}
													transition={{ duration: 0.3, delay: 0.1 + (index * 0.05) }}
												>
													<td className="text-white">{ride.date}</td>
													<td className="text-white">{ride.destination}</td>
													<td className="text-white">₹{ride.fare}</td>
													<td className="text-white">{ride.driver}</td>
													<td>
														<div className={`badge ${ride.type === 'Individual' ? 'bg-emerald-500' : ride.type === 'Carpool' ? 'bg-purple-500' : 'bg-blue-500'} text-white`}>
															{ride.type}
														</div>
													</td>
													<td>
														<motion.button 
															className="btn btn-xs bg-gray-600 hover:bg-emerald-500 text-white border-none"
															whileHover={{ scale: 1.05 }}
															whileTap={{ scale: 0.95 }}
														>
															Re-book
														</motion.button>
													</td>
												</motion.tr>
											))}
										</tbody>
									</table>
								</div>
							</div>
						</motion.div>
					</div>
				</div>
				
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
					<motion.div 
						className="card bg-gray-800 shadow-xl border border-gray-700"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.3, delay: 0.3 }}
					>
						<div className="card-body">
							<h2 className="card-title text-white">Peak Hour Tips</h2>
							<ul className="list-disc list-inside text-sm mt-2 text-gray-300">
								<li>Book 15 minutes in advance during peak hours</li>
								<li>Consider carpooling to save money and time</li>
								<li>Check shuttle services for common routes</li>
								<li>Use designated pickup stands for faster service</li>
							</ul>
						</div>
					</motion.div>
					
					<motion.div 
						className="card bg-gray-800 shadow-xl border border-gray-700"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.3, delay: 0.4 }}
					>
						<div className="card-body">
							<h2 className="card-title text-center text-white">Promotions</h2>
							<div className="flex flex-col gap-4 mt-4">
								<div className="badge badge-lg bg-emerald-500 text-white">₹50 off on next ride</div>
								<div className="badge badge-lg bg-purple-500 text-white">Refer a friend and earn ₹100</div>
								<div className="badge badge-lg bg-blue-500 text-white">Get 20% off on carpooling</div>
								<div className="badge badge-lg bg-amber-500 text-white">Free shuttle ride on weekends</div>
							</div>
						</div>
					</motion.div>
				</div>
			</div>
		</div>
	)
}