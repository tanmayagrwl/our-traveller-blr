import { isPeakHour, getCurrentDemandLevel, getSurgeMultiplier } from './demandPrediction'


const TIER_MULTIPLIERS = {
  Bronze: 1.0,
  Silver: 1.1,
  Gold: 1.2,
  Platinum: 1.3,
  Diamond: 1.5
}


const POINT_BASE_RATES = {
  Bronze: 1,
  Silver: 2,
  Gold: 3,
  Platinum: 4,
  Diamond: 5
}


export const calculateBaseIncentive = (fare, distance, isPeakHour = false) => {
  
  let basePercentage = 0.05 
  
  
  if (isPeakHour) {
    basePercentage += 0.1 
  }
  
  
  if (distance > 10) {
    basePercentage += 0.05 
  }
  
  return Math.round(fare * basePercentage)
}


export const calculatePointsEarned = (
  fare, 
  distance, 
  driverTier = 'Bronze', 
  isPeakHourRide = false,
  isStandPickup = false
) => {
  
  const basePoints = Math.floor(fare / 50) 
  
  
  const tierMultiplier = TIER_MULTIPLIERS[driverTier] || 1.0
  
  
  let bonusMultiplier = 1.0
  
  if (isPeakHourRide) {
    bonusMultiplier += 0.5 
  }
  
  if (isStandPickup) {
    bonusMultiplier += 0.3 
  }
  
  
  if (distance > 10) {
    bonusMultiplier += 0.2 
  }
  
  
  const totalPoints = Math.round(basePoints * tierMultiplier * bonusMultiplier)
  
  
  return Math.max(1, totalPoints)
}


export const calculateStandBonus = (fare, driverTier = 'Bronze') => {
  
  let bonusPercentage = 0.05 
  
  
  if (driverTier === 'Silver') bonusPercentage = 0.06
  if (driverTier === 'Gold') bonusPercentage = 0.07
  if (driverTier === 'Platinum') bonusPercentage = 0.08
  if (driverTier === 'Diamond') bonusPercentage = 0.1
  
  return Math.round(fare * bonusPercentage)
}


export const calculateRatingBonus = (fare, rating, driverTier = 'Bronze') => {
  if (rating < 4.7) return 0
  
  let bonusPercentage = 0
  
  if (rating >= 4.9) {
    bonusPercentage = 0.05 
  } else if (rating >= 4.8) {
    bonusPercentage = 0.03 
  } else if (rating >= 4.7) {
    bonusPercentage = 0.01 
  }
  
  
  const tierMultiplier = TIER_MULTIPLIERS[driverTier] || 1.0
  
  return Math.round(fare * bonusPercentage * tierMultiplier)
}


export const calculateStreakBonus = (streakCount, baseAmount = 20) => {
  if (streakCount < 3) return 0
  
  
  if (streakCount >= 10) {
    return baseAmount * 5
  } else if (streakCount >= 7) {
    return baseAmount * 3
  } else if (streakCount >= 5) {
    return baseAmount * 2
  } else if (streakCount >= 3) {
    return baseAmount
  }
  
  return 0
}


export const calculateAreaBonus = (area, currentDemand = null) => {
  const demand = currentDemand || getCurrentDemandLevel()
  
  
  const highDemandAreas = {
    'IT Corridor': { morning: 0.1, evening: 0.1, other: 0.05 },
    'Central Business District': { morning: 0.08, evening: 0.08, other: 0.04 },
    'Airport': { morning: 0.05, evening: 0.1, other: 0.07 },
    'Railway Station': { morning: 0.08, evening: 0.08, other: 0.04 }
  }
  
  if (!highDemandAreas[area]) return 0
  
  const timePeriod = isPeakHour() ? 
    (new Date().getHours() < 12 ? 'morning' : 'evening') : 
    'other'
  
  return highDemandAreas[area][timePeriod] || 0
}


