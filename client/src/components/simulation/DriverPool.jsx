'use client'

import { useState, useEffect } from 'react'
import { mockHeatmapData } from '@/utils/mockData'

export default function DriverPool() {
  const [timeOfDay, setTimeOfDay] = useState('morning')
  const [totalDrivers, setTotalDrivers] = useState(100)
  const [activateIncentives, setActivateIncentives] = useState(true)
  const [activatePrediction, setActivatePrediction] = useState(true)
  const [activateStands, setActivateStands] = useState(true)
  
  const [driverDistribution, setDriverDistribution] = useState({
    whitefield: 25,
    koramangala: 15,
    indiranagar: 20,
    electronic_city: 10,
    marathahalli: 20,
    hsr_layout: 10
  })
  
  const [acceptanceRates, setAcceptanceRates] = useState({
    whitefield: 70,
    koramangala: 65,
    indiranagar: 75,
    electronic_city: 60,
    marathahalli: 72,
    hsr_layout: 80
  })
  
  const redistributeDrivers = () => {
    let baseDistribution = {
      whitefield: 0,
      koramangala: 0,
      indiranagar: 0,
      electronic_city: 0,
      marathahalli: 0,
      hsr_layout: 0
    }
    
    if (timeOfDay === 'morning') {
      baseDistribution = {
        whitefield: 15,
        koramangala: 10,
        indiranagar: 15,
        electronic_city: 35,
        marathahalli: 15,
        hsr_layout: 10
      }
    } else if (timeOfDay === 'afternoon') {
      baseDistribution = {
        whitefield: 25,
        koramangala: 15,
        indiranagar: 20,
        electronic_city: 10,
        marathahalli: 15,
        hsr_layout: 15
      }
    } else {
      baseDistribution = {
        whitefield: 30,
        koramangala: 20,
        indiranagar: 15,
        electronic_city: 5,
        marathahalli: 20,
        hsr_layout: 10
      }
    }
    
    if (activateIncentives) {
      const highDemandAreas = getHighDemandAreas()
      
      highDemandAreas.forEach(area => {
        baseDistribution[area] += 5
      })
      
      const total = Object.values(baseDistribution).reduce((sum, val) => sum + val, 0)
      Object.keys(baseDistribution).forEach(key => {
        baseDistribution[key] = Math.round(baseDistribution[key] / total * 100)
      })
    }
    
    if (activatePrediction) {
      Object.keys(baseDistribution).forEach(key => {
        const adjustment = Math.random() * 3 - 1
        baseDistribution[key] = Math.max(5, baseDistribution[key] + adjustment)
      })
      
      const total = Object.values(baseDistribution).reduce((sum, val) => sum + val, 0)
      Object.keys(baseDistribution).forEach(key => {
        baseDistribution[key] = Math.round(baseDistribution[key] / total * 100)
      })
    }
    
    setDriverDistribution(baseDistribution)
    updateAcceptanceRates()
  }
  
  const getHighDemandAreas = () => {
    if (timeOfDay === 'morning') {
      return ['electronic_city', 'whitefield', 'koramangala']
    } else if (timeOfDay === 'afternoon') {
      return ['whitefield', 'marathahalli', 'indiranagar']
    } else {
      return ['koramangala', 'marathahalli', 'hsr_layout']
    }
  }
  
  const updateAcceptanceRates = () => {
    let baseRates = {
      whitefield: 70,
      koramangala: 65,
      indiranagar: 75,
      electronic_city: 60,
      marathahalli: 72,
      hsr_layout: 80
    }
    
    if (activateIncentives) {
      Object.keys(baseRates).forEach(key => {
        baseRates[key] += 12
      })
    }
    
    if (activateStands) {
      Object.keys(baseRates).forEach(key => {
        baseRates[key] += 8
      })
    }
    
    Object.keys(baseRates).forEach(key => {
      baseRates[key] = Math.min(98, baseRates[key])
    })
    
    setAcceptanceRates(baseRates)
  }
  
  const calculateUtilization = () => {
    const avgAcceptance = Object.values(acceptanceRates).reduce((sum, val) => sum + val, 0) / 
                         Object.values(acceptanceRates).length
    
    let utilizationScore = avgAcceptance * 0.8
    
    if (activateIncentives) utilizationScore += 5
    if (activatePrediction) utilizationScore += 8
    if (activateStands) utilizationScore += 7
    
    return Math.min(98, Math.round(utilizationScore))
  }
  
  useEffect(() => {
    redistributeDrivers()
  }, [timeOfDay, activateIncentives, activatePrediction, activateStands])
  
  return (
    <div className="card bg-gray-800 text-white shadow-xl">
      <div className="card-body">
        <h2 className="card-title text-xl font-bold text-blue-400">Driver Pool Simulation</h2>
        <p className="text-sm text-gray-400">Optimize driver distribution across Bangalore</p>
        
        <div className="form-control">
          <label className="label">
            <span className="label-text text-white">Time of Day</span>
          </label>
          <select 
            className="select select-bordered w-full bg-gray-700 text-white" 
            value={timeOfDay}
            onChange={(e) => setTimeOfDay(e.target.value)}
          >
            <option value="morning">Morning (8-10 AM)</option>
            <option value="afternoon">Afternoon (1-3 PM)</option>
            <option value="evening">Evening (5-8 PM)</option>
          </select>
        </div>
        
        <div className="form-control">
          <label className="label">
            <span className="label-text text-white">Total Drivers</span>
          </label>
          <input 
            type="range" 
            min="50" 
            max="500" 
            value={totalDrivers} 
            onChange={(e) => setTotalDrivers(parseInt(e.target.value))}
            className="range range-primary"
          />
          <div className="text-center mt-1 text-white">{totalDrivers} drivers</div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text text-white">Smart Incentives</span> 
              <input 
                type="checkbox" 
                className="toggle toggle-primary" 
                checked={activateIncentives} 
                onChange={() => setActivateIncentives(!activateIncentives)}
              />
            </label>
          </div>
          
          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text text-white">Predictive Routing</span> 
              <input 
                type="checkbox" 
                className="toggle toggle-primary" 
                checked={activatePrediction} 
                onChange={() => setActivatePrediction(!activatePrediction)}
              />
            </label>
          </div>
          
          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text text-white">Optimized Pickup Stands</span> 
              <input 
                type="checkbox" 
                className="toggle toggle-primary" 
                checked={activateStands} 
                onChange={() => setActivateStands(!activateStands)}
              />
            </label>
          </div>
        </div>
        
        <div className="divider border-gray-700"></div>
        
        <h3 className="font-bold text-lg text-blue-400">Driver Distribution</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div>
            {Object.entries(driverDistribution).map(([area, percentage]) => (
              <div key={area} className="mb-3">
                <div className="flex justify-between mb-1">
                  <span className="capitalize text-white">{area.replace(/_/g, ' ')}</span>
                  <span className="text-gray-400">{percentage}%</span>
                </div>
                <progress 
                  className="progress progress-primary w-full" 
                  value={percentage} 
                  max="100"
                ></progress>
              </div>
            ))}
          </div>
          
          <div>
            <h4 className="font-bold mb-3 text-blue-400">Area Acceptance Rates</h4>
            {Object.entries(acceptanceRates).map(([area, rate]) => (
              <div key={area} className="mb-3">
                <div className="flex justify-between mb-1">
                  <span className="capitalize text-white">{area.replace(/_/g, ' ')}</span>
                  <span className="text-gray-400">{rate}%</span>
                </div>
                <progress 
                  className="progress progress-success w-full" 
                  value={rate} 
                  max="100"
                ></progress>
              </div>
            ))}
            
            <div className="stats bg-gray-700 text-white shadow mt-6 w-full">
              <div className="stat">
                <div className="stat-title text-gray-400">Driver Utilization</div>
                <div className="stat-value text-blue-400">{calculateUtilization()}%</div>
                <div className="stat-desc text-gray-500">
                  {calculateUtilization() > 85 ? 'Excellent' : 
                   calculateUtilization() > 75 ? 'Good' : 
                   calculateUtilization() > 65 ? 'Average' : 'Poor'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}