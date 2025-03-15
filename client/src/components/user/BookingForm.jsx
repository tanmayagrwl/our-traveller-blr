'use client'

import { useState, useEffect } from 'react'
import { mockPricingData, mockStandLocations, mockIcons } from '@/utils/mockData'

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
  
  const vehicleOptions = [
    { id: 'auto', name: 'Auto', icon: '🛺', baseTime: 0, priceMultiplier: 1 },
    { id: 'mini', name: 'Mini', icon: '🚗', baseTime: -2, priceMultiplier: 1.2 },
    { id: 'premium', name: 'Premium', icon: '🚙', baseTime: -4, priceMultiplier: 1.5 }
  ]
  
  useEffect(() => {
    if (destination && step > 1) {
      const baseFare = selectedVehicle === 'auto' ? mockPricingData.baseFare : 
                      selectedVehicle === 'mini' ? mockPricingData.baseFare * 1.6 : 
                      mockPricingData.baseFare * 2.4
      
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
        
        const nearestStand = mockStandLocations[0]
        setStandDistance(nearestStand.distance)
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
  
  return (
    <div className="card bg-gray-800 shadow-xl border border-gray-700 text-white">
      <div className="card-body">
        {step === 1 && (
          <>
            <h2 className="card-title font-bold text-white">Where to?</h2>
            <form onSubmit={handleSearch}>
              <div className="form-control mt-4">
                <div className="input-group">
                  <span className="bg-gray-700 px-4 flex items-center text-gray-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      {mockIcons.info}
                    </svg>
                  </span>
                  <input 
                    type="text" 
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                    className="input input-bordered bg-gray-700 border-gray-600 text-white w-full focus:border-emerald-500" 
                  />
                </div>
              </div>
              
              <div className="form-control mt-4">
                <div className="input-group">
                  <span className="bg-gray-700 px-4 flex items-center text-gray-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      {mockIcons.info}
                    </svg>
                  </span>
                  <input 
                    type="text" 
                    placeholder="Destination" 
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="input input-bordered bg-gray-700 border-gray-600 text-white w-full focus:border-emerald-500" 
                    required
                  />
                </div>
              </div>
              
              <div className="form-control mt-4">
                <label className="label cursor-pointer">
                  <span className="label-text text-white">Show pickup stands near me</span> 
                  <input 
                    type="checkbox" 
                    className="toggle toggle-success" 
                    checked={showStands} 
                    onChange={() => setShowStands(!showStands)} 
                  />
                </label>
                <label className="label text-xs text-gray-400">
                  <span>Using stands reduces wait time and fare during peak hours</span>
                </label>
              </div>
              
              {isPeakHour && (
                <div className="alert alert-warning bg-amber-900/50 text-amber-100 mt-4 text-sm border border-amber-700">
                  <svg xmlns="http://www.w3.org/2000/svg" className="stroke-amber-400 shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                    {mockIcons.warning}
                  </svg>
                  <span>Peak hour surge pricing is currently in effect. Consider using a stand for regular pricing.</span>
                </div>
              )}
              
              <button type="submit" className="btn btn-primary bg-emerald-500 border-none hover:bg-emerald-600 w-full mt-4 font-bold">
                Search
              </button>
            </form>
          </>
        )}
        
        {step === 2 && (
          <>
            <h2 className="card-title text-white font-bold">Choose a ride</h2>
            
            <div className="flex flex-col gap-4 mt-4">
              {vehicleOptions.map(vehicle => (
                <div 
                  key={vehicle.id}
                  className={`card ${selectedVehicle === vehicle.id ? 'bg-emerald-900 border border-emerald-700' : 'bg-gray-700 border border-gray-600'} cursor-pointer transition-all duration-300`}
                  onClick={() => setSelectedVehicle(vehicle.id)}
                >
                  <div className="card-body p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{vehicle.icon}</span>
                        <div>
                          <p className="font-bold text-white">{vehicle.name}</p>
                          <p className="text-xs text-gray-300">
                            {estimatedTime + (vehicle.baseTime)} min
                            {vehicle.baseTime !== 0 && vehicle.baseTime < 0 && ` (${vehicle.baseTime} min faster)`}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="font-bold text-white">₹{Math.round(estimatedFare * vehicle.priceMultiplier)}</p>
                        {isPeakHour && !showStands && (
                          <p className="text-xs text-red-300">Surge pricing applied</p>
                        )}
                        {showStands && (
                          <p className="text-xs text-emerald-300">Stand discount: {standDiscount}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="form-control mt-4">
              <label className="label text-sm font-bold text-white">
                Payment Method
              </label>
              <div className="flex gap-2">
                <label className="label cursor-pointer justify-start gap-2">
                  <input 
                    type="radio" 
                    name="payment" 
                    className="radio radio-success" 
                    checked={paymentMethod === 'cash'}
                    onChange={() => setPaymentMethod('cash')}
                  />
                  <span className="label-text text-white">Cash</span> 
                </label>
                <label className="label cursor-pointer justify-start gap-2">
                  <input 
                    type="radio" 
                    name="payment" 
                    className="radio radio-success" 
                    checked={paymentMethod === 'wallet'}
                    onChange={() => setPaymentMethod('wallet')}
                  />
                  <span className="label-text text-white">Wallet</span> 
                </label>
                <label className="label cursor-pointer justify-start gap-2">
                  <input 
                    type="radio" 
                    name="payment" 
                    className="radio radio-success" 
                    checked={paymentMethod === 'card'}
                    onChange={() => setPaymentMethod('card')}
                  />
                  <span className="label-text text-white">Card</span> 
                </label>
              </div>
            </div>
            
            {showStands && (
              <div className="alert bg-emerald-900/50 text-emerald-100 mt-4 text-sm border border-emerald-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-emerald-400 shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  {mockIcons.check}
                </svg>
                <span>
                  Nearest pickup stand is {standDistance} away. Using a stand saves you ₹{Math.round(standardFare * mockPricingData.surgeMultiplier - estimatedFare)} during peak hours!
                </span>
              </div>
            )}
            
            <div className="mt-4">
              <button 
                className="btn bg-emerald-500 hover:bg-emerald-600 text-white border-none w-full font-bold"
                onClick={handleConfirm}
              >
                Confirm {selectedVehicle.charAt(0).toUpperCase() + selectedVehicle.slice(1)}
              </button>
              <button 
                className="btn btn-ghost hover:bg-gray-700 w-full mt-2 text-gray-300"
                onClick={() => setStep(1)}
              >
                Back
              </button>
            </div>
          </>
        )}
      
        {step === 3 && (
          <div className="text-center">
            <h2 className="card-title font-bold text-white">Ride Requested!</h2>
            <p className="text-gray-300 mt-4">Your {selectedVehicle} will arrive in {estimatedTime} minutes</p>
            <p className="text-gray-300">Estimated fare is ₹{estimatedFare}</p>
            <button 
              className="btn bg-emerald-500 hover:bg-emerald-600 text-white border-none w-full mt-4 font-bold"
              onClick={() => setStep(1)}
            >
              Book Another Ride
            </button>
          </div>
        )}
      </div>
    </div>
  )
}