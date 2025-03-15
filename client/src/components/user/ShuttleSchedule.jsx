'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

export default function ShuttleSchedule({ routes = [] }) {
  const [selectedDay, setSelectedDay] = useState('weekday')
  const [selectedRoute, setSelectedRoute] = useState(null)

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
          {routes.map(route => (
            <option key={route.id} value={route.id}>{route.name}</option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="table w-full text-left text-sm">
          <thead>
            <tr className="text-emerald-500 uppercase text-xs font-bold">
              <th>Route</th>
              <th>Stops</th>
              <th>Timings</th>
              <th>Fare</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {routes
              .filter(route => selectedRoute ? route.id === selectedRoute : true)
              .map(route => (
                <tr key={route.id} className="hover:bg-gray-800">
                  <td className="font-bold text-white">{route.name}</td>
                  <td>{route.stops.length} stops</td>
                  <td>
                    {route.schedule[selectedDay].join(', ')}
                  </td>
                  <td className="text-emerald-500 font-bold">₹{route.fare}</td>
                  <td className={`text-${route.status === 'Running' ? 'green' : 'yellow'}-400 font-bold`}>
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