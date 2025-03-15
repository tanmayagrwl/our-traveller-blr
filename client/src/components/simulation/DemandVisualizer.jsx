'use client'

import { useState, useEffect, useRef } from 'react'
import { mockHeatmapData } from '@/utils/mockData'

export default function DemandVisualizer() {
  const [timeOfDay, setTimeOfDay] = useState('morning')
  const [demandData, setDemandData] = useState([])
  const [isAnimating, setIsAnimating] = useState(false)
  const [showProjections, setShowProjections] = useState(true)
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  
  useEffect(() => {
    const points = mockHeatmapData[timeOfDay].map(point => ({
      lat: point.lat,
      lng: point.lng,
      intensity: point.intensity,
      velocityX: (Math.random() * 2 - 1) * 0.0001,
      velocityY: (Math.random() * 2 - 1) * 0.0001
    }))
    
    const extraPoints = []
    for (let i = 0; i < 50; i++) {
      const basePoint = points[Math.floor(Math.random() * points.length)]
      extraPoints.push({
        lat: basePoint.lat + (Math.random() * 0.02 - 0.01),
        lng: basePoint.lng + (Math.random() * 0.02 - 0.01),
        intensity: basePoint.intensity * (0.5 + Math.random() * 0.5),
        velocityX: (Math.random() * 2 - 1) * 0.0001,
        velocityY: (Math.random() * 2 - 1) * 0.0001
      })
    }
    
    setDemandData([...points, ...extraPoints])
  }, [timeOfDay])
  
  useEffect(() => {
    if (!canvasRef.current || demandData.length === 0) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    canvas.width = canvas.clientWidth
    canvas.height = canvas.clientHeight
    
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    const minLat = Math.min(...demandData.map(p => p.lat))
    const maxLat = Math.max(...demandData.map(p => p.lat))
    const minLng = Math.min(...demandData.map(p => p.lng))
    const maxLng = Math.max(...demandData.map(p => p.lng))
    
    demandData.forEach(point => {
      const x = ((point.lng - minLng) / (maxLng - minLng)) * canvas.width
      const y = ((point.lat - minLat) / (maxLat - minLat)) * canvas.height
      
      ctx.beginPath()
      const radius = point.intensity * 15
      
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius)
      gradient.addColorStop(0, `rgba(255, 60, 0, ${point.intensity})`)
      gradient.addColorStop(1, 'rgba(255, 60, 0, 0)')
      
      ctx.fillStyle = gradient
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.fill()
      
      if (showProjections) {
        ctx.beginPath()
        ctx.strokeStyle = `rgba(255, 255, 255, ${point.intensity * 0.5})`
        ctx.lineWidth = 1
        ctx.moveTo(x, y)
        
        const projectionX = x + point.velocityX * 50000
        const projectionY = y + point.velocityY * 50000
        
        ctx.lineTo(projectionX, projectionY)
        ctx.stroke()
      }
    })
    
    const areas = [
      { name: "Koramangala", x: canvas.width * 0.5, y: canvas.height * 0.45 },
      { name: "Electronic City", x: canvas.width * 0.7, y: canvas.height * 0.7 },
      { name: "Whitefield", x: canvas.width * 0.4, y: canvas.height * 0.2 },
      { name: "Indiranagar", x: canvas.width * 0.4, y: canvas.height * 0.5 },
      { name: "HSR Layout", x: canvas.width * 0.2, y: canvas.height * 0.8 },
      { name: "Marathahalli", x: canvas.width * 0.6, y: canvas.height * 0.6 }
    ]
    
    areas.forEach(area => {
      ctx.font = '12px Arial'
      ctx.fillStyle = 'white'
      ctx.textAlign = 'center'
      ctx.fillText(area.name, area.x, area.y)
    })
    
  }, [demandData, showProjections])
  
  const animate = () => {
    setDemandData(prev => prev.map(point => ({
      ...point,
      lat: point.lat + point.velocityY,
      lng: point.lng + point.velocityX
    })))
    
    animationRef.current = requestAnimationFrame(animate)
  }
  
  const toggleAnimation = () => {
    if (isAnimating) {
      cancelAnimationFrame(animationRef.current)
    } else {
      animationRef.current = requestAnimationFrame(animate)
    }
    setIsAnimating(!isAnimating)
  }
  
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])
  
  return (
    <div className="card bg-gray-800 text-white shadow-xl">
      <div className="card-body">
        <h2 className="card-title text-xl font-bold text-blue-400">Real-time Demand Visualization</h2>
        
        <div className="flex flex-wrap items-center justify-between mb-4">
          <div className="form-control">
            <select 
              className="select select-bordered bg-gray-700 text-white" 
              value={timeOfDay}
              onChange={(e) => setTimeOfDay(e.target.value)}
            >
              <option value="morning">Morning Peak (8-10 AM)</option>
              <option value="afternoon">Afternoon (1-3 PM)</option>
              <option value="evening">Evening Peak (5-8 PM)</option>
            </select>
          </div>
          
          <div className="flex gap-2">
            <button 
              className={`btn ${isAnimating ? 'btn-error' : 'btn-primary'}`}
              onClick={toggleAnimation}
            >
              {isAnimating ? 'Stop Animation' : 'Start Animation'}
            </button>
            
            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text text-white mr-2">Show Projections</span> 
                <input 
                  type="checkbox" 
                  className="toggle toggle-primary" 
                  checked={showProjections} 
                  onChange={() => setShowProjections(!showProjections)} 
                />
              </label>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-900 rounded-lg overflow-hidden" style={{ height: '400px' }}>
          <canvas 
            ref={canvasRef} 
            className="w-full h-full"
          ></canvas>
        </div>
        
        <div className="alert bg-gray-700 text-white mt-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>Visualization shows real-time demand patterns across Bangalore. Brighter areas indicate higher demand.</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="bg-gray-700 p-4 rounded-lg">
            <h3 className="font-bold text-blue-400">Morning Peak</h3>
            <p className="text-sm text-gray-300">High demand near Electronic City and Whitefield. Drivers should prioritize IT corridors.</p>
          </div>
          
          <div className="bg-gray-700 p-4 rounded-lg">
            <h3 className="font-bold text-blue-400">Afternoon</h3>
            <p className="text-sm text-gray-300">Moderate demand spread across Koramangala and Indiranagar. Focus on commercial areas.</p>
          </div>
          
          <div className="bg-gray-700 p-4 rounded-lg">
            <h3 className="font-bold text-blue-400">Evening Peak</h3>
            <p className="text-sm text-gray-300">High demand from office areas towards HSR Layout and Marathahalli. Position strategically.</p>
          </div>
        </div>
      </div>
    </div>
  )
}