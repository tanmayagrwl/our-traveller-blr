'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/ui/Navbar'
import RideMap from '@/components/maps/RideMap'
import { motion } from 'framer-motion'





export default function DriverDashboard() {
	const [driverData, setDriverData] = useState({
		location: {
			current: {lat: 0, lng: 0}
		},
		activeRides: [],
		stats: {
			daily: {earnings: 0, completedRides: 0, declinedRides: 0, comparedToYesterday: 0}
		},
		rewards: {
			points: 0,
			level: '',
			pointsToNextLevel: 0,
			nextLevel: '',
			badges: []
		}
	})
	const [isAvailable, setIsAvailable] = useState(true)
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState(null)

	useEffect(() => {
		const fetchDashboardData = async () => {
			try {
				setIsLoading(true)
				const response = await fetch('http://localhost:5050/api/driver/dashboard', {
					method: 'GET',
					headers: {'Content-Type': 'application/json'},
					credentials: 'include'
				})

				if (!response.ok) {
					throw new Error(`API request failed with status ${response.status}`)
				}

				const data = await response.json()
				setDriverData(data)
				setError(null)
			} catch (err) {
				console.error('Failed to fetch driver dashboard data:', err)
				setError('Failed to load dashboard data. Using fallback data.')
			} finally {
				setIsLoading(false)
			}
		}

		fetchDashboardData()
		const intervalId = setInterval(fetchDashboardData, 30000)
		return () => clearInterval(intervalId)
	}, [])

	useEffect(() => {
		const interval = setInterval(() => {
			if (isAvailable && Math.random() > 0.7) {
				const newRide = {
					id: Math.floor(Math.random() * 1000),
					pickupLocation: {
						lat: driverData.location.current.lat + (Math.random() * 0.02 - 0.01),
						lng: driverData.location.current.lng + (Math.random() * 0.02 - 0.01)
					},
					dropLocation: {
						lat: driverData.location.current.lat + (Math.random() * 0.05 - 0.025),
						lng: driverData.location.current.lng + (Math.random() * 0.05 - 0.025)
					},
					estimatedFare: Math.floor(Math.random() * 200) + 100,
					estimatedDistance: Math.floor(Math.random() * 8) + 2,
					estimatedTime: Math.floor(Math.random() * 30) + 10,
					passengerRating: (Math.random() * 2 + 3).toFixed(1),
					passengerName: `Passenger ${Math.floor(Math.random() * 100)}`,
					timestamp: new Date().toISOString(),
					rewardPoints: 20
				}
				setDriverData(prev => ({
					...prev,
					activeRides: [...prev.activeRides, newRide]
				}))
			}
		}, 15000)
		return () => clearInterval(interval)
	}, [isAvailable, driverData.location.current])

    const acceptRide = (rideId) => {
        setDriverData(prev => ({
            ...prev,
            activeRides: prev.activeRides.filter(ride => ride.id !== rideId),
            stats: {
                ...prev.stats,
                daily: {
                    ...prev.stats.daily,
                    completedRides: prev.stats.daily.completedRides + 1,
                    earnings: prev.stats.daily.earnings + Math.floor(Math.random() * 200) + 100
                }
            }
        }))
        setIsAvailable(false)
        
        // Simulate ride completion time
        setTimeout(() => {
            setIsAvailable(true)
        }, 10000)
    }

    const declineRide = (rideId) => {
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
        <div className="min-h-screen bg-gray-900 text-white">
            <Navbar />
            
            <div className="container mx-auto px-4 py-8">
                <motion.h1 
                    className="text-3xl font-bold mb-6 text-white"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    Driver Dashboard
                </motion.h1>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1">
                        <motion.div 
                            className="card bg-gray-800 shadow-xl mb-6 border border-gray-700"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="card-body">
                                <h2 className="card-title text-white">Driver Status</h2>
                                <div className="form-control">
                                    <label className="label cursor-pointer">
                                        <span className="label-text text-gray-300">Available for rides</span> 
                                        <input 
                                            type="checkbox" 
                                            className="toggle toggle-success" 
                                            checked={isAvailable} 
                                            onChange={() => setIsAvailable(!isAvailable)} 
                                        />
                                    </label>
                                </div>
                                
                                <div className="stats stats-vertical shadow mt-4 bg-gray-700 text-white">
                                    <div className="stat">
                                        <div className="stat-title text-gray-300">Today's Earnings</div>
                                        <div className="stat-value text-emerald-400">₹{driverData.stats.daily.earnings}</div>
                                        <div className="stat-desc text-gray-300">↗︎ {driverData.stats.daily.comparedToYesterday}% more than yesterday</div>
                                    </div>
                                    
                                    <div className="stat">
                                        <div className="stat-title text-gray-300">Completed Rides</div>
                                        <div className="stat-value text-white">{driverData.stats.daily.completedRides}</div>
                                    </div>
                                    
                                    <div className="stat">
                                        <div className="stat-title text-gray-300">Acceptance Rate</div>
                                        <div className="stat-value text-secondary">
                                            {Math.round(driverData.stats.daily.completedRides / 
                                           (driverData.stats.daily.completedRides + driverData.stats.daily.declinedRides) * 100) || 0}%
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                        
                        <motion.div 
                            className="card bg-gray-800 shadow-xl border border-gray-700"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                        >
                            <div className="card-body">
                                <h2 className="card-title text-white">Reward Status</h2>
                                <div className="flex items-center my-3">
                                    <div className="radial-progress text-emerald-500" style={{ "--value": driverData.rewards.points }}>
                                        {driverData.rewards.points}%
                                    </div>
                                    <div className="ml-4">
                                        <p className="font-bold text-white">{driverData.rewards.level} Level</p>
                                        <p className="text-sm text-gray-300">
                                            {driverData.rewards.points}/{driverData.rewards.points + driverData.rewards.pointsToNextLevel} points to {driverData.rewards.nextLevel}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {driverData.rewards.badges.map((badge, index) => (
                                        <div key={index} className={`badge badge-${badge.type}`}>{badge.name}</div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                    
                    <div className="lg:col-span-2">
                        <motion.div 
                            className="card bg-gray-800 shadow-xl mb-6 border border-gray-700"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="card-body">
                                <h2 className="card-title text-white">Live Map</h2>
                                <div className="h-96 w-full rounded-lg overflow-hidden">
                                    <RideMap driverLocation={driverData.location.current} />
                                </div>
                            </div>
                        </motion.div>
                        
                        <motion.div 
                            className="card bg-gray-800 shadow-xl border border-gray-700"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                        >
                            <div className="card-body">
                                <h2 className="card-title text-white">Incoming Ride Requests</h2>
                                {driverData.activeRides.length === 0 ? (
                                    <div className="alert bg-gray-700 text-white">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                        </svg>
                                        <span>No incoming ride requests at the moment.</span>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        {driverData.activeRides.map((ride, index) => (
                                            <motion.div 
                                                key={ride.id} 
                                                className="card bg-gray-700 mb-4 border border-gray-600 hover:border-emerald-500 transition-all"
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ duration: 0.3, delay: index * 0.1 }}
                                            >
                                                <div className="card-body p-4">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h3 className="font-bold text-white">{ride.passengerName} • ⭐ {ride.passengerRating}</h3>
                                                            <p className="text-sm text-gray-300">
                                                                {ride.estimatedDistance} km • {ride.estimatedTime} mins • ₹{ride.estimatedFare}
                                                            </p>
                                                            <div className="mt-2">
                                                                <p className="text-xs text-gray-400">
                                                                    <span className="font-bold">Pickup:</span> {Math.abs(ride.pickupLocation.lat).toFixed(5)}°{ride.pickupLocation.lat > 0 ? 'N' : 'S'}, 
                                                                    {Math.abs(ride.pickupLocation.lng).toFixed(5)}°{ride.pickupLocation.lng > 0 ? 'E' : 'W'}
                                                                </p>
                                                                <p className="text-xs text-gray-400">
                                                                    <span className="font-bold">Drop:</span> {Math.abs(ride.dropLocation.lat).toFixed(5)}°{ride.dropLocation.lat > 0 ? 'N' : 'S'}, 
                                                                    {Math.abs(ride.dropLocation.lng).toFixed(5)}°{ride.dropLocation.lng > 0 ? 'E' : 'W'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="badge badge-secondary">
                                                            +{ride.rewardPoints} reward points
                                                        </div>
                                                    </div>
                                                    <div className="card-actions justify-end mt-2">
                                                        <motion.button 
                                                            className="btn btn-sm btn-outline border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                                                            onClick={() => declineRide(ride.id)}
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                        >
                                                            Decline
                                                        </motion.button>
                                                        <motion.button 
                                                            className="btn btn-sm bg-emerald-500 text-white hover:bg-emerald-600 border-none"
                                                            onClick={() => acceptRide(ride.id)}
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                        >
                                                            Accept
                                                        </motion.button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
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