export const checkChallengeQualification = (challenge, driverStats) => {
  switch(challenge.type) {
    case 'rides':
      return driverStats.completedRides >= challenge.threshold
    case 'earnings':
      return driverStats.earnings >= challenge.threshold
    case 'rating':
      return driverStats.rating >= challenge.threshold
    case 'acceptance':
      const acceptanceRate = 
        (driverStats.completedRides / 
         (driverStats.completedRides + driverStats.declinedRides)) * 100
      return acceptanceRate >= challenge.threshold
    case 'peak_rides':
      return driverStats.peakHourRides >= challenge.threshold
    case 'stands':
      return driverStats.standPickups >= challenge.threshold
    default:
      return false
  }
}


export const calculateTotalIncentives = (
  fare, 
  distance, 
  driverTier = 'Bronze',
  driverRating = 4.5,
  streakCount = 0,
  area = null,
  isPeakHourRide = null,
  isStandPickup = false
) => {
  
  const peakHour = isPeakHourRide !== null ? isPeakHourRide : isPeakHour()
  
  
  const baseIncentive = calculateBaseIncentive(fare, distance, peakHour)
  const standBonus = isStandPickup ? calculateStandBonus(fare, driverTier) : 0
  const ratingBonus = calculateRatingBonus(fare, driverRating, driverTier)
  const streakBonus = calculateStreakBonus(streakCount)
  
  
  let areaBonus = 0
  if (area) {
    const areaMultiplier = calculateAreaBonus(area)
    areaBonus = Math.round(fare * areaMultiplier)
  }
  
  
  const pointsEarned = calculatePointsEarned(
    fare, 
    distance, 
    driverTier, 
    peakHour,
    isStandPickup
  )
  
  
  const totalCash = baseIncentive + standBonus + ratingBonus + streakBonus + areaBonus
  
  return {
    baseIncentive,
    standBonus,
    ratingBonus,
    streakBonus,
    areaBonus,
    pointsEarned,
    totalCash
  }
}


export const suggestPersonalizedIncentives = (driverProfile, driverStats, areaName = null) => {
  const currentTime = new Date()
  const hour = currentTime.getHours()
  const suggestions = []
  
  
  if ((hour >= 7 && hour <= 10) || (hour >= 17 && hour <= 20)) {
    suggestions.push({
      type: 'peak',
      title: 'Peak Hour Bonus',
      description: `Complete rides during peak hours to earn ${driverProfile.tier === 'Bronze' ? '1.5x' : '2x'} points and higher fares!`,
      potentialEarnings: '₹100-200 extra per hour'
    })
  }
  
  
  const acceptanceRate = 
    (driverStats.completedRides / 
     (driverStats.completedRides + driverStats.declinedRides)) * 100
  
  if (acceptanceRate < 80) {
    suggestions.push({
      type: 'stands',
      title: 'Pickup Stand Bonus',
      description: 'Pick up passengers from designated stands to earn extra bonuses and improve your acceptance rate',
      potentialEarnings: `${calculateStandBonus(150, driverProfile.tier)}% bonus per ride`
    })
  }
  
  
  if (driverStats.currentStreak >= 2) {
    const nextStreakBonus = calculateStreakBonus(driverStats.currentStreak + 1)
    suggestions.push({
      type: 'streak',
      title: 'Continue Your Streak!',
      description: `You're on a ${driverStats.currentStreak}-ride streak. Complete 1 more ride to earn a streak bonus!`,
      potentialEarnings: `₹${nextStreakBonus} bonus`
    })
  }
  
  
  if (areaName) {
    const areaMultiplier = calculateAreaBonus(areaName)
    if (areaMultiplier > 0) {
      suggestions.push({
        type: 'area',
        title: `${areaName} Bonus Zone`,
        description: `Stay in ${areaName} to earn bonus incentives on every ride`,
        potentialEarnings: `${areaMultiplier * 100}% extra per ride`
      })
    }
  }
  
  
  if (driverProfile.tier !== 'Diamond') {
    const pointsNeeded = driverProfile.pointsToNextTier
    suggestions.push({
      type: 'tier',
      title: `Upgrade to ${driverProfile.nextTier} Tier`,
      description: `You need ${pointsNeeded} more points to reach ${driverProfile.nextTier} tier`,
      potentialEarnings: `${TIER_MULTIPLIERS[driverProfile.nextTier] * 100 - 100}% more points per ride`
    })
  }
  
  return suggestions
}