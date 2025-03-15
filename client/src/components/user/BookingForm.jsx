'use client'

import { useState, useEffect } from 'react'
import { mockPricingData, mockStandLocations } from '@/utils/mockData'

export default function BookingForm({ 
  onSearch = () => {}, 
  onConfirm = () => {},
  isPeakHour = true
}) {
  const [pickupLocation, setPickupLocation] = useState('Current Location')
  const [destination, setDestination] = useState('')
  const [selectedVehicle, setSelectedVehicle] = useState('auto')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [showStands, setShowStands] = useState(false)
  const [standDistance, setStandDistance] = useState('')
  const [standDiscount, setStandDiscount] = useState('')
  const [estimatedFare, setEstimatedFare] = useState(0)
  const [standardFare, setStandardFare] = useState(0)
  const [estimatedTime, setEstimatedTime] = useState(0)
  const [estimatedDistance, setEstimatedDistance] = useState(0)
  const [step, setStep] = useState(1) 
  
  
  useEffect(() => {
    if (destination && step > 1) {
      
      const baseFare = selectedVehicle === 'auto' ? 50 : 
                      selectedVehicle === 'mini' ? 80 : 120
      
      
      const distance = Math.floor(Math.random() * 8) + 3
      setEstimatedDistance(distance)
      
      
      const time = Math.floor(distance * 2.5) + Math.floor(Math.random() * 5)
      setEstimatedTime(time)
      
      
      const calculatedFare = baseFare + (distance * mockPricingData.perKm)
      setStandardFare(calculatedFare)
      
      
      let finalFare = calculatedFare
      if (isPeakHour) {
        finalFare = calculatedFare * mockPricingData.surgeMultiplier
      }
      
      
      if (showStands) {
        finalFare = finalFare * (1 - mockPricingData.standDiscount)
        
        setStandDistance('0.3 km')
        setStandDiscount(`${mockPricingData.standDiscount * 100}%`)
      }
      
      setEstimatedFare(Math.round(finalFare))
    }
  }, [destination, selectedVehicle, showStands, step, isPeakHour])
  
  const handleSearch = (e) => {
    e.preventDefault()
    if (destination) {
      setStep(2)
      onSearch({
        pickupLocation,
        destination
      })
    }
  }
  
  const handleConfirm = () => {
    setStep(3)
    onConfirm({
      pickupLocation,
      destination,
      vehicleType: selectedVehicle,
      paymentMethod,
      fareAmount: estimatedFare,
      estimatedTime,
      useStand: showStands
    })
  }
  
  const vehicleOptions = [
    { id: 'auto', name: 'Auto', icon: '🛺', baseTime: 0, priceMultiplier: 1 },
    { id: 'mini', name: 'Mini', icon: '🚗', baseTime: -2, priceMultiplier: 1.2 },
    { id: 'premium', name: 'Premium', icon: '🚙', baseTime: -4, priceMultiplier: 1.5 }
  ]
  
  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        {step === 1 && (
          <>
            <h2 className="card-title">Where to?</h2>
            <form onSubmit={handleSearch}>
              <div className="form-control mt-4">
                <div className="input-group">
                  <span className="bg-base-300 px-4 flex items-center">
                    <svg xmlns="http:
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </span>
                  <input 
                    type="text" 
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                    className="input input-bordered w-full" 
                  />
                </div>
              </div>
              
              <div className="form-control mt-4">
                <div className="input-group">
                  <span className="bg-base-300 px-4 flex items-center">
                    <svg xmlns="http:
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </span>
                  <input 
                    type="text" 
                    placeholder="Destination" 
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="input input-bordered w-full" 
                    required
                  />
                </div>
              </div>
              
              <div className="form-control mt-4">
                <label className="label cursor-pointer">
                  <span className="label-text">Show pickup stands near me</span> 
                  <input 
                    type="checkbox" 
                    className="toggle toggle-primary" 
                    checked={showStands} 
                    onChange={() => setShowStands(!showStands)} 
                  />
                </label>
                <label className="label text-xs text-gray-500">
                  <span>Using stands reduces wait time and fare during peak hours</span>
                </label>
              </div>
              
              {isPeakHour && (
                <div className="alert alert-warning mt-4 text-sm">
                  <svg xmlns="http:
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>Peak hour surge pricing is currently in effect. Consider using a stand for regular pricing.</span>
                </div>
              )}
              
              <button type="submit" className="btn btn-primary w-full mt-4">
                Search
              </button>
            </form>
          </>
        )}
        
        {step === 2 && (
          <>
            <h2 className="card-title">Choose a ride</h2>
            
            <div className="flex flex-col gap-4 mt-4">
              {vehicleOptions.map(vehicle => (
                <div 
                  key={vehicle.id}
                  className={`card ${selectedVehicle === vehicle.id ? 'bg-primary text-primary-content' : 'bg-base-200'} cursor-pointer`}
                  onClick={() => setSelectedVehicle(vehicle.id)}
                >
                  <div className="card-body p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{vehicle.icon}</span>
                        <div>
                          <p className="font-bold">{vehicle.name}</p>
                          <p className="text-xs">
                            {estimatedTime + (vehicle.baseTime)} min
                            {vehicle.baseTime !== 0 && vehicle.baseTime < 0 && ` (${vehicle.baseTime} min faster)`}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="font-bold">₹{Math.round(estimatedFare * vehicle.priceMultiplier)}</p>
                        {isPeakHour && !showStands && (
                          <p className="text-xs">Surge pricing applied</p>
                        )}
                        {showStands && (
                          <p className="text-xs text-success">Stand discount: {standDiscount}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="form-control mt-4">
              <label className="label text-sm font-bold">
                Payment Method
              </label>
              <div className="flex gap-2">
                <label className="label cursor-pointer justify-start gap-2">
                  <input 
                    type="radio" 
                    name="payment" 
                    className="radio radio-primary" 
                    checked={paymentMethod === 'cash'}
                    onChange={() => setPaymentMethod('cash')}
                  />
                  <span className="label-text">Cash</span> 
                </label>
                <label className="label cursor-pointer justify-start gap-2">
                  <input 
                    type="radio" 
                    name="payment" 
                    className="radio radio-primary" 
                    checked={paymentMethod === 'wallet'}
                    onChange={() => setPaymentMethod('wallet')}
                  />
                  <span className="label-text">Wallet</span> 
                </label>
                <label className="label cursor-pointer justify-start gap-2">
                  <input 
                    type="radio" 
                    name="payment" 
                    className="radio radio-primary" 
                    checked={paymentMethod === 'card'}
                    onChange={() => setPaymentMethod('card')}
                  />
                  <span className="label-text">Card</span> 
                </label>
              </div>
            </div>
            
            {showStands && (
              <div className="alert alert-success mt-4 text-sm">
                <svg xmlns="http:
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>
                  Nearest pickup stand is {standDistance} away. Using a stand saves you ₹{Math.round(standardFare * mockPricingData.surgeMultiplier - estimatedFare)} during peak hours!
                </span>
              </div>
            )}
            
            <div className="mt-4">
              <button 
                className="btn btn-primary w-full"
                onClick={handleConfirm}
              >
                Confirm {selectedVehicle.charAt(0).toUpperCase() + selectedVehicle.slice(1)}
              </button>
              <button 
                className="btn btn-ghost w-full mt-2"
                onClick={() => setStep(1)}
              >
                Back
              </button>
            </div>
          </>
        )}
        
        {step === 3 && (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
            <h3 className="font-bold text-lg mt-4">Finding your ride...</h3>
            <p className="text-sm text-gray-500 mt-2">This may take a moment</p>
            <p className="text-xs text-gray-400 mt-4">Matching with nearby drivers</p>
          </div>
        )}
      </div>
    </div>
  )
}