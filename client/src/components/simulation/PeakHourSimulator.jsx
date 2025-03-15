'use client'

import { useState, useEffect } from 'react'
import { mockHeatmapData } from '@/utils/mockData'

export default function PeakHourSimulator() {
  const [timeOfDay, setTimeOfDay] = useState('morning')
  const [demandLevel, setDemandLevel] = useState(75)
  const [totalDrivers, setTotalDrivers] = useState(100)
  const [availableDrivers, setAvailableDrivers] = useState(85)
  const [rideAcceptanceRate, setRideAcceptanceRate] = useState(70)
  const [averageWaitTime, setAverageWaitTime] = useState(8)
  const [standUtilization, setStandUtilization] = useState(30)
  const [isSimulating, setIsSimulating] = useState(false)
  const [useIncentives, setUseIncentives] = useState(true)
  const [usePredictiveRouting, setUsePredictiveRouting] = useState(true)
  const [useStands, setUseStands] = useState(true)
  
  const startSimulation = () => {
    setIsSimulating(true)
    
    let initialDemand = timeOfDay === 'morning' ? 75 : timeOfDay === 'afternoon' ? 60 : 85
    setDemandLevel(initialDemand)
    
    let initialDrivers = timeOfDay === 'morning' ? 85 : timeOfDay === 'afternoon' ? 90 : 80
    setAvailableDrivers(initialDrivers)
    
    let initialAcceptance = 70
    setRideAcceptanceRate(initialAcceptance)
    
    let initialWaitTime = timeOfDay === 'morning' ? 8 : timeOfDay === 'afternoon' ? 5 : 10
    setAverageWaitTime(initialWaitTime)
    
    let initialStandUse = 30
    setStandUtilization(initialStandUse)
    
    const interval = setInterval(() => {
      setDemandLevel(prev => {
        const baseChange = Math.random() * 6 - 3
        return Math.min(100, Math.max(40, prev + baseChange))
      })
      
      setAvailableDrivers(prev => {
        let change = Math.random() * 4 - 2
        
        if (useIncentives) {
          change += 5
        }
        
        if (usePredictiveRouting) {
          change += 3
        }
        
        return Math.min(totalDrivers, Math.max(totalDrivers * 0.5, prev + change))
      })
      
      setRideAcceptanceRate(prev => {
        let change = Math.random() * 4 - 1
        
        if (useIncentives) {
          change += 8
        }
        
        if (useStands) {
          change += 5
        }
        
        return Math.min(98, Math.max(50, prev + change))
      })
      
      setAverageWaitTime(prev => {
        let change = Math.random() * 2 - 1
        
        const demandSupplyRatio = demandLevel / (availableDrivers / totalDrivers * 100)
        
        change += (demandSupplyRatio - 1) * 2
        
        if (usePredictiveRouting) {
          change -= 3
        }
        
        if (useStands) {
          change -= 2
        }
        
        return Math.max(1, prev + change)
      })
      
      setStandUtilization(prev => {
        let change = Math.random() * 4 - 2
        
        if (useStands) {
          change += 15
        }
        
        if (useIncentives) {
          change += 5
        }
        
        return Math.min(90, Math.max(10, prev + change))
      })
    }, 2000)
    
    setTimeout(() => {
      clearInterval(interval)
      setIsSimulating(false)
    }, 20000)
    
    return () => clearInterval(interval)
  }
  
  const calculateImprovementScore = () => {
    let baseScore = 50
    
    baseScore += (rideAcceptanceRate - 70) * 0.5
    
    baseScore += (8 - averageWaitTime) * 3
    
    const supplyDemandRatio = (availableDrivers / totalDrivers * 100) / demandLevel
    baseScore += (supplyDemandRatio - 1) * 10
    
    baseScore += (standUtilization - 30) * 0.3
    
    return Math.round(Math.max(0, Math.min(100, baseScore)))
  }
  
  return (
    <div className="card bg-gray-800 text-white shadow-xl">
      <div className="card-body">
        <h2 className="card-title text-xl font-bold text-blue-400">Peak Hour Simulator</h2>
        <p className="text-sm text-gray-400">Simulate strategies for Bangalore's ride demand balance</p>
        
        <div className="form-control">
          <label className="label">
            <span className="label-text text-white">Time of Day</span>
          </label>
          <select 
            className="select select-bordered w-full bg-gray-700 text-white" 
            value={timeOfDay}
            onChange={(e) => setTimeOfDay(e.target.value)}
            disabled={isSimulating}
          >
            <option value="morning">Koramangala Morning Peak (8-10 AM)</option>
            <option value="afternoon">Indiranagar Afternoon (1-3 PM)</option>
            <option value="evening">Electronic City Evening Peak (5-8 PM)</option>
          </select>
        </div>
        
        <div className="form-control">
          <label className="label">
            <span className="label-text text-white">Total Drivers</span>
          </label>
          <input 
            type="range" 
            min="50" 
            max="200" 
            value={totalDrivers} 
            onChange={(e) => setTotalDrivers(parseInt(e.target.value))}
            className="range range-primary"
            disabled={isSimulating}
          />
          <div className="text-center mt-1 text-white">{totalDrivers}</div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text text-white">Smart Incentives</span> 
              <input 
                type="checkbox" 
                className="toggle toggle-primary" 
                checked={useIncentives} 
                onChange={() => setUseIncentives(!useIncentives)}
                disabled={isSimulating}
              />
            </label>
          </div>
          
          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text text-white">Predictive Routing</span> 
              <input 
                type="checkbox" 
                className="toggle toggle-primary" 
                checked={usePredictiveRouting} 
                onChange={() => setUsePredictiveRouting(!usePredictiveRouting)}
                disabled={isSimulating}
              />
            </label>
          </div>
          
          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text text-white">Optimized Pickup Stands</span> 
              <input 
                type="checkbox" 
                className="toggle toggle-primary" 
                checked={useStands} 
                onChange={() => setUseStands(!useStands)}
                disabled={isSimulating}
              />
            </label>
          </div>
        </div>
        
        <button 
          className={`btn btn-primary mt-6 ${isSimulating ? 'loading' : ''}`}
          onClick={startSimulation}
          disabled={isSimulating}
        >
          {isSimulating ? 'Simulating...' : 'Run Simulation'}
        </button>
        
        <div className="divider border-gray-700"></div>
        
        <h3 className="font-bold text-lg text-blue-400">Simulation Results</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div>
            <div className="mb-4">
              <span className="font-bold text-white">Demand Level:</span>
              <progress 
                className="progress progress-primary w-full mt-1" 
                value={demandLevel} 
                max="100"
              ></progress>
              <div className="flex justify-between text-xs text-gray-400">
                <span>Low</span>
                <span>{demandLevel}%</span>
                <span>High</span>
              </div>
            </div>
            
            <div className="mb-4">
              <span className="font-bold text-white">Available Drivers:</span>
              <progress 
                className="progress progress-primary w-full mt-1" 
                value={availableDrivers} 
                max={totalDrivers}
              ></progress>
              <div className="flex justify-between text-xs text-gray-400">
                <span>0</span>
                <span>{Math.round(availableDrivers)} / {totalDrivers}</span>
                <span>{totalDrivers}</span>
              </div>
            </div>
            
            <div className="mb-4">
              <span className="font-bold text-white">Pickup Stand Utilization:</span>
              <progress 
                className="progress progress-primary w-full mt-1" 
                value={standUtilization} 
                max="100"
              ></progress>
              <div className="flex justify-between text-xs text-gray-400">
                <span>Low</span>
                <span>{Math.round(standUtilization)}%</span>
                <span>High</span>
              </div>
            </div>
          </div>
          
          <div>
            <div className="mb-4">
              <span className="font-bold text-white">Ride Acceptance Rate:</span>
              <progress 
                className="progress progress-success w-full mt-1" 
                value={rideAcceptanceRate} 
                max="100"
              ></progress>
              <div className="flex justify-between text-xs text-gray-400">
                <span>0%</span>
                <span>{Math.round(rideAcceptanceRate)}%</span>
                <span>100%</span>
              </div>
            </div>
            
            <div className="mb-4">
              <span className="font-bold text-white">Average Wait Time:</span>
              <progress 
                className="progress progress-error w-full mt-1" 
                value={15 - averageWaitTime} 
                max="15"
              ></progress>
              <div className="flex justify-between text-xs text-gray-400">
                <span>15 min</span>
                <span>{Math.round(averageWaitTime * 10) / 10} min</span>
                <span>0 min</span>
              </div>
            </div>
            
            <div className="stats bg-gray-700 shadow w-full">
              <div className="stat">
                <div className="stat-title text-gray-400">Overall Improvement</div>
                <div className="stat-value text-blue-400">{calculateImprovementScore()}%</div>
                <div className="stat-desc text-gray-500">
                  {calculateImprovementScore() > 80 ? 'Excellent Results!' : 
                   calculateImprovementScore() > 60 ? 'Good Progress' :
                   calculateImprovementScore() > 40 ? 'Moderate Improvement' : 'Needs Optimization'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}