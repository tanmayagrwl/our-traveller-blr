'use client'

import { useState, useEffect } from 'react'
import { 
  mockCarpoolMatches, 
  mockFilterOptions, 
  mockAlertMessages,
  mockIcons 
} from '@/utils/mockData'

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
      setMatches(mockCarpoolMatches)
      
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
    <div className="card bg-gray-800 shadow-xl border border-gray-700 text-white">
      <div className="card-body">
        <h2 className="card-title text-white font-bold">Carpool Matcher</h2>
        
        {isSearching ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500"></div>
            <h3 className="font-bold text-lg mt-4 text-white">Finding carpools...</h3>
            <p className="text-sm text-gray-400 mt-2">Matching your route with others</p>
          </div>
        ) : filteredMatches.length > 0 ? (
          <>
            <div className="flex flex-wrap justify-between items-center mt-2 mb-4">
              <div className="flex items-center">
                <span className="text-sm mr-2 text-gray-300 font-medium">Time flexibility:</span>
                <select 
                  className="select select-bordered select-sm bg-gray-700 border-gray-600 text-white focus:border-purple-500"
                  value={filterTime}
                  onChange={(e) => setFilterTime(parseInt(e.target.value))}
                >
                  {mockFilterOptions.timeFlexibility.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center">
                <span className="text-sm mr-2 text-gray-300 font-medium">Sort by:</span>
                <select 
                  className="select select-bordered select-sm bg-gray-700 border-gray-600 text-white focus:border-purple-500"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  {mockFilterOptions.sortBy.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {filteredMatches.map(match => (
                <div key={match.id} className="card bg-gray-700 border border-gray-600 hover:border-purple-500 transition-all hover:translate-y-[-5px]">
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
                      <button 
                        className="btn btn-sm bg-purple-500 text-white hover:bg-purple-600 border-none font-bold"
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
              <div className="alert bg-blue-900/50 border border-blue-700 text-blue-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-blue-400 shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  {mockIcons.info}
                </svg>
                <span>{mockAlertMessages.noCarpools}</span>
              </div>
            ) : (
              <div className="py-4">
                <p className="text-center text-gray-300">{mockAlertMessages.enterDestination}</p>
                <div className="flex justify-center mt-4">
                  <button 
                    className="btn bg-purple-500 text-white hover:bg-purple-600 border-none font-bold"
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
          <div className="alert bg-emerald-900/50 mt-4 border border-emerald-700 text-emerald-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-emerald-400 shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              {mockIcons.check}
            </svg>
            <span>{mockAlertMessages.carpoolBenefits}</span>
          </div>
        )}
      </div>
    </div>
  )
}