"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/ui/Navbar";
import CombinedMap from "@/components/maps/CombinedMap";
import { motion } from "framer-motion";
import fallbackData from "@/utils/res.json";

function getHourFromTime(time = "morning") {
  switch (time) {
    case "morning":
      return "08:00";
    case "afternoon":
      return "13:00";
    case "evening":
      return "17:00";
    default:
      return "08:00";
  }
}

export default function DriverDashboard() {
  const [timeOfDay, setTimeOfDay] = useState("morning");
  const [mapMode, setMapMode] = useState("both");
  const [data, setData] = useState({
    hotspots: [],
    parking_spots: [],
    status: "loading",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [driverLocation, setDriverLocation] = useState({
    lat: 12.9716,
    lng: 77.5946,
  });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setDriverLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      });
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`http://127.0.0.1:8080/api/find-parking`);

        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        const responseData = await response.json();
        setData(responseData);
        setError(null);
      } catch (err) {
        console.error("Error processing data:", err);

        try {
          if (fallbackData) {
            setData(fallbackData);
            setError(null);
          } else {
            setError("Failed to load data. Please try again later.");
          }
        } catch (fallbackErr) {
          console.error("Error loading fallback data:", fallbackErr);
          setError("Failed to load data. Please try again later.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [timeOfDay]);

  const handleTimeChange = (time) => {
    setTimeOfDay(time);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-emerald-500"></div>
          <p className="mt-4">Loading data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="alert alert-error">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{error}</span>
        </div>
      </div>
    );
  }

  const getTopHotspots = () => {
    if (!data.hotspots || data.hotspots.length === 0) return [];
    return data.hotspots.map((hotspot) => hotspot.location);
  };

  const getTopHotspot = () => {
    if (!data.hotspots || data.hotspots.length === 0) return "";
    return data.hotspots[0].location;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <motion.h1
          className="text-3xl font-bold mb-6 text-white"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          Driver Dashboard
        </motion.h1>

        <motion.div
          className="card bg-gray-800 shadow-xl mb-6 border border-gray-700"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="card-body">
            <div className="flex flex-wrap items-center justify-between mb-4">
              <h2 className="card-title text-white">Combined Map View</h2>
            </div>

            <div className="flex flex-wrap items-center justify-between mb-4">
              <div className="tabs tabs-boxed bg-gray-700 mb-2">
                <a
                  className={`tab ${
                    mapMode === "both"
                      ? "bg-emerald-500 text-white"
                      : "text-gray-300"
                  }`}
                  onClick={() => setMapMode("both")}
                >
                  All Layers
                </a>
                <a
                  className={`tab ${
                    mapMode === "hotspots"
                      ? "bg-emerald-500 text-white"
                      : "text-gray-300"
                  }`}
                  onClick={() => setMapMode("hotspots")}
                >
                  Hotspots Only
                </a>
                <a
                  className={`tab ${
                    mapMode === "parking"
                      ? "bg-emerald-500 text-white"
                      : "text-gray-300"
                  }`}
                  onClick={() => setMapMode("parking")}
                >
                  Parking Only
                </a>
              </div>
            </div>

            <div className="h-[70vh] w-full rounded-lg overflow-hidden">
              <CombinedMap
                parkingSpots={data.parking_spots}
                hotspots={getTopHotspots()}
                driverLocation={driverLocation}
                topRecommendation={getTopHotspot()}
                activeLayer={mapMode}
              />
            </div>

            <div className="mt-4 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              {data.hotspots && data.hotspots.length > 0 && (
                <div className="alert bg-gray-700 border border-gray-600 flex-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    className="stroke-emerald-400 shrink-0 w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                  <span className="text-gray-200">
                    Top hotspot:{" "}
                    <span className="text-emerald-400 font-bold">
                      {getTopHotspot()}
                    </span>{" "}
                    (Time: {getHourFromTime(timeOfDay)})
                  </span>
                </div>
              )}

              {data.parking_spots && data.parking_spots.length > 0 && (
                <div className="alert bg-gray-700 border border-gray-600 flex-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    className="stroke-blue-400 shrink-0 w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                  <span className="text-gray-200">
                    Found{" "}
                    <span className="text-blue-400 font-bold">
                      {data.parking_spots.length}
                    </span>{" "}
                    parking spots
                    {data.parking_spots.filter((spot) => spot.is_edge_location)
                      .length > 0 && (
                      <>
                        {" "}
                        including{" "}
                        <span className="text-red-400 font-bold">
                          {
                            data.parking_spots.filter(
                              (spot) => spot.is_edge_location
                            ).length
                          }
                        </span>{" "}
                        edge locations
                      </>
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            className="card bg-gray-800 shadow-xl border border-gray-700"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div className="card-body">
              <h2 className="card-title text-white">Top Hotspots</h2>

              <div className="overflow-x-auto">
                <table className="table bg-gray-700 text-gray-200">
                  <thead className="text-gray-200">
                    <tr>
                      <th>Rank</th>
                      <th>Area</th>
                      <th>Intensity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getTopHotspots()
                      .slice(0, 5)
                      .map((area, index) => (
                        <tr key={index} className="hover:bg-gray-600">
                          <td className="text-white">#{index + 1}</td>
                          <td>{area}</td>
                          <td>
                            <progress
                              className="progress bg-gray-600"
                              style={{
                                color:
                                  index === 0
                                    ? "#ef4444"
                                    : index === 1
                                    ? "#f97316"
                                    : index === 2
                                    ? "#f59e0b"
                                    : index === 3
                                    ? "#eab308"
                                    : "#facc15",
                              }}
                              value={100 - index * 20}
                              max="100"
                            ></progress>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="card bg-gray-800 shadow-xl border border-gray-700"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <div className="card-body">
              <h2 className="card-title text-white">Top Parking Spots</h2>

              <div className="overflow-x-auto">
                <table className="table bg-gray-700 text-gray-200">
                  <thead className="text-gray-200">
                    <tr>
                      <th>Name</th>
                      <th>Type</th>
                      <th>Distance</th>
                      <th>Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.parking_spots.slice(0, 5).map((spot, index) => (
                      <tr key={index} className="hover:bg-gray-600">
                        <td className="font-medium">
                          {spot.name || "Unnamed Parking"}
                          {spot.is_edge_location && (
                            <span className="ml-2 px-2 py-1 bg-red-900 text-red-100 text-xs rounded">
                              Edge
                            </span>
                          )}
                        </td>
                        <td>
                          {spot.nearby_hotspot?.name || "General Parking"}
                        </td>
                        <td>{spot.walking_info?.distance || "N/A"}</td>
                        <td>
                          <div className="flex items-center">
                            {spot.rating ? (
                              <>
                                <span className="text-yellow-400 mr-1">★</span>
                                <span>{spot.rating}</span>
                              </>
                            ) : (
                              "No ratings"
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
