'use client'

import { useState } from 'react'
import Navbar from '@/components/ui/Navbar'
import { motion } from 'framer-motion'

export default function DriverSchedule() {
	const [scheduledRides, setScheduledRides] = useState([
		{
			id: 1,
			date: '2025-03-15',
			time: '08:00',
			pickup: 'Indiranagar Metro',
			destination: 'Electronic City',
			status: 'confirmed',
			fare: 320,
			passenger: 'Arun S.'
		},
		{
			id: 2,
			date: '2025-03-16',
			time: '07:30',
			pickup: 'Majestic Station',
			destination: 'Kempegowda Airport',
			status: 'confirmed',
			fare: 450,
			passenger: 'Meena R.'
		},
		{
			id: 3,
			date: '2025-03-17',
			time: '17:30',
			pickup: 'Koramangala',
			destination: 'Whitefield',
			status: 'pending',
			fare: 280,
			passenger: 'Vikram P.'
		}
	])
	
	const [showAvailabilityForm, setShowAvailabilityForm] = useState(false)
	const [availableFrom, setAvailableFrom] = useState('')
	const [availableTo, setAvailableTo] = useState('')
	const [availableDays, setAvailableDays] = useState({
		mon: true,
		tue: true,
		wed: true,
		thu: true,
		fri: true,
		sat: false,
		sun: false
	})
	
	const acceptRide = (rideId) => {
		setScheduledRides(prev => 
			prev.map(ride => 
				ride.id === rideId ? {...ride, status: 'confirmed'} : ride
			)
		)
	}
	
	const declineRide = (rideId) => {
		setScheduledRides(prev => prev.filter(ride => ride.id !== rideId))
	}
	
	const saveAvailability = (e) => {
		e.preventDefault()
		setShowAvailabilityForm(false)
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
					Scheduled Rides
				</motion.h1>
				
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					<div className="lg:col-span-2">
						<motion.div 
							className="card bg-gray-800 shadow-xl border border-gray-700"
							initial={{ opacity: 0, y: -20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.3 }}
						>
							<div className="card-body">
								<div className="flex justify-between items-center">
									<h2 className="card-title text-white">Upcoming Scheduled Rides</h2>
									<div className="badge bg-emerald-500 text-white">{scheduledRides.length} rides</div>
								</div>
								
								{scheduledRides.length > 0 ? (
									<div className="overflow-x-auto">
										<table className="table w-full bg-gray-700 text-gray-200">
											<thead className="text-gray-200">
												<tr>
													<th>Date & Time</th>
													<th>Route</th>
													<th>Passenger</th>
													<th>Fare</th>
													<th>Status</th>
													<th>Actions</th>
												</tr>
											</thead>
											<tbody>
												{scheduledRides.map((ride, index) => (
													<motion.tr 
														key={ride.id}
														className="hover:bg-gray-600"
														initial={{ opacity: 0, x: -20 }}
														animate={{ opacity: 1, x: 0 }}
														transition={{ duration: 0.3, delay: index * 0.1 }}
													>
														<td>
															<div className="font-bold text-white">{new Date(ride.date).toLocaleDateString('en-US', {day: '2-digit', month: 'short'})}</div>
															<div className="text-sm text-gray-400">{ride.time}</div>
														</td>
														<td>
															<div className="font-bold text-white">{ride.pickup}</div>
															<div className="text-sm text-gray-400">→ {ride.destination}</div>
														</td>
														<td className="text-white">{ride.passenger}</td>
														<td className="text-white">₹{ride.fare}</td>
														<td>
															{ride.status === 'confirmed' ? (
																<div className="badge bg-emerald-500 text-white">Confirmed</div>
															) : (
																<div className="badge bg-amber-500 text-white">Pending</div>
															)}
														</td>
														<td>
															{ride.status === 'pending' ? (
																<div className="flex gap-2">
																	<motion.button 
																		className="btn btn-xs bg-emerald-500 text-white hover:bg-emerald-600 border-none" 
																		onClick={() => acceptRide(ride.id)}
																		whileHover={{ scale: 1.05 }}
																		whileTap={{ scale: 0.95 }}
																	>
																		Accept
																	</motion.button>
																	<motion.button 
																		className="btn btn-xs bg-red-500 text-white hover:bg-red-600 border-none" 
																		onClick={() => declineRide(ride.id)}
																		whileHover={{ scale: 1.05 }}
																		whileTap={{ scale: 0.95 }}
																	>
																		Decline
																	</motion.button>
																</div>
															) : (
																<motion.button 
																	className="btn btn-xs border-gray-500 text-gray-300 hover:bg-gray-700"
																	whileHover={{ scale: 1.05 }}
																	whileTap={{ scale: 0.95 }}
																>
																	View Details
																</motion.button>
															)}
														</td>
													</motion.tr>
												))}
											</tbody>
										</table>
									</div>
								) : (
									<div className="alert bg-gray-700 border border-gray-600">
										<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-emerald-400 shrink-0 w-6 h-6">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
										</svg>
										<span className="text-gray-200">No scheduled rides yet. Set your availability to receive pre-booked rides.</span>
									</div>
								)}
							</div>
						</motion.div>
					</div>
					
					<div className="lg:col-span-1">
						<motion.div 
							className="card bg-gray-800 shadow-xl border border-gray-700"
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.3, delay: 0.1 }}
						>
							<div className="card-body">
								<h2 className="card-title text-white">Your Availability</h2>
								
								{!showAvailabilityForm ? (
									<div>
										<div className="alert bg-gray-700 mb-4 border border-gray-600">
											<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-emerald-400 shrink-0 w-6 h-6">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
											</svg>
											<span className="text-gray-200">Setting your regular schedule helps passengers book rides in advance.</span>
										</div>
										
										<div className="bg-gray-700 p-4 rounded-lg mb-4 border border-gray-600">
											<h3 className="font-bold text-white">Current Schedule:</h3>
											<p className="mt-2 text-gray-300">
												<span className="font-semibold text-gray-200">Available days:</span> Mon, Tue, Wed, Thu, Fri
											</p>
											<p className="mt-1 text-gray-300">
												<span className="font-semibold text-gray-200">Available hours:</span> 7:00 AM - 7:00 PM
											</p>
										</div>
										
										<motion.button 
											className="btn bg-emerald-500 text-white hover:bg-emerald-600 border-none w-full"
											onClick={() => setShowAvailabilityForm(true)}
											whileHover={{ scale: 1.02 }}
											whileTap={{ scale: 0.98 }}
										>
											Update Availability
										</motion.button>
									</div>
								) : (
									<form onSubmit={saveAvailability}>
										<div className="form-control">
											<label className="label">
												<span className="label-text text-gray-300">Available from</span>
											</label>
											<input 
												type="time" 
												className="input input-bordered bg-gray-700 text-white border-gray-600" 
												value={availableFrom} 
												onChange={e => setAvailableFrom(e.target.value)}
												required
											/>
										</div>
										
										<div className="form-control mt-2">
											<label className="label">
												<span className="label-text text-gray-300">Available until</span>
											</label>
											<input 
												type="time" 
												className="input input-bordered bg-gray-700 text-white border-gray-600" 
												value={availableTo} 
												onChange={e => setAvailableTo(e.target.value)}
												required
											/>
										</div>
										
										<div className="form-control mt-4">
											<label className="label">
												<span className="label-text text-gray-300">Available days</span>
											</label>
											
											<div className="grid grid-cols-7 gap-1 mt-2">
												{Object.entries({
													mon: 'M',
													tue: 'T',
													wed: 'W',
													thu: 'T',
													fri: 'F',
													sat: 'S',
													sun: 'S'
												}).map(([day, label]) => (
													<div key={day} className="form-control">
														<label className={`cursor-pointer rounded-full w-8 h-8 flex items-center justify-center ${availableDays[day] ? 'bg-emerald-500 text-white' : 'bg-gray-700 text-gray-400'}`}>
															<input 
																type="checkbox" 
																className="hidden" 
																checked={availableDays[day]} 
																onChange={() => setAvailableDays(prev => ({...prev, [day]: !prev[day]}))}
															/>
															<span>{label}</span>
														</label>
													</div>
												))}
											</div>
										</div>
										
										<div className="flex gap-2 mt-6">
											<motion.button 
												type="button"
												className="btn bg-gray-700 text-gray-300 hover:bg-gray-600 border-gray-600 flex-1"
												onClick={() => setShowAvailabilityForm(false)}
												whileHover={{ scale: 1.02 }}
												whileTap={{ scale: 0.98 }}
											>
												Cancel
											</motion.button>
											<motion.button 
												type="submit"
												className="btn bg-emerald-500 text-white hover:bg-emerald-600 border-none flex-1"
												whileHover={{ scale: 1.02 }}
												whileTap={{ scale: 0.98 }}
											>
												Save
											</motion.button>
										</div>
									</form>
								)}
							</div>
						</motion.div>
						
						<motion.div 
							className="card bg-gray-800 shadow-xl mt-6 border border-gray-700"
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.3, delay: 0.2 }}
						>
							<div className="card-body">
								<h2 className="card-title text-white">Statistics</h2>
								
								<div className="stats stats-vertical shadow mt-4 bg-gray-700 text-white">
									<div className="stat">
										<div className="stat-title text-gray-300">Scheduled Ride Completion</div>
										<div className="stat-value text-emerald-400">92%</div>
										<div className="stat-desc text-gray-300">21 out of 23 rides completed</div>
									</div>
									
									<div className="stat">
										<div className="stat-title text-gray-300">Average Rating</div>
										<div className="stat-value text-white">4.8</div>
										<div className="stat-desc text-gray-300">For scheduled rides</div>
									</div>
									
									<div className="stat">
										<div className="stat-title text-gray-300">Extra Monthly Income</div>
										<div className="stat-value text-emerald-400">₹4,200</div>
										<div className="stat-desc text-gray-300">From scheduled rides</div>
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