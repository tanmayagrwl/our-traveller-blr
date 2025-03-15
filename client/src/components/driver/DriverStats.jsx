'use client'

import { useState, useEffect } from 'react'

export default function DriverStats({ initialStats = null }) {
  const defaultStats = {
    dailyStats: {
      completedRides: 8,
      declinedRides: 2,
      earnings: 1250,
      rating: 4.8,
      onlineHours: 5,
      peakHourRides: 5,
      standPickups: 3
    },
    weeklyEarnings: [
      { day: 'Mon', amount: 950 },
      { day: 'Tue', amount: 1100 },
      { day: 'Wed', amount: 950 },
      { day: 'Thu', amount: 1250 },
      { day: 'Fri', amount: 1500 },
      { day: 'Sat', amount: 1800 },
      { day: 'Sun', amount: 1350 }
    ],
    comparison: {
      earnings: { current: 8900, previous: 7500 },
      rides: { current: 72, previous: 65 },
      rating: { current: 4.8, previous: 4.7 },
      acceptance: { current: 85, previous: 75 }
    }
  }
  
  const [stats, setStats] = useState(initialStats || defaultStats)
  const [selectedPeriod, setSelectedPeriod] = useState('today')
  
  const acceptanceRate = Math.round(
    (stats.dailyStats.completedRides / 
     (stats.dailyStats.completedRides + stats.dailyStats.declinedRides)) * 100
  ) || 0
  
  const peakHourPercentage = Math.round(
    (stats.dailyStats.peakHourRides / stats.dailyStats.completedRides) * 100
  ) || 0
  
  const standPickupPercentage = Math.round(
    (stats.dailyStats.standPickups / stats.dailyStats.completedRides) * 100
  ) || 0
  
  const earningsPerHour = Math.round(
    stats.dailyStats.earnings / stats.dailyStats.onlineHours
  ) || 0
  
  const maxWeeklyEarning = Math.max(...stats.weeklyEarnings.map(day => day.amount))
  
  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <div className="flex justify-between items-center">
          <h2 className="card-title">Performance Statistics</h2>
          
          <div className="btn-group">
            <button 
              className={`btn btn-sm ${selectedPeriod === 'today' ? 'btn-active' : ''}`}
              onClick={() => setSelectedPeriod('today')}
            >
              Today
            </button>
            <button 
              className={`btn btn-sm ${selectedPeriod === 'week' ? 'btn-active' : ''}`}
              onClick={() => setSelectedPeriod('week')}
            >
              Week
            </button>
            <button 
              className={`btn btn-sm ${selectedPeriod === 'month' ? 'btn-active' : ''}`}
              onClick={() => setSelectedPeriod('month')}
            >
              Month
            </button>
          </div>
        </div>
        
        {selectedPeriod === 'today' && (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="stat bg-base-200 rounded-box p-3">
                <div className="stat-title text-xs">Earnings</div>
                <div className="stat-value text-primary text-2xl">₹{stats.dailyStats.earnings}</div>
                <div className="stat-desc text-xs">₹{earningsPerHour}/hr</div>
              </div>
              
              <div className="stat bg-base-200 rounded-box p-3">
                <div className="stat-title text-xs">Completed Rides</div>
                <div className="stat-value text-2xl">{stats.dailyStats.completedRides}</div>
                <div className="stat-desc text-xs">{stats.dailyStats.onlineHours} hrs online</div>
              </div>
              
              <div className="stat bg-base-200 rounded-box p-3">
                <div className="stat-title text-xs">Acceptance Rate</div>
                <div className="stat-value text-2xl">{acceptanceRate}%</div>
                <div className="stat-desc text-xs">{stats.dailyStats.declinedRides} declined</div>
              </div>
              
              <div className="stat bg-base-200 rounded-box p-3">
                <div className="stat-title text-xs">Rating</div>
                <div className="stat-value text-2xl">{stats.dailyStats.rating}</div>
                <div className="stat-desc text-xs">★★★★★</div>
              </div>
            </div>
            
            <div className="divider">Peak Hour Performance</div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold mb-2">Peak Hour Rides</h3>
                <div className="flex items-center">
                  <div className="radial-progress text-primary mr-4" style={{ "--value": peakHourPercentage }}>
                    {peakHourPercentage}%
                  </div>
                  <div>
                    <p className="text-sm">{stats.dailyStats.peakHourRides} of {stats.dailyStats.completedRides} rides</p>
                    <p className="text-xs text-gray-500">Focus on peak hours for max earnings</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-bold mb-2">Stand Pickups</h3>
                <div className="flex items-center">
                  <div className="radial-progress text-secondary mr-4" style={{ "--value": standPickupPercentage }}>
                    {standPickupPercentage}%
                  </div>
                  <div>
                    <p className="text-sm">{stats.dailyStats.standPickups} of {stats.dailyStats.completedRides} rides</p>
                    <p className="text-xs text-gray-500">Using stands improves efficiency</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="alert alert-success mt-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>You earned 35 reward points today! Keep going!</span>
            </div>
          </div>
        )}
        
        {selectedPeriod === 'week' && (
          <div>
            <h3 className="font-bold mt-4 mb-2">Weekly Earnings</h3>
            
            <div className="h-48 flex items-end justify-between mt-2 px-2">
              {stats.weeklyEarnings.map((day, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div 
                    className={`w-8 bg-primary rounded-t ${
                      day.day === 'Thu' ? 'bg-secondary' : ''
                    }`} 
                    style={{ 
                      height: `${(day.amount / maxWeeklyEarning) * 100}%`,
                      minHeight: '10px'
                    }}
                  ></div>
                  <div className="text-xs mt-1">{day.day}</div>
                  <div className="text-xs text-gray-500">₹{day.amount}</div>
                </div>
              ))}
            </div>
            
            <div className="divider">Weekly Performance</div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-base-200 p-4 rounded-lg">
                <h3 className="font-bold text-sm">Earnings</h3>
                <div className="text-xl mt-1">₹{stats.comparison.earnings.current}</div>
                <div className="text-xs text-success">
                  ↑ {Math.round((stats.comparison.earnings.current - stats.comparison.earnings.previous) / stats.comparison.earnings.previous * 100)}%
                </div>
              </div>
              
              <div className="bg-base-200 p-4 rounded-lg">
                <h3 className="font-bold text-sm">Rides</h3>
                <div className="text-xl mt-1">{stats.comparison.rides.current}</div>
                <div className="text-xs text-success">
                  ↑ {Math.round((stats.comparison.rides.current - stats.comparison.rides.previous) / stats.comparison.rides.previous * 100)}%
                </div>
              </div>
              
              <div className="bg-base-200 p-4 rounded-lg">
                <h3 className="font-bold text-sm">Rating</h3>
                <div className="text-xl mt-1">{stats.comparison.rating.current}</div>
                <div className="text-xs text-success">
                  ↑ {((stats.comparison.rating.current - stats.comparison.rating.previous) * 10).toFixed(1)}
                </div>
              </div>
              
              <div className="bg-base-200 p-4 rounded-lg">
                <h3 className="font-bold text-sm">Acceptance</h3>
                <div className="text-xl mt-1">{stats.comparison.acceptance.current}%</div>
                <div className="text-xs text-success">
                  ↑ {stats.comparison.acceptance.current - stats.comparison.acceptance.previous}%
                </div>
              </div>
            </div>
          </div>
        )}
        
        {selectedPeriod === 'month' && (
          <div>
            <div className="alert alert-info mt-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span>Detailed monthly statistics are available in your account dashboard.</span>
            </div>
            
            <div className="stats shadow mt-6 w-full">
              <div className="stat">
                <div className="stat-figure text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                  </svg>
                </div>
                <div className="stat-title">Monthly Earnings</div>
                <div className="stat-value text-primary">₹32,500</div>
                <div className="stat-desc">↗︎ 22% higher than last month</div>
              </div>
              
              <div className="stat">
                <div className="stat-figure text-secondary">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                </div>
                <div className="stat-title">Total Rides</div>
                <div className="stat-value text-secondary">285</div>
                <div className="stat-desc">↗︎ 15% higher than last month</div>
              </div>
              
              <div className="stat">
                <div className="stat-figure text-secondary">
                  <div className="avatar">
                    <div className="w-16 rounded-full">
                      <img src="https://daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg" />
                    </div>
                  </div>
                </div>
                <div className="stat-title">Rewards Earned</div>
                <div className="stat-value">320</div>
                <div className="stat-desc text-secondary">points this month</div>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="font-bold mb-2">Monthly Highlights</h3>
              <ul className="list-disc list-inside">
                <li>You earned Gold tier status</li>
                <li>You completed 120 peak hour rides</li>
                <li>Your acceptance rate improved by 10%</li>
                <li>You earned 2 new badges</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}