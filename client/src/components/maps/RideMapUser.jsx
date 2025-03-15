'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

const RideMap = ({ 
  userLocation, 
  driverLocation, 
  showRouteEstimate = false, 
  destination = '',
  bookingStep = 1,
  routeData = null
}) => {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const userMarkerRef = useRef(null)
  const driverMarkerRef = useRef(null)
  const routeRef = useRef(null)
  const destinationMarkerRef = useRef(null)
  const destinationInputRef = useRef(destination)
  
  const [mapLoaded, setMapLoaded] = useState(false)
  const [driverHeading, setDriverHeading] = useState(0)
  const [previousDriverLocation, setPreviousDriverLocation] = useState(null)
  const [isDriverMoving, setIsDriverMoving] = useState(false)
  const [isMapUpdating, setIsMapUpdating] = useState(false)

  // Prevent map updates during typing
  useEffect(() => {
    const timer = setTimeout(() => {
      destinationInputRef.current = destination
      if (mapLoaded) {
        updateDestinationMarker()
      }
    }, 500)
    
    return () => clearTimeout(timer)
  }, [destination])
  
  // Initialize map when component mounts
  useEffect(() => {
    if (!mapRef.current) return
    
    const initMap = () => {
      // Mock map with dark theme
      mapRef.current.style.background = 'rgb(23, 25, 35)'
      mapInstanceRef.current = true
      
      // Create user marker
      userMarkerRef.current = document.createElement('div')
      userMarkerRef.current.className = 'absolute w-6 h-6 bg-blue-600 rounded-full z-30 border-2 border-white transform -translate-x-3 -translate-y-3 shadow-lg'
      userMarkerRef.current.innerHTML = `
        <div class="absolute w-10 h-10 bg-blue-500 rounded-full opacity-30 animate-ping -translate-x-2 -translate-y-2"></div>
      `
      mapRef.current.appendChild(userMarkerRef.current)
      
      // Position user marker in center
      userMarkerRef.current.style.left = '50%'
      userMarkerRef.current.style.top = '50%'
      
      setMapLoaded(true)
    }
    
    initMap()
    
    // Mock map grid lines
    const createMapGrid = () => {
      const grid = document.createElement('div')
      grid.className = 'absolute inset-0 z-0'
      grid.innerHTML = `
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" stroke-width="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      `
      mapRef.current.appendChild(grid)
    }
    
    createMapGrid()
    
    return () => {
      // Clean up markers and map instance
      if (userMarkerRef.current && userMarkerRef.current.parentNode) {
        userMarkerRef.current.parentNode.removeChild(userMarkerRef.current)
      }
      
      if (driverMarkerRef.current && driverMarkerRef.current.parentNode) {
        driverMarkerRef.current.parentNode.removeChild(driverMarkerRef.current)
      }
      
      if (routeRef.current && routeRef.current.parentNode) {
        routeRef.current.parentNode.removeChild(routeRef.current)
      }
      
      if (destinationMarkerRef.current && destinationMarkerRef.current.parentNode) {
        destinationMarkerRef.current.parentNode.removeChild(destinationMarkerRef.current)
      }
    }
  }, [])
  
  // Update destination marker when destination changes (with debounce)
  const updateDestinationMarker = () => {
    if (!mapLoaded || !mapRef.current || isMapUpdating) return
    
    setIsMapUpdating(true)
    
    // Remove old destination marker and route if they exist
    if (destinationMarkerRef.current && destinationMarkerRef.current.parentNode) {
      destinationMarkerRef.current.parentNode.removeChild(destinationMarkerRef.current)
      destinationMarkerRef.current = null
    }
    
    if (routeRef.current && routeRef.current.parentNode) {
      routeRef.current.parentNode.removeChild(routeRef.current)
      routeRef.current = null
    }
    
    // Create new destination marker and route if destination exists
    if (showRouteEstimate && destinationInputRef.current) {
      // Create destination marker
      destinationMarkerRef.current = document.createElement('div')
      destinationMarkerRef.current.className = 'absolute w-6 h-6 bg-red-600 rounded-full z-20 border-2 border-white transform -translate-x-3 -translate-y-3 shadow-lg flex items-center justify-center'
      destinationMarkerRef.current.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 12h.01M12 12h.01M19 12h.01M6 12a2 2 0 11-4 0 2 2 0 014 0zm7 0a2 2 0 11-4 0 2 2 0 014 0zm7 0a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      `
      mapRef.current.appendChild(destinationMarkerRef.current)
      
      // Position destination marker based on destination string hash
      const hash = destinationInputRef.current.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0)
      const destX = 20 + (hash % 60) // between 20% and 80%
      const destY = 20 + ((hash * 7) % 60) // between 20% and 80%
      
      destinationMarkerRef.current.style.left = `${destX}%`
      destinationMarkerRef.current.style.top = `${destY}%`
      
      // Create destination label
      const destLabel = document.createElement('div')
      destLabel.className = 'absolute bg-gray-800 text-white text-xs py-1 px-2 rounded shadow-lg z-30 whitespace-nowrap'
      destLabel.style.left = `${destX}%`
      destLabel.style.top = `${destY - 6}%`
      destLabel.style.transform = 'translate(-50%, -100%)'
      destLabel.textContent = destinationInputRef.current
      mapRef.current.appendChild(destLabel)
      
      // Create route line
      routeRef.current = document.createElement('div')
      routeRef.current.className = 'absolute h-1 bg-blue-500 z-10 opacity-70 transform origin-left'
      mapRef.current.appendChild(routeRef.current)
      
      // Position and rotate route line
      const userX = 50 // center of map
      const userY = 50
      const angle = Math.atan2(destY - userY, destX - userX) * (180 / Math.PI)
      const distance = Math.sqrt(Math.pow(destX - userX, 2) + Math.pow(destY - userY, 2))
      
      routeRef.current.style.width = `${distance}%`
      routeRef.current.style.left = `${userX}%`
      routeRef.current.style.top = `${userY}%`
      routeRef.current.style.transform = `translateY(-50%) rotate(${angle}deg)`
      
      // Add route decoration
      const routeDots = document.createElement('div')
      routeDots.className = 'absolute z-15'
      routeDots.style.left = `${userX}%`
      routeDots.style.top = `${userY}%`
      routeDots.innerHTML = Array(5).fill(0).map((_, i) => {
        const dotDistance = distance * (i + 1) / 6
        const dotX = Math.cos(angle * Math.PI / 180) * dotDistance
        const dotY = Math.sin(angle * Math.PI / 180) * dotDistance
        return `
          <div class="absolute w-2 h-2 bg-blue-400 rounded-full opacity-80" 
               style="transform: translate(${dotX}%, ${dotY}%) translate(-50%, -50%)"></div>
        `
      }).join('')
      mapRef.current.appendChild(routeDots)
    }
    
    setIsMapUpdating(false)
  }
  
  // Create or update driver marker when driver location changes
  useEffect(() => {
    if (!mapLoaded || !driverLocation) return
    
    // Calculate heading if we have previous location
    if (previousDriverLocation) {
      const dx = driverLocation.lng - previousDriverLocation.lng
      const dy = driverLocation.lat - previousDriverLocation.lat
      
      if (dx !== 0 || dy !== 0) {
        const newHeading = Math.atan2(dy, dx) * (180 / Math.PI)
        setDriverHeading(newHeading)
        setIsDriverMoving(true)
        
        // Reset movement animation after a delay
        setTimeout(() => setIsDriverMoving(false), 500)
      }
    }
    
    setPreviousDriverLocation(driverLocation)
    
    // Create driver marker if it doesn't exist
    if (!driverMarkerRef.current && mapRef.current) {
      driverMarkerRef.current = document.createElement('div')
      driverMarkerRef.current.className = 'absolute z-40'
      driverMarkerRef.current.innerHTML = `
        <div class="relative">
          <div class="car-icon absolute w-8 h-8 bg-emerald-500 rounded-full border-2 border-white transform -translate-x-4 -translate-y-4 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
          ${bookingStep === 4 ? `<div class="pulse-animation absolute w-12 h-12 bg-emerald-500 rounded-full opacity-30 transform -translate-x-6 -translate-y-6"></div>` : ''}
        </div>
      `
      mapRef.current.appendChild(driverMarkerRef.current)
      
      // Add animation styles
      const style = document.createElement('style')
      style.textContent = `
        @keyframes pulse {
          0% { transform: scale(0.8) translate(-6px, -6px); opacity: 0.7; }
          70% { transform: scale(1.3) translate(-6px, -6px); opacity: 0; }
          100% { transform: scale(0.8) translate(-6px, -6px); opacity: 0; }
        }
        .pulse-animation { animation: pulse 1.5s infinite; }
        .car-icon { transition: transform 0.3s ease; }
      `
      document.head.appendChild(style)
    }
    
    // Update driver position
    if (driverMarkerRef.current) {
      const userX = 50 // center map position (user)
      const userY = 50
      
      // Calculate relative position to user
      const lat_diff = driverLocation.lat - userLocation.lat
      const lng_diff = driverLocation.lng - userLocation.lng
      
      // Scale for display purposes
      const scale = 500
      const driverX = userX + lng_diff * scale
      const driverY = userY - lat_diff * scale
      
      driverMarkerRef.current.style.left = `${driverX}%`
      driverMarkerRef.current.style.top = `${driverY}%`
      
      // Update driver car orientation
      const carIcon = driverMarkerRef.current.querySelector('.car-icon')
      if (carIcon) {
        carIcon.style.transform = isDriverMoving 
          ? `translate(-50%, -50%) rotate(${driverHeading}deg) scale(1.1)` 
          : `translate(-50%, -50%) rotate(${driverHeading}deg)`
      }
      
      // Update route between driver and user
      const oldDriverRoute = mapRef.current.querySelector('.driver-route')
      if (oldDriverRoute) {
        oldDriverRoute.parentNode.removeChild(oldDriverRoute)
      }
      
      // Create new driver route
      const driverRoute = document.createElement('div')
      driverRoute.className = 'absolute h-1 bg-emerald-500 z-10 opacity-70 transform origin-left driver-route'
      mapRef.current.appendChild(driverRoute)
      
      // Position and rotate driver route
      const angle = Math.atan2(userY - driverY, userX - driverX) * (180 / Math.PI)
      const distance = Math.sqrt(Math.pow(userX - driverX, 2) + Math.pow(userY - driverY, 2))
      
      driverRoute.style.width = `${distance}%`
      driverRoute.style.left = `${driverX}%`
      driverRoute.style.top = `${driverY}%`
      driverRoute.style.transform = `translateY(-50%) rotate(${angle}deg)`
      
      // Add dashed effect to driver route
      const dashSize = Math.min(20, distance / 4)
      driverRoute.style.backgroundImage = `linear-gradient(to right, rgba(16, 185, 129, 0.7) ${dashSize}%, transparent ${dashSize}%, transparent ${dashSize * 2}%)`
      driverRoute.style.backgroundSize = `${dashSize * 2}% 100%`
      driverRoute.style.backgroundRepeat = 'repeat-x'
    }
  }, [driverLocation, mapLoaded, userLocation, previousDriverLocation, bookingStep, isDriverMoving, driverHeading])
  
  // Process route data from socket if available
  useEffect(() => {
    if (!mapLoaded || !routeData) return
    
    // Update the map with the route data from socket
    // This function would process real route data when available
    updateDestinationMarker()
  }, [routeData, mapLoaded])
  
  // Update map when booking step changes
  useEffect(() => {
    if (!mapLoaded) return
    
    // Different map behaviors based on booking step
    if (bookingStep === 1) {
      // Reset map
      if (destinationMarkerRef.current && destinationMarkerRef.current.parentNode) {
        destinationMarkerRef.current.parentNode.removeChild(destinationMarkerRef.current)
        destinationMarkerRef.current = null
      }
      
      if (routeRef.current && routeRef.current.parentNode) {
        routeRef.current.parentNode.removeChild(routeRef.current)
        routeRef.current = null
      }
      
      if (driverMarkerRef.current && driverMarkerRef.current.parentNode) {
        driverMarkerRef.current.parentNode.removeChild(driverMarkerRef.current)
        driverMarkerRef.current = null
      }
    } else if (bookingStep === 2 && destinationInputRef.current) {
      // Destination selection
      updateDestinationMarker()
    } else if (bookingStep === 3) {
      // Searching animation
      if (mapRef.current) {
        const searchingOverlay = document.createElement('div')
        searchingOverlay.className = 'absolute inset-0 bg-black bg-opacity-20 z-50 flex items-center justify-center'
        searchingOverlay.innerHTML = `
          <div class="bg-gray-800 bg-opacity-80 px-6 py-4 rounded-xl border border-gray-700">
            <div class="flex items-center space-x-3">
              <div class="w-4 h-4 bg-emerald-500 rounded-full animate-ping"></div>
              <p class="text-white font-medium">Scanning for nearby drivers...</p>
            </div>
          </div>
        `
        mapRef.current.appendChild(searchingOverlay)
        
        return () => {
          if (searchingOverlay && searchingOverlay.parentNode) {
            searchingOverlay.parentNode.removeChild(searchingOverlay)
          }
        }
      }
    } else if (bookingStep === 4) {
      // Show driver and route
      updateDestinationMarker()
    }
  }, [bookingStep, mapLoaded])
  
  // Ensure destination marker is updated when showRouteEstimate changes
  useEffect(() => {
    if (mapLoaded && showRouteEstimate) {
      updateDestinationMarker()
    }
  }, [showRouteEstimate, mapLoaded])
  
  return (
    <div className="relative w-full h-full bg-gray-900 overflow-hidden rounded-lg">
      {/* Map container */}
      <div 
        ref={mapRef}
        className="w-full h-full relative"
        style={{
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Initial loading state */}
        {!mapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-emerald-500"></div>
          </div>
        )}
      </div>
      
      {/* Map attribution */}
      <div className="absolute bottom-2 right-2 text-xs text-gray-500">
        Map © RideMapService
      </div>
    </div>
  )
}

export default RideMap