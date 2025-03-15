'use client'

import { useState, useEffect } from 'react'

export default function CarpoolMatcher({
  origin = "Current Location",
  destination = "",
  date = "",
  time = "",
  passengers = 1,
  onMatchFound = () => {}
}) {
  const [isSearching, setIsSearching] = useState(false)
  const [matches, setMatches] = useState([])
  const [filteredMatches, setFilteredMatches] = useState([])
  const [filterTime, setFilterTime] = useState(15) 
  const [sortBy, setSortBy] = useState('price') 
  
  
  useEffect(() => {
    if (destination && date && time && isSearching) {
      const mockMatches = [
        {
          id: 1,
          driver: "Ankit S.",
          rating: 4.8,
          departureTime: "8:30 AM",
          timeOffset: -15, 
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
          timeOffset: 0, 
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
          timeOffset: 15, 
          passengers: 2,
          maxPassengers: 4,
          fare: 70,
          regularFare: 150,
          pickupDistance: 0.3,
          dropoffDistance: 0.4,
          route: "Via Guindy"
        },
        {
          id: 4,
          driver: "Divya S.",
          rating: 4.6,
          departureTime: "8:15 AM",
          timeOffset: -30, 
          passengers: 1,
          maxPassengers: 3,
          fare: 65,
          regularFare: 140,
          pickupDistance: 0.4,
          dropoffDistance: 0.5,
          route: "Via Adyar"
        },
        {
          id: 5,
          driver: "Vikram M.",
          rating: 4.9,
          departureTime: "9:15 AM",
          timeOffset: 30, 
          passengers: 2,
          maxPassengers: 4,
          fare: 85,
          regularFare: 170,
          pickupDistance: 0.2,
          dropoffDistance: 0.3,
          route: "Via Chetpet"
        }
      ]
      
      setMatches(mockMatches)
      
      
      setTimeout(() => {
        setIsSearching(false)
      }, 1500)
    }
  }, [destination, date, time, isSearching])
  
  
  useEffect(() => {
    if (matches.length > 0) {
      
      let filtered = matches.filter(match => 
        Math.abs(match.timeOffset) <= filterTime
      )
      
      
      if (sortBy === 'price') {
        filtered.sort((a, b) => a.fare - b.fare)
      } else if (sortBy === 'time') {
        filtered.sort((a, b) => Math.abs(a.timeOffset) - Math.abs(b.timeOffset))
      } else if (sortBy === 'rating') {
        filtered.sort((a, b) => b.rating - a.rating)
      }
      
      setFilteredMatches(filtered)
    }
  }, [matches, filterTime, sortBy])
  
  
  const startSearch = () => {
    setIsSearching(true)
    setMatches([])
    setFilteredMatches([])
  }
  
  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Carpool Matcher</h2>
        
        {isSearching ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
            <h3 className="font-bold text-lg mt-4">Finding carpools...</h3>
            <p className="text-sm text-gray-500 mt-2">Matching your route with others</p>
          </div>
        ) : filteredMatches.length > 0 ? (
          <>
            <div className="flex flex-wrap justify-between items-center mt-2 mb-4">
              <div className="flex items-center">
                <span className="text-sm mr-2">Time flexibility:</span>
                <select 
                  className="select select-bordered select-sm"
                  value={filterTime}
                  onChange={(e) => setFilterTime(parseInt(e.target.value))}
                >
                  <option value="15">±15 min</option>
                  <option value="30">±30 min</option>
                  <option value="60">±1 hour</option>
                </select>
              </div>
              
              <div className="flex items-center">
                <span className="text-sm mr-2">Sort by:</span>
                <select 
                  className="select select-bordered select-sm"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="price">Price</option>
                  <option value="time">Departure Time</option>
                  <option value="rating">Driver Rating</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {filteredMatches.map(match => (
                <div key={match.id} className="card bg-base-200">
                  <div className="card-body p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex gap-3">
                        <div className="avatar">
                          <div className="w-12 rounded-full">
                            <img src="https:
                          </div>
                        </div>
                        <div>
                          <h3 className="font-bold">{match.driver} • ⭐ {match.rating}</h3>
                          <p className="text-sm">
                            Departing at {match.departureTime} • {match.route}
                          </p>
                          <div className="mt-1">
                            <span className="badge badge-primary">{match.passengers}/{match.maxPassengers} passengers</span>
                            <span className="badge ml-2">Pickup: {match.pickupDistance} km</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">₹{match.fare}</p>
                        <p className="text-sm line-through">₹{match.regularFare}</p>
                        <p className="text-xs text-success">Save {Math.round((match.regularFare - match.fare) / match.regularFare * 100)}%</p>
                      </div>
                    </div>
                    <div className="card-actions justify-end mt-2">
                      <button 
                        className="btn btn-primary btn-sm"
                        onClick={() => onMatchFound(match)}
                      >
                        Book Carpool
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div>
            {destination ? (
              <div className="alert alert-info">
                <svg xmlns="http:
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span>No carpools available for your route and time. Try adjusting your criteria.</span>
              </div>
            ) : (
              <div className="py-4">
                <p className="text-center">Enter your destination and time to find available carpools.</p>
                <div className="flex justify-center mt-4">
                  <button 
                    className="btn btn-primary"
                    onClick={startSearch}
                    disabled={!destination || !date || !time}
                  >
                    Find Carpools
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        
        {filteredMatches.length > 0 && (
          <div className="alert alert-success mt-4">
            <svg xmlns="http:
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Carpooling saves you up to 50% during peak hours and reduces congestion!</span>
          </div>
        )}
      </div>
    </div>
  )
}