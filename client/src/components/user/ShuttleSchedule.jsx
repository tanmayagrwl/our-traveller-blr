'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

export default function ShuttleSchedule({ routes = [] }) {
  const [selectedDay, setSelectedDay] = useState('weekday')
  const [selectedRoute, setSelectedRoute] = useState(null)

  const shuttleRoutes = routes.length > 0 ? routes : [
    {
      id: 1,
      name: "Indiranagar IT Express",
      from: "Majestic",
      to: "Electronic City",
      stops: ["Majestic", "Indiranagar", "Domlur", "Koramangala", "HSR Layout", "Electronic City"],
      schedule: { weekday: ["7:00 AM", "8:00 AM", "9:00 AM"], weekend: ["8:00 AM", "10:00 AM"] },
      fare: 40,
      regularFare: 150,
      status: "Running"
    },
    {
      id: 2,
      name: "Whitefield Tech Shuttle",
      from: "Silk Board",
      to: "Whitefield",
      stops: ["Silk Board", "BTM Layout", "Marathahalli", "ITPL", "Whitefield"],
      schedule: { weekday: ["6:00 AM", "8:00 AM", "10:00 AM"], weekend: ["6:00 AM", "9:00 AM"] },
      fare: 60,
      regularFare: 180,
      status: "Running"
    }
  ]

  return (
    <div className="bg-gray-950 text-white p-6 rounded-xl shadow-lg border border-gray-800">
      <div className="flex justify-between items-center mb-4">
        <div className="tabs tabs-boxed bg-gray-800 font-bold">
          <a 
            className={`tab ${selectedDay === 'weekday' ? 'tab-active bg-emerald-500 text-black' : 'text-white'}`}
            onClick={() => setSelectedDay('weekday')}
          >
            Weekdays
          </a>
          <a 
            className={`tab ${selectedDay === 'weekend' ? 'tab-active bg-emerald-500 text-black' : 'text-white'}`}
            onClick={() => setSelectedDay('weekend')}
          >
            Weekends
          </a>
        </div>

        <select 
          className="select select-bordered bg-gray-800 border-emerald-500 text-white"
          onChange={(e) => setSelectedRoute(e.target.value ? parseInt(e.target.value) : null)}
          defaultValue=""
        >
          <option value="">All Routes</option>
          {shuttleRoutes.map(route => (
            <option key={route.id} value={route.id}>{route.name}</option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="table w-full text-left text-sm">
          <thead>
            <tr className="text-emerald-500 uppercase text-xs">
              <th>Route</th>
              <th>Stops</th>
              <th>Timings</th>
              <th>Fare</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {shuttleRoutes
              .filter(route => selectedRoute ? route.id === selectedRoute : true)
              .map(route => (
                <tr key={route.id} className="hover:bg-gray-800">
                  <td className="font-bold">{route.name}</td>
                  <td>{route.stops.length} stops</td>
                  <td>
                    {route.schedule[selectedDay].join(', ')}
                  </td>
                  <td className="text-emerald-500">₹{route.fare}</td>
                  <td className={`text-${route.status === 'Running' ? 'green' : 'yellow'}-400`}>
                    {route.status}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
