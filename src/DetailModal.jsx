import { useEffect, useRef, useState } from 'preact/hooks'
import dayjs from 'dayjs'

/**
 * DetailModal - displays forecast detail using Visual Viewport API
 * Positions itself to fill exactly what the user sees, regardless of zoom level.
 */
function DetailModal({
  isOpen,
  onClose,
  loading,
  error,
  locationName,
  dayIndex,
  detailData,
  measurementSystem,
  timezone
}) {
  const modalRef = useRef(null)
  const [viewport, setViewport] = useState({ top: 0, left: 0, width: 0, height: 0 })

  // Update modal position/size to match visual viewport
  useEffect(() => {
    if (!isOpen) return

    const updateViewport = () => {
      const vv = window.visualViewport
      if (vv) {
        setViewport({
          top: vv.offsetTop + window.scrollY,
          left: vv.offsetLeft + window.scrollX,
          width: vv.width,
          height: vv.height
        })
      } else {
        // Fallback for browsers without visualViewport
        setViewport({
          top: window.scrollY,
          left: window.scrollX,
          width: window.innerWidth,
          height: window.innerHeight
        })
      }
    }

    updateViewport()

    const vv = window.visualViewport
    if (vv) {
      vv.addEventListener('resize', updateViewport)
      vv.addEventListener('scroll', updateViewport)
    }
    window.addEventListener('scroll', updateViewport)

    return () => {
      if (vv) {
        vv.removeEventListener('resize', updateViewport)
        vv.removeEventListener('scroll', updateViewport)
      }
      window.removeEventListener('scroll', updateViewport)
    }
  }, [isOpen])

  if (!isOpen) return null

  // Unit conversion helpers
  const convertTemp = (tempF) => {
    if (tempF === undefined || tempF === null) return '-'
    if (measurementSystem === 'metric') {
      return ((tempF - 32) * 5 / 9).toFixed(1)
    }
    return tempF.toFixed(1)
  }

  const convertPrecip = (inches) => {
    if (inches === undefined || inches === null) return '-'
    if (measurementSystem === 'metric') {
      return (inches * 25.4).toFixed(1)
    }
    return inches.toFixed(2)
  }

  const convertPrecipIntensity = (inPerHr) => {
    if (inPerHr === undefined || inPerHr === null) return '-'
    if (measurementSystem === 'metric') {
      return (inPerHr * 25.4).toFixed(2)
    }
    return inPerHr.toFixed(3)
  }

  const convertWindSpeed = (mph) => {
    if (mph === undefined || mph === null) return '-'
    if (measurementSystem === 'metric') {
      return (mph * 1.60934).toFixed(1)
    }
    return mph.toFixed(1)
  }

  const convertVisibility = (miles) => {
    if (miles === undefined || miles === null) return '-'
    if (measurementSystem === 'metric') {
      return (miles * 1.60934).toFixed(1)
    }
    return miles.toFixed(1)
  }

  const getTempUnit = () => measurementSystem === 'metric' ? '°C' : '°F'
  const getPrecipUnit = () => measurementSystem === 'metric' ? 'mm' : 'in'
  const getPrecipIntensityUnit = () => measurementSystem === 'metric' ? 'mm/hr' : 'in/hr'
  const getWindUnit = () => measurementSystem === 'metric' ? 'km/h' : 'mph'
  const getVisibilityUnit = () => measurementSystem === 'metric' ? 'km' : 'mi'

  const getWindDirection = (degrees) => {
    if (degrees === undefined || degrees === null) return ''
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
      'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
    return directions[Math.round(degrees / 22.5) % 16]
  }

  const getMoonPhaseName = (phase) => {
    if (phase === undefined || phase === null) return ''
    if (phase < 0.03 || phase > 0.97) return 'New Moon'
    if (phase < 0.22) return 'Waxing Crescent'
    if (phase < 0.28) return 'First Quarter'
    if (phase < 0.47) return 'Waxing Gibbous'
    if (phase < 0.53) return 'Full Moon'
    if (phase < 0.72) return 'Waning Gibbous'
    if (phase < 0.78) return 'Last Quarter'
    return 'Waning Crescent'
  }

  const getUVRisk = (index) => {
    if (index === undefined || index === null) return ''
    if (index < 3) return 'Low'
    if (index < 6) return 'Moderate'
    if (index < 8) return 'High'
    if (index < 11) return 'Very High'
    return 'Extreme'
  }

  const formatTime = (timestamp) => {
    if (!timestamp) return '-'
    return dayjs.unix(timestamp).tz(timezone).format('h:mm A')
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return '-'
    return dayjs.unix(timestamp).tz(timezone).format('ddd M/D')
  }

  const Row = ({ label, value }) => (
    <div className="modal-row">
      <span className="label">{label}</span>
      <span className="value">{value}</span>
    </div>
  )

  const modalStyle = {
    position: 'absolute',
    top: `${viewport.top}px`,
    left: `${viewport.left}px`,
    width: `${viewport.width}px`,
    height: `${viewport.height}px`,
    zIndex: 9999
  }

  // Loading state
  if (loading) {
    return (
      <div className="vv-modal-overlay" style={modalStyle}>
        <div className="vv-modal-content">
          <div className="modal-loading">Loading forecast details...</div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="vv-modal-overlay" style={modalStyle}>
        <div className="vv-modal-content">
          <div className="modal-header">
            <h2>Error</h2>
            <button className="modal-close" onClick={onClose}>&times;</button>
          </div>
          <div className="modal-error">{error}</div>
        </div>
      </div>
    )
  }

  // No data state
  if (!detailData || !detailData.days || !detailData.days[dayIndex]) {
    return (
      <div className="vv-modal-overlay" style={modalStyle}>
        <div className="vv-modal-content">
          <div className="modal-header">
            <h2>No Data</h2>
            <button className="modal-close" onClick={onClose}>&times;</button>
          </div>
          <div className="modal-error">Forecast detail not available</div>
        </div>
      </div>
    )
  }

  const day = detailData.days[dayIndex]
  const gps = detailData.gps

  // Filter alerts that overlap with this day
  const dayStart = day.time
  const dayEnd = day.time + 86400
  const dayAlerts = (detailData.alerts || []).filter(alert =>
    alert.time < dayEnd && alert.expires > dayStart
  )

  return (
    <div className="vv-modal-overlay" style={modalStyle} onClick={onClose}>
      <div className="vv-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-scroll-area">
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2>{locationName || 'Forecast Detail'}</h2>
            <div>{formatDate(day.time)}</div>
            {gps && <div style={{ fontSize: '0.8em', color: '#888' }}>
              ({gps[1]?.toFixed(4)}, {gps[0]?.toFixed(4)})
            </div>}
            {day.summary && <div style={{ marginTop: '8px' }}>{day.summary}</div>}
          </div>
          {day.icon && <i className={`wi wi-forecast-io-${day.icon} weather-icon`}></i>}
        </div>

        {/* Severe Weather Alert Section */}
        {dayAlerts.length > 0 && (
          <div className="modal-section">
            <h3>Severe Weather Alert</h3>
            {dayAlerts.map((alert, idx) => (
              <div key={idx} className="alert-item">
                <Row label="Alert" value={alert.title} />
                <Row label="Severity" value={alert.severity} />
                <div className="alert-description">{alert.description}</div>
              </div>
            ))}
          </div>
        )}

        {/* Temperature Section */}
        <div className="modal-section">
          <h3>Temperature</h3>
          {day.temperatureHigh !== undefined && (
            <Row
              label="Daytime High (6AM-6PM)"
              value={`${convertTemp(day.temperatureHigh)}${getTempUnit()}${day.temperatureHighTime ? ` at ${formatTime(day.temperatureHighTime)}` : ''}`}
            />
          )}
          {day.temperatureLow !== undefined && (
            <Row
              label="Overnight Low (6PM-6AM)"
              value={`${convertTemp(day.temperatureLow)}${getTempUnit()}${day.temperatureLowTime ? ` at ${formatTime(day.temperatureLowTime)}` : ''}`}
            />
          )}
          {day.temperatureMax !== undefined && (
            <Row
              label="Day Max (midnight-midnight)"
              value={`${convertTemp(day.temperatureMax)}${getTempUnit()}${day.temperatureMaxTime ? ` at ${formatTime(day.temperatureMaxTime)}` : ''}`}
            />
          )}
          {day.temperatureMin !== undefined && (
            <Row
              label="Day Min (midnight-midnight)"
              value={`${convertTemp(day.temperatureMin)}${getTempUnit()}${day.temperatureMinTime ? ` at ${formatTime(day.temperatureMinTime)}` : ''}`}
            />
          )}
          {day.apparentTemperatureHigh !== undefined && (
            <Row
              label="Feels Like High (6AM-6PM)"
              value={`${convertTemp(day.apparentTemperatureHigh)}${getTempUnit()}${day.apparentTemperatureHighTime ? ` at ${formatTime(day.apparentTemperatureHighTime)}` : ''}`}
            />
          )}
          {day.apparentTemperatureLow !== undefined && (
            <Row
              label="Feels Like Low (6PM-6AM)"
              value={`${convertTemp(day.apparentTemperatureLow)}${getTempUnit()}${day.apparentTemperatureLowTime ? ` at ${formatTime(day.apparentTemperatureLowTime)}` : ''}`}
            />
          )}
          {day.apparentTemperatureMax !== undefined && (
            <Row
              label="Feels Like Max"
              value={`${convertTemp(day.apparentTemperatureMax)}${getTempUnit()}${day.apparentTemperatureMaxTime ? ` at ${formatTime(day.apparentTemperatureMaxTime)}` : ''}`}
            />
          )}
          {day.apparentTemperatureMin !== undefined && (
            <Row
              label="Feels Like Min"
              value={`${convertTemp(day.apparentTemperatureMin)}${getTempUnit()}${day.apparentTemperatureMinTime ? ` at ${formatTime(day.apparentTemperatureMinTime)}` : ''}`}
            />
          )}
          {day.dewPoint !== undefined && (
            <Row label="Dew Point" value={`${convertTemp(day.dewPoint)}${getTempUnit()}`} />
          )}
        </div>

        {/* Precipitation Section */}
        <div className="modal-section">
          <h3>Precipitation</h3>
          {day.precipProbability !== undefined && (
            <Row label="Probability" value={`${Math.round(day.precipProbability * 100)}%`} />
          )}
          {day.precipType !== undefined && (
            <Row label="Type" value={day.precipType} />
          )}
          {day.precipAccumulation !== undefined && (
            <Row label="Accumulation" value={`${convertPrecip(day.precipAccumulation)} ${getPrecipUnit()}`} />
          )}
          {day.precipIntensity !== undefined && (
            <Row label="Intensity" value={`${convertPrecipIntensity(day.precipIntensity)} ${getPrecipIntensityUnit()}`} />
          )}
          {day.precipIntensityMax !== undefined && (
            <Row
              label="Max Intensity"
              value={`${convertPrecipIntensity(day.precipIntensityMax)} ${getPrecipIntensityUnit()}${day.precipIntensityMaxTime ? ` at ${formatTime(day.precipIntensityMaxTime)}` : ''}`}
            />
          )}
          {day.rainIntensityMax !== undefined && (
            <Row label="Max Rain Intensity" value={`${convertPrecipIntensity(day.rainIntensityMax)} ${getPrecipIntensityUnit()}`} />
          )}
          {day.liquidAccumulation !== undefined && (
            <Row label="Liquid Accumulation" value={`${convertPrecip(day.liquidAccumulation)} ${getPrecipUnit()}`} />
          )}
          {day.snowAccumulation !== undefined && (
            <Row label="Snow Accumulation" value={`${convertPrecip(day.snowAccumulation)} ${getPrecipUnit()}`} />
          )}
          {day.iceAccumulation !== undefined && (
            <Row label="Ice Accumulation" value={`${convertPrecip(day.iceAccumulation)} ${getPrecipUnit()}`} />
          )}
        </div>

        {/* Wind Section */}
        <div className="modal-section">
          <h3>Wind</h3>
          {day.windSpeed !== undefined && (
            <Row label="Speed" value={`${convertWindSpeed(day.windSpeed)} ${getWindUnit()}`} />
          )}
          {day.windGust !== undefined && (
            <Row
              label="Gusts"
              value={`${convertWindSpeed(day.windGust)} ${getWindUnit()}${day.windGustTime ? ` at ${formatTime(day.windGustTime)}` : ''}`}
            />
          )}
          {day.windBearing !== undefined && (
            <Row label="Direction" value={`${day.windBearing}° (${getWindDirection(day.windBearing)})`} />
          )}
        </div>

        {/* Atmosphere Section */}
        <div className="modal-section">
          <h3>Atmosphere</h3>
          {day.humidity !== undefined && (
            <Row label="Humidity" value={`${Math.round(day.humidity * 100)}%`} />
          )}
          {day.pressure !== undefined && (
            <Row label="Pressure" value={`${day.pressure.toFixed(1)} hPa`} />
          )}
          {day.cloudCover !== undefined && (
            <Row label="Cloud Cover" value={`${Math.round(day.cloudCover * 100)}%`} />
          )}
          {day.visibility !== undefined && (
            <Row label="Visibility" value={`${convertVisibility(day.visibility)} ${getVisibilityUnit()}`} />
          )}
          {day.uvIndex !== undefined && (
            <Row
              label="UV Index"
              value={`${day.uvIndex.toFixed(2)} (${getUVRisk(day.uvIndex)})${day.uvIndexTime ? ` peak at ${formatTime(day.uvIndexTime)}` : ''}`}
            />
          )}
          {day.smoke !== undefined && (
            <Row label="Smoke" value={day.smoke} />
          )}
          {day.fireIndex !== undefined && (
            <Row label="Fire Index" value={day.fireIndex} />
          )}
        </div>

        {/* Sun/Moon Section */}
        <div className="modal-section">
          <h3>Sun &amp; Moon</h3>
          {day.sunriseTime !== undefined && (
            <Row label="Sunrise" value={formatTime(day.sunriseTime)} />
          )}
          {day.sunsetTime !== undefined && (
            <Row label="Sunset" value={formatTime(day.sunsetTime)} />
          )}
          {day.moonPhase !== undefined && (
            <Row label="Moon Phase" value={`${day.moonPhase.toFixed(2)} (${getMoonPhaseName(day.moonPhase)})`} />
          )}
        </div>
        </div>
        <div className="modal-close-bar" onClick={onClose}>Close</div>
      </div>
    </div>
  )
}

export default DetailModal
