
export const initializeMap = (container, center, zoom = 12) => {
  return new mapboxgl.Map({
    container,
    style: 'mapbox:
    center,
    zoom
  })
}


export const createMarker = (map, coordinates, color, popupHTML) => {
  return new mapboxgl.Marker({ color })
    .setLngLat(coordinates)
    .setPopup(
      new mapboxgl.Popup().setHTML(popupHTML)
    )
    .addTo(map)
}


export const createRoute = (map, sourceId, layerId, coordinates, color = '#3B82F6', width = 4, dasharray = null) => {
  
  if (!map.getSource(sourceId)) {
    map.addSource(sourceId, {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates
        }
      }
    })
  } else {
    
    map.getSource(sourceId).setData({
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates
      }
    })
  }
  
  
  if (!map.getLayer(layerId)) {
    map.addLayer({
      id: layerId,
      type: 'line',
      source: sourceId,
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': color,
        'line-width': width,
        'line-dasharray': dasharray
      }
    })
  }
}


export const createHeatmap = (map, sourceId, layerId, points) => {
  
  const features = points.map(point => ({
    type: 'Feature',
    properties: {
      intensity: point.intensity
    },
    geometry: {
      type: 'Point',
      coordinates: [point.lng, point.lat]
    }
  }))
  
  
  if (!map.getSource(sourceId)) {
    map.addSource(sourceId, {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features
      }
    })
  } else {
    
    map.getSource(sourceId).setData({
      type: 'FeatureCollection',
      features
    })
  }
  
  
  if (!map.getLayer(layerId)) {
    map.addLayer({
      id: layerId,
      type: 'heatmap',
      source: sourceId,
      paint: {
        'heatmap-weight': ['get', 'intensity'],
        'heatmap-intensity': 1,
        'heatmap-color': [
          'interpolate',
          ['linear'],
          ['heatmap-density'],
          0, 'rgba(0, 0, 255, 0)',
          0.2, 'royalblue',
          0.4, 'cyan',
          0.6, 'lime',
          0.8, 'yellow',
          1, 'red'
        ],
        'heatmap-radius': 20,
        'heatmap-opacity': 0.7
      }
    })
  }
}


export const createRadius = (map, sourceId, layerId, coordinates, radiusSize = 1000, color = '#3B82F6') => {
  
  if (!map.getSource(sourceId)) {
    map.addSource(sourceId, {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Point',
          coordinates
        }
      }
    })
  } else {
    
    map.getSource(sourceId).setData({
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Point',
        coordinates
      }
    })
  }
  
  
  if (!map.getLayer(layerId)) {
    map.addLayer({
      id: layerId,
      type: 'circle',
      source: sourceId,
      paint: {
        'circle-radius': {
          'base': 1.75,
          'stops': [
            [12, radiusSize / 10],
            [22, radiusSize]
          ]
        },
        'circle-color': color,
        'circle-opacity': 0.2,
        'circle-stroke-width': 1,
        'circle-stroke-color': color
      }
    })
  }
}


export const getDistance = (coord1, coord2) => {
  
  const toRad = (value) => value * Math.PI / 180
  const R = 6371 
  const dLat = toRad(coord2.lat - coord1.lat)
  const dLon = toRad(coord2.lng - coord1.lng)
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(coord1.lat)) * Math.cos(toRad(coord2.lat)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c
  return distance
}


export const getEstimatedTravelTime = (distance, vehicleType = 'auto') => {
  
  const speeds = {
    auto: 25,
    mini: 30,
    premium: 35,
    walking: 5
  }
  
  const speed = speeds[vehicleType] || speeds.auto
  const timeHours = distance / speed
  return Math.round(timeHours * 60) 
}


export const findNearestStand = (location, stands) => {
  if (!stands || stands.length === 0) return null
  
  let nearest = null
  let minDistance = Infinity
  
  stands.forEach(stand => {
    const distance = getDistance(location, { lat: stand.lat, lng: stand.lng })
    if (distance < minDistance) {
      minDistance = distance
      nearest = { ...stand, distance }
    }
  })
  
  return nearest
}