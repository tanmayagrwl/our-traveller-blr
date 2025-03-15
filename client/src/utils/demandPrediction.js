import { mockHeatmapData } from './mockData'


const getCurrentTimePeriod = () => {
  const hour = new Date().getHours()
  
  if (hour >= 7 && hour <= 10) {
    return 'morning'
  } else if (hour >= 12 && hour <= 15) {
    return 'afternoon'
  } else if (hour >= 16 && hour <= 20) {
    return 'evening'
  } else {
    return 'other'
  }
}


export const isPeakHour = () => {
  const period = getCurrentTimePeriod()
  return period === 'morning' || period === 'evening'
}


export const getCurrentDemandLevel = () => {
  const period = getCurrentTimePeriod()
  
  switch (period) {
    case 'morning':
      return 85
    case 'afternoon':
      return 60
    case 'evening':
      return 90
    default:
      return 40
  }
}


export const getSurgeMultiplier = (demandLevel = null) => {
  const demand = demandLevel || getCurrentDemandLevel()
  
  if (demand >= 85) {
    return 1.8 
  } else if (demand >= 70) {
    return 1.5 
  } else if (demand >= 60) {
    return 1.2 
  } else {
    return 1.0 
  }
}


export const getCurrentHeatmapData = () => {
  const period = getCurrentTimePeriod()
  
  if (period === 'morning' || period === 'afternoon' || period === 'evening') {
    return mockHeatmapData[period]
  } else {
    
    return mockHeatmapData.morning.map(point => ({
      ...point,
      intensity: point.intensity * 0.5
    }))
  }
}


export const predictDemandTrend = (hours = 3) => {
  const currentPeriod = getCurrentTimePeriod()
  const currentDemand = getCurrentDemandLevel()
  
  const trends = []
  let prevDemand = currentDemand
  
  for (let i = 1; i <= hours; i++) {
    let trend = null
    
    
    if (currentPeriod === 'morning') {
      
      trend = prevDemand * (1 - 0.1 * i)
    } else if (currentPeriod === 'afternoon') {
      
      trend = prevDemand * (1 + 0.15 * i)
    } else if (currentPeriod === 'evening') {
      
      trend = prevDemand * (1 - 0.2 * i)
    } else {
      
      trend = prevDemand + (Math.random() * 10 - 5)
    }
    
    
    trend = Math.max(30, Math.min(95, trend))
    
    trends.push({
      hour: i,
      demandLevel: Math.round(trend),
      surge: getSurgeMultiplier(trend)
    })
    
    prevDemand = trend
  }
  
  return trends
}


export const predictHighDemandAreas = () => {
  const period = getCurrentTimePeriod()
  
  if (period === 'morning') {
    return [
      { name: 'IT Parks', probability: 0.9 },
      { name: 'Central Business District', probability: 0.8 },
      { name: 'Railway Stations', probability: 0.7 }
    ]
  } else if (period === 'afternoon') {
    return [
      { name: 'Shopping Areas', probability: 0.8 },
      { name: 'Office Complexes', probability: 0.6 },
      { name: 'Universities', probability: 0.7 }
    ]
  } else if (period === 'evening') {
    return [
      { name: 'IT Parks', probability: 0.9 },
      { name: 'Residential Areas', probability: 0.8 },
      { name: 'Entertainment Districts', probability: 0.7 }
    ]
  } else {
    return [
      { name: 'Entertainment Districts', probability: 0.7 },
      { name: 'Residential Areas', probability: 0.5 },
      { name: 'Airport', probability: 0.6 }
    ]
  }
}


export const calculateOptimalDriverAllocation = (totalDrivers, heatmapData) => {
  if (!heatmapData || heatmapData.length === 0) {
    heatmapData = getCurrentHeatmapData()
  }
  
  
  const areas = {
    central: { points: [], totalIntensity: 0 },
    north: { points: [], totalIntensity: 0 },
    south: { points: [], totalIntensity: 0 },
    east: { points: [], totalIntensity: 0 },
    west: { points: [], totalIntensity: 0 },
    itCorridor: { points: [], totalIntensity: 0 }
  }
  
  
  heatmapData.forEach(point => {
    let area = 'central'
    
    
    if (point.lat > 13.1) {
      area = 'north'
    } else if (point.lat < 13.0 && point.lng > 80.25) {
      area = 'itCorridor'
    } else if (point.lat < 13.0) {
      area = 'south'
    } else if (point.lng < 80.25) {
      area = 'west'
    } else if (point.lng > 80.28) {
      area = 'east'
    }
    
    areas[area].points.push(point)
    areas[area].totalIntensity += point.intensity
  })
  
  
  const totalIntensity = Object.values(areas).reduce(
    (sum, area) => sum + area.totalIntensity, 
    0
  )
  
  
  const allocation = {}
  let remainingDrivers = totalDrivers
  
  Object.entries(areas).forEach(([areaName, area]) => {
    if (totalIntensity > 0) {
      const proportion = area.totalIntensity / totalIntensity
      
      const drivers = Math.round(totalDrivers * proportion)
      allocation[areaName] = drivers
      remainingDrivers -= drivers
    } else {
      allocation[areaName] = 0
    }
  })
  
  
  if (remainingDrivers > 0) {
    
    allocation.central += remainingDrivers
  } else if (remainingDrivers < 0) {
    
    const sortedAreas = Object.entries(allocation)
      .sort(([, a], [, b]) => b - a)
    
    let remaining = -remainingDrivers
    let index = 0
    
    while (remaining > 0 && index < sortedAreas.length) {
      const [areaName] = sortedAreas[index]
      if (allocation[areaName] > 0) {
        allocation[areaName] -= 1
        remaining -= 1
      }
      index = (index + 1) % sortedAreas.length
    }
  }
  
  return allocation
}


export const predictWaitTimes = (driverAllocation) => {
  
  const baseWaitTimes = {
    central: 5,
    north: 7,
    south: 6,
    east: 8,
    west: 7,
    itCorridor: 4
  }
  
  
  const demandLevels = {
    central: 80,
    north: 65,
    south: 75,
    east: 60,
    west: 70,
    itCorridor: 90
  }
  
  
  const waitTimes = {}
  
  Object.keys(baseWaitTimes).forEach(area => {
    
    const demand = demandLevels[area]
    const drivers = driverAllocation?.[area] || 0
    
    
    const ratio = drivers > 0 ? demand / drivers : demand
    
    
    let waitTime = baseWaitTimes[area]
    
    if (ratio > 10) {
      waitTime *= 2 
    } else if (ratio > 5) {
      waitTime *= 1.5 
    } else if (ratio < 2) {
      waitTime *= 0.7 
    }
    
    
    waitTimes[area] = Math.round(waitTime)
  })
  
  return waitTimes
}