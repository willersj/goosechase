import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

function makeIcon(rank, isFocused) {
  const size = isFocused ? 30 : 26
  const bg = isFocused ? '#1e5245' : '#2a6b5a'
  const fs = isFocused ? 11 : 10
  return L.divIcon({
    className: '',
    html: `<div style="width:${size}px;height:${size}px;background:${bg};border:2.5px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-size:${fs}px;font-weight:700;box-shadow:0 2px 8px rgba(0,0,0,0.3);font-family:system-ui,sans-serif">${rank}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2) - 4],
  })
}

export default function MapView({ hotspots, focused }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const markersRef = useRef([])

  // Initialize map and markers when hotspots change
  useEffect(() => {
    if (!containerRef.current || !hotspots.length) return

    // Destroy any existing map first (handles React StrictMode double-mount)
    if (mapRef.current) {
      mapRef.current.remove()
      mapRef.current = null
      markersRef.current = []
    }

    const map = L.map(containerRef.current, { zoomControl: true })
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    }).addTo(map)

    const markers = hotspots.map((h, i) => {
      const marker = L.marker([h.lat, h.lng], { icon: makeIcon(i + 1, false) }).addTo(map)
      const popup = `<div style="min-width:140px">
        <p style="font-weight:600;margin:0 0 2px">${h.locName}</p>
        ${h.location ? `<p style="font-size:11px;color:#64748b;margin:0 0 4px">${h.location}</p>` : ''}
        ${h.newSpecies?.length > 0 ? `<p style="font-size:11px;color:#16a34a;margin:0">${h.newSpecies.length} new species</p>` : ''}
      </div>`
      marker.bindPopup(popup)
      return marker
    })

    const bounds = L.latLngBounds(hotspots.map(h => [h.lat, h.lng]))
    map.fitBounds(bounds, { padding: [36, 36] })

    mapRef.current = map
    markersRef.current = markers

    return () => {
      map.remove()
      mapRef.current = null
      markersRef.current = []
    }
  }, [hotspots])

  // Update marker icons and fly to focused hotspot
  useEffect(() => {
    if (!mapRef.current) return

    markersRef.current.forEach((marker, i) => {
      const isFocused = hotspots[i]?.locId === focused?.locId
      marker.setIcon(makeIcon(i + 1, isFocused))
    })

    if (focused) {
      mapRef.current.flyTo([focused.lat, focused.lng], 14, { duration: 0.8 })
    }
  }, [focused, hotspots])

  if (!hotspots.length) return null

  return <div ref={containerRef} style={{ height: '100%', width: '100%' }} />
}
