'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/ui/Navbar'
import HeatMap from '@/components/maps/HeatMap'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'

// Dynamically import the HeatMap component with no SSR to avoid mapbox-gl window not defined errors
const DynamicHeatMap = dynamic(() => import('@/components/maps/HeatMap'), { 
  ssr: false,
  loading: () => (
    <div className="h-[70vh] w-full flex items-center justify-center bg-gray-800 rounded-lg">
      <div className="loading loading-spinner loading-lg text-emerald-500"></div>
    </div>
  )
})

export default function ParkingHeatmap() {
  const [parkingData, setParkingData] = useState({
    hotspots: [],
    parking_spots: []
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [driverLocation, setDriverLocation] = useState({ lat: 12.9716, lng: 77.5946 })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('http://localhost:5000/api/find-parking')
        
        if (!response.ok) {
          throw new Error('Failed to fetch parking data')
        }
        
        const data = await response.json()
        setParkingData(data)
        setError(null)
      } catch (err) {
        console.error('Error processing data:', err)
        setError('Failed to load data. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchData()
  }, [])
  
  // Get user's location when component mounts
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setDriverLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          console.error("Error getting user location:", error)
        }
      )
    }
  }, [])
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-emerald-500"></div>
          <p className="mt-4">Loading parking data...</p>
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="alert alert-error">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      </div>
    )
  }
  
  // Filter parking spots to only show those outside hotspots (edge locations)
  const edgeParkingSpots = parkingData.parking_spots.filter(spot => spot.is_edge_location)
  
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
          Parking Finder
        </motion.h1>
        
        <motion.div 
          className="card bg-gray-800 shadow-xl mb-6 border border-gray-700"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="card-body">
            <div className="flex flex-wrap items-center justify-between mb-4">
              <h2 className="card-title text-white">Traffic Hotspots & Available Parking</h2>
            </div>
            
            <div className="h-[70vh] w-full rounded-lg overflow-hidden">
              <DynamicHeatMap 
                hotspots={parkingData.hotspots}
                parkingSpots={edgeParkingSpots}
                driverLocation={driverLocation}
              />
            </div>
            
            <div className="alert bg-gray-700 mt-4 border border-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-emerald-400 shrink-0 w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span className="text-gray-200">
                Showing {edgeParkingSpots.length} parking spots outside of {parkingData.hotspots.length} traffic hotspots
              </span>
            </div>
          </div>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div 
            className="card bg-gray-800 shadow-xl border border-gray-700"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div className="card-body">
              <h2 className="card-title text-white">Traffic Hotspots</h2>
              
              <div className="overflow-x-auto">
                <table className="table bg-gray-700 text-gray-200">
                  <thead className="text-gray-200">
                    <tr>
                      <th>#</th>
                      <th>Location</th>
                      <th>Area</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parkingData.hotspots.map((hotspot, index) => (
                      <tr key={index} className="hover:bg-gray-600">
                        <td className="text-white">{index + 1}</td>
                        <td>{hotspot.location}</td>
                        <td>{hotspot.formatted_address || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            className="card bg-gray-800 shadow-xl border border-gray-700"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <div className="card-body">
              <h2 className="card-title text-white">Edge Parking Spots</h2>
              
              <div className="overflow-x-auto">
                <table className="table bg-gray-700 text-gray-200">
                  <thead className="text-gray-200">
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Distance</th>
                      <th>Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {edgeParkingSpots.map((spot, index) => (
                      <tr key={index} className="hover:bg-gray-600">
                        <td className="text-white">{index + 1}</td>
                        <td>{spot.name}</td>
                        <td>{spot.walking_info?.distance || 'N/A'}</td>
                        <td>
                          {spot.rating ? (
                            <div className="flex items-center">
                              <span>{spot.rating}</span>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              <span className="text-sm ml-1">({spot.user_ratings_total || 0})</span>
                            </div>
                          ) : 'No ratings'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}