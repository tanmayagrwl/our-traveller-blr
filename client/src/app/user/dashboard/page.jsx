'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/ui/Navbar'
import RideMap from '@/components/maps/RideMapUser'
import { 
  mockUserLocation, 
  mockRecentRides, 
  mockPeakHourTips, 
  mockPromoData
} from '@/utils/mockData'
import { motion } from 'framer-motion'
import useSocket from '@/hooks/useSocket'

export default function UserDashboard() {
  const router = useRouter()
  const [userLocation, setUserLocation] = useState(mockUserLocation)
  const [recentRides, setRecentRides] = useState(mockRecentRides)
  const [waitTime, setWaitTime] = useState(5)
  const [nearbyDrivers, setNearbyDrivers] = useState(3)
  const [userId] = useState('user-' + Math.floor(Math.random() * 10000))
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const [activePromos, setActivePromos] = useState([])
  
  // Socket connection
  const { isConnected, lastMessage, sendMessage } = useSocket('ws://localhost:5000')
  
  // Request location and update it
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        () => {
          console.log('Using mock location data')
        }
      )
    }
    
    // Register with server as a user
    if (isConnected) {
      sendMessage({
        type: 'user_status',
        userId: userId,
        status: 'online',
        location: userLocation,
        timestamp: new Date().toISOString()
      })
    }
  }, [isConnected, sendMessage, userId, userLocation])
  
  // Update dashboard stats periodically
  useEffect(() => {
    const updateStats = () => {
      // Random variation for dashboard stats
      setWaitTime(Math.max(3, Math.floor(Math.random() * 8)))
      setNearbyDrivers(Math.floor(Math.random() * 5) + 1)
      
      // Request stats from server
      if (isConnected) {
        sendMessage({
          type: 'request_area_stats',
          userId: userId,
          location: userLocation,
          timestamp: new Date().toISOString()
        })
      }
    }
    
    // Initial update
    updateStats()
    
    // Set interval for periodic updates
    const interval = setInterval(updateStats, 30000)
    
    return () => clearInterval(interval)
  }, [isConnected, sendMessage, userId])
  
  // Handle WebSocket messages
  useEffect(() => {
    if (!lastMessage) return
    
    const { type } = lastMessage
    
    switch (type) {
      case 'area_stats':
        // Update stats with real data from server
        if (lastMessage.waitTime !== undefined) {
          setWaitTime(lastMessage.waitTime)
        }
        
        if (lastMessage.nearbyDrivers !== undefined) {
          setNearbyDrivers(lastMessage.nearbyDrivers)
        }
        
        // Update ride history if provided
        if (lastMessage.recentRides && lastMessage.recentRides.length > 0) {
          setRecentRides(lastMessage.recentRides)
        }
        break
        
      case 'active_promos':
        // Update active promotions
        setActivePromos(lastMessage.promos || [])
        break
        
      case 'location_update':
        // Server may send back verified/corrected location
        if (lastMessage.location) {
          setUserLocation(lastMessage.location)
        }
        break
        
      case 'ride_update':
        // Update when a recent ride status changes
        const updatedRide = lastMessage.ride
        if (updatedRide && updatedRide.id) {
          setRecentRides(prev => 
            prev.map(ride => 
              ride.id === updatedRide.id ? { ...ride, ...updatedRide } : ride
            )
          )
        }
        break
    }
  }, [lastMessage])
  
  // Navigate to booking page
  const handleBookNow = () => {
    router.push('/user/booking')
  }
  
  // Handle rebooking a previous ride
  const handleRebook = (ride) => {
    // Store ride details for booking page
    localStorage.setItem('rebookDestination', ride.destination)
    router.push('/user/booking')
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
          <h1 className="text-3xl font-bold mb-6 text-white">Welcome, User!</h1>
          
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
              className="card bg-gray-900 shadow-2xl mb-6 border border-gray-800 rounded-xl"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <div className="card-body p-6">
                <h2 className="card-title text-xl font-bold text-white mb-4">Quick Book</h2>
                
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
                      placeholder="Pickup location" 
                      className="input bg-gray-800 border-gray-700 text-white w-full focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" 
                      defaultValue="Current Location"
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
                      placeholder="Destination" 
                      className="input bg-gray-800 border-gray-700 text-white w-full focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" 
                    />
                  </div>
                </div>
                
                <div className="mt-6">
                  <motion.button 
                    className="btn bg-emerald-600 text-white hover:bg-emerald-700 border-none w-full mb-2 font-bold py-3"
                    onClick={handleBookNow}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Book Now
                  </motion.button>
                  
                  <motion.button 
                    className="btn btn-outline border-gray-700 text-gray-300 hover:bg-gray-800 hover:border-gray-600 w-full py-3"
                    onClick={() => router.push('/user/schedule')}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Schedule for Later
                  </motion.button>
                </div>
                
                <div className="divider my-4 text-gray-500 font-medium">OR</div>
                
                <div className="flex justify-between gap-4">
                  <motion.button 
                    className="btn bg-blue-600 text-white hover:bg-blue-700 border-none flex-1 font-bold py-3"
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
              className="card bg-gray-900 shadow-2xl border border-gray-800 rounded-xl mb-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <div className="card-body p-6">
                <h2 className="card-title text-xl font-bold text-white mb-4">Current Status</h2>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                    <div className="text-gray-400 text-sm mb-1 font-medium">Wait Time</div>
                    <div className="text-2xl font-bold text-emerald-400">{waitTime} min</div>
                    <div className="text-xs text-gray-400 mt-1">↘︎ 20% less than usual</div>
                  </div>
                  
                  <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                    <div className="text-gray-400 text-sm mb-1 font-medium">Nearby Drivers</div>
                    <div className="text-2xl font-bold text-white">{nearbyDrivers}</div>
                    <div className="text-xs text-gray-400 mt-1">Available now</div>
                  </div>
                </div>
                
                <div className="bg-blue-900/40 p-4 mt-4 rounded-lg border border-blue-800 flex items-start gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-blue-400 shrink-0 w-6 h-6 mt-1">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <div>
                    <h3 className="font-bold text-blue-100">Surge Pricing Active</h3>
                    <p className="text-blue-200 mt-1">Consider carpooling to save 30% on your next ride!</p>
                  </div>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              className="card bg-gray-900 shadow-2xl border border-gray-800 rounded-xl"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <div className="card-body p-6">
                <h2 className="card-title text-xl font-bold text-white mb-4">Promotions</h2>
                
                <div className="flex flex-col gap-3">
                  {/* Display active promos from WebSocket or fallback to mockData */}
                  {(activePromos.length > 0 ? activePromos : mockPromoData).map((promo, index) => (
                    <div 
                      key={index} 
                      className="bg-gray-800 border border-gray-700 p-3 rounded-lg"
                    >
                      <div className="flex items-center">
                        <div 
                          className={`w-3 h-3 rounded-full ${
                            index % 4 === 0 ? 'bg-emerald-500' : 
                            index % 4 === 1 ? 'bg-purple-500' : 
                            index % 4 === 2 ? 'bg-blue-500' : 
                            'bg-amber-500'
                          } mr-2`}>
                        </div>
                        <span className="font-medium text-white">{promo}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
          
          <div className="lg:col-span-2">
            <motion.div 
              className="card bg-gray-900 shadow-2xl mb-6 border border-gray-800 rounded-xl"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <div className="card-body p-6">
                <h2 className="card-title text-xl font-bold text-white mb-4">Your Location</h2>
                <div className="h-96 w-full rounded-xl overflow-hidden border border-gray-800">
                  <RideMap 
                    userLocation={userLocation} 
                    showRouteEstimate={false}
                    onMapLoaded={() => setIsMapLoaded(true)}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div className="bg-gray-800 rounded-xl p-4 flex items-center border border-gray-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-emerald-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div>
                      <p className="text-gray-400 text-sm">Your Area</p>
                      <p className="text-white font-bold text-lg">Central District</p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-800 rounded-xl p-4 flex items-center border border-gray-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-emerald-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-gray-400 text-sm">Peak Hours</p>
                      <p className="text-white font-bold text-lg">8-10 AM, 5-7 PM</p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-800 rounded-xl p-4 flex items-center border border-gray-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-emerald-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <p className="text-gray-400 text-sm">Popular Payment</p>
                      <p className="text-white font-bold text-lg">Wallet</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              className="card bg-gray-900 shadow-2xl mb-6 border border-gray-800 rounded-xl"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <div className="card-body p-6">
                <h2 className="card-title text-xl font-bold text-white mb-4">Recent Rides</h2>
                
                <div className="overflow-x-auto">
                  {recentRides.length > 0 ? (
                    <table className="table w-full bg-transparent">
                      <thead>
                        <tr className="text-gray-400 border-b border-gray-700">
                          <th className="px-4 py-3 font-bold">Date</th>
                          <th className="px-4 py-3 font-bold">Destination</th>
                          <th className="px-4 py-3 font-bold">Fare</th>
                          <th className="px-4 py-3 font-bold">Driver</th>
                          <th className="px-4 py-3 font-bold">Type</th>
                          <th className="px-4 py-3 font-bold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentRides.map((ride, index) => (
                          <motion.tr 
                            key={index}
                            className="border-b border-gray-800 hover:bg-gray-800/50"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: 0.1 + (index * 0.05) }}
                          >
                            <td className="px-4 py-3 text-gray-300">{ride.date}</td>
                            <td className="px-4 py-3 text-white font-medium">{ride.destination}</td>
                            <td className="px-4 py-3 text-emerald-400 font-bold">₹{ride.fare}</td>
                            <td className="px-4 py-3 text-gray-300">{ride.driver}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-bold text-white ${
                                ride.type === 'Individual' ? 'bg-emerald-600' : 
                                ride.type === 'Carpool' ? 'bg-purple-600' : 
                                'bg-blue-600'
                              }`}>
                                {ride.type}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <motion.button 
                                className="btn btn-xs bg-gray-700 hover:bg-emerald-600 text-white border-none px-3"
                                onClick={() => handleRebook(ride)}
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
                  ) : (
                    <div className="bg-gray-800 p-5 rounded-lg text-center">
                      <p className="text-gray-400">No recent rides found</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              className="card bg-gray-900 shadow-2xl border border-gray-800 rounded-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <div className="card-body p-6">
                <h2 className="card-title text-xl font-bold text-white mb-4">Peak Hour Tips</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mockPeakHourTips.map((tip, index) => (
                    <div key={index} className="bg-gray-800 p-3 rounded-lg border border-gray-700">
                      <div className="flex items-start">
                        <div className="bg-emerald-900/50 p-2 rounded-lg mr-3 mt-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                        </div>
                        <p className="text-sm text-gray-300">{tip}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}