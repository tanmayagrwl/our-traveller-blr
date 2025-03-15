'use client'

import { useState } from 'react'
import Navbar from '@/components/ui/Navbar'
import RideMap from '@/components/maps/RideMap'
import ShuttleSchedule from '@/components/user/ShuttleSchedule'
import { 
	mockUserLocation, 
	mockShuttleRoutes, 
	mockAlertInfo,
	mockIcons,
	mockScheduleRoutes
} from '@/utils/mockData'
import { motion } from 'framer-motion'

export default function UserShuttle() {
	console.log({ mockUserLocation, mockShuttleRoutes, mockAlertInfo, mockIcons })
	const [userLocation, setUserLocation] = useState(mockUserLocation)
	const [selectedRoute, setSelectedRoute] = useState(null)
	const [showBookingForm, setShowBookingForm] = useState(false)
	const [bookingDetails, setBookingDetails] = useState(null)
	
	const selectRoute = (route) => {
		setSelectedRoute(route)
		setShowBookingForm(true)
	}
	
	const bookShuttle = (timeSlot) => {
		setBookingDetails({
			...selectedRoute,
			timeSlot,
			date: new Date().toLocaleDateString('en-US', {day: '2-digit', month: 'short'}),
			seatNumber: Math.floor(Math.random() * 20) + 1
		})
		setShowBookingForm(false)
	}
	
	const cancelBooking = () => {
		setBookingDetails(null)
		setSelectedRoute(null)
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
					Shuttle Services
				</motion.h1>
				
				<motion.div 
					className="alert bg-gray-800 border border-gray-700 mb-6"
					initial={{ opacity: 0, y: -10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3, delay: 0.1 }}
				>
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-emerald-400 shrink-0 w-6 h-6">
						{mockIcons.info}
					</svg>
					<span className="text-gray-200">{mockAlertInfo.shuttleInfo}</span>
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
								<h2 className="card-title text-white font-bold">Available Routes</h2>
								
								{bookingDetails ? (
									<div>
										<div className="bg-emerald-900/50 text-emerald-100 p-4 rounded-lg mb-4 border border-emerald-700">
											<div className="flex items-center">
												<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													{mockIcons.check}
												</svg>
												<h3 className="font-bold">Shuttle Booked!</h3>
											</div>
										</div>
										
										<div className="bg-gray-700 p-4 rounded-lg mb-4 border border-gray-600">
											<h3 className="font-bold text-lg text-center text-white">{bookingDetails.name}</h3>
											<div className="divider my-2 bg-gray-600"></div>
											
											<div className="flex justify-between mb-1">
												<span className="text-sm font-bold text-gray-300">Date:</span>
												<span className="text-white">{bookingDetails.date}</span>
											</div>
											<div className="flex justify-between mb-1">
												<span className="text-sm font-bold text-gray-300">Time:</span>
												<span className="text-white">{bookingDetails.timeSlot}</span>
											</div>
											<div className="flex justify-between mb-1">
												<span className="text-sm font-bold text-gray-300">Route:</span>
												<span className="text-white">{bookingDetails.from} → {bookingDetails.to}</span>
											</div>
											<div className="flex justify-between mb-1">
												<span className="text-sm font-bold text-gray-300">Seat Number:</span>
												<span className="text-white">{bookingDetails.seatNumber}</span>
											</div>
											<div className="flex justify-between mb-1">
												<span className="text-sm font-bold text-gray-300">Fare:</span>
												<div>
													<span className="font-bold text-white">₹{bookingDetails.fare}</span>
													<span className="text-xs line-through ml-2 text-gray-400">₹{bookingDetails.regularFare}</span>
												</div>
											</div>
											
											<div className="mt-4 text-center text-xs text-gray-400">
												<p>Please arrive 10 minutes before departure time.</p>
												<p>Show this ticket to the driver when boarding.</p>
											</div>
										</div>
										
										<div className="mt-4">
											<motion.button 
												className="btn btn-outline btn-block mb-2 border-emerald-500 text-emerald-500 hover:bg-emerald-500 hover:text-white"
												whileHover={{ scale: 1.02 }}
												whileTap={{ scale: 0.98 }}
											>
												Download Ticket
											</motion.button>
											<motion.button 
												className="btn btn-block bg-red-500 text-white hover:bg-red-600 border-none"
												onClick={cancelBooking}
												whileHover={{ scale: 1.02 }}
												whileTap={{ scale: 0.98 }}
											>
												Cancel Booking
											</motion.button>
										</div>
									</div>
								) : showBookingForm && selectedRoute ? (
									<div>
										<h3 className="font-bold text-lg text-white">{selectedRoute.name}</h3>
										<p className="text-sm mb-4 text-gray-300">{selectedRoute.from} → {selectedRoute.to}</p>
										
										<div className="divider bg-gray-700">Select a Time Slot</div>
										
										<div className="grid grid-cols-2 gap-2 mt-4">
											{selectedRoute.schedule.map((time, index) => (
												<motion.button
													key={time}
													className="btn btn-sm bg-gray-700 hover:bg-emerald-500 hover:text-white text-gray-200 border-gray-600"
													onClick={() => bookShuttle(time)}
													whileHover={{ scale: 1.05 }}
													whileTap={{ scale: 0.95 }}
													initial={{ opacity: 0, y: 10 }}
													animate={{ opacity: 1, y: 0 }}
													transition={{ duration: 0.2, delay: index * 0.05 }}
												>
													{time}
												</motion.button>
											))}
										</div>
										
										<motion.button 
											className="btn btn-block bg-gray-700 text-gray-200 hover:bg-gray-600 border-none mt-6"
											onClick={() => setShowBookingForm(false)}
											whileHover={{ scale: 1.02 }}
											whileTap={{ scale: 0.98 }}
										>
											Back to Routes
										</motion.button>
									</div>
								) : (
									<div className="grid grid-cols-1 gap-4 mt-4">
										{mockShuttleRoutes.map((route, index) => (
											<motion.div 
												key={route.id} 
												className="card bg-gray-700 hover:bg-gray-650 border border-gray-600 hover:border-emerald-500 transition-all"
												initial={{ opacity: 0, x: -20 }}
												animate={{ opacity: 1, x: 0 }}
												transition={{ duration: 0.3, delay: index * 0.1 }}
												whileHover={{ y: -5 }}
											>
												<div className="card-body p-4">
													<h3 className="card-title text-base text-white font-bold">{route.name}</h3>
													<p className="text-sm text-gray-300">{route.from} → {route.to}</p>
													<p className="text-xs text-gray-400">{route.stops} stops</p>
													
													<div className="flex justify-between items-center mt-2">
														<div>
															<p className="font-bold text-white">₹{route.fare}</p>
															<p className="text-xs line-through text-gray-400">₹{route.regularFare}</p>
														</div>
														
														{route.status === "Running" ? (
															<motion.button 
																className="btn btn-sm bg-emerald-500 text-white hover:bg-emerald-600 border-none"
																onClick={() => selectRoute(route)}
																whileHover={{ scale: 1.05 }}
																whileTap={{ scale: 0.95 }}
															>
																Book Now
															</motion.button>
														) : (
															<div className="badge bg-gray-600 text-gray-300">Coming Soon</div>
														)}
													</div>
												</div>
											</motion.div>
										))}
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
								<h2 className="card-title text-white font-bold">Route Map</h2>
								<div className="h-96 w-full rounded-lg overflow-hidden">
									<RideMap userLocation={userLocation} />
								</div>
							</div>
						</motion.div>
						
						<motion.div 
							className="card bg-gray-800 shadow-xl border border-gray-700"
							initial={{ opacity: 0, y: -20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.3, delay: 0.3 }}
						>
							<div className="card-body">
								<h2 className="card-title text-white font-bold">Shuttle Schedule</h2>
								<ShuttleSchedule routes={mockScheduleRoutes} />
								
								<div className="alert bg-emerald-900/50 mt-4 border border-emerald-700">
									<svg xmlns="http://www.w3.org/2000/svg" className="stroke-emerald-400 shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
										{mockIcons.check}
									</svg>
									<span className="text-emerald-100">{mockAlertInfo.savingsInfo}</span>
								</div>
								
								<div className="alert bg-amber-900/50 mt-2 border border-amber-700">
									<svg xmlns="http://www.w3.org/2000/svg" className="stroke-amber-400 shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
										{mockIcons.warning}
									</svg>
									<span className="text-amber-100">{mockAlertInfo.bookingAlert}</span>
								</div>
							</div>
						</motion.div>
					</div>
				</div>
			</div>
		</div>
	)
}