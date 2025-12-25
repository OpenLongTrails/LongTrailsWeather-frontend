import { useState, useEffect } from 'preact/hooks'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import DetailModal from './DetailModal'

dayjs.extend(utc)
dayjs.extend(timezone)

function App() {
  const [config, setConfig] = useState(null)
  const [data, setData] = useState(null)
  const [measurementSystem, setMeasurementSystem] = useState('imperial')
  const [darkMode, setDarkMode] = useState(() => {
    const cookie = document.cookie.split('; ').find(c => c.startsWith('darkMode='))
    return cookie ? cookie.split('=')[1] === 'true' : false
  })
  const [selectedCell, setSelectedCell] = useState(null)
  const [detailData, setDetailData] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState(null)

  useEffect(() => {
    // Load trail configuration first
    fetch('config.json')
      .then(response => response.json())
      .then(configData => {
        setConfig(configData)
        // Update page title
        document.title = `LTWx: ${configData.code.toUpperCase()}`
        // Load trail forecast data
        const forecastUrl = import.meta.env.DEV
          ? `/forecasts/processed/${configData.code}.json`
          : `https://s3.amazonaws.com/www.longtrailsweather.net/forecasts/processed/${configData.code}.json`
        return fetch(forecastUrl)
      })
      .then(response => response.json())
      .then(jsonData => setData(jsonData))
      .catch(error => console.error('Error loading data:', error))
  }, [])

  useEffect(() => {
    // Apply dark mode class to body and save to cookie
    if (darkMode) {
      document.body.classList.add('dark-mode')
    } else {
      document.body.classList.remove('dark-mode')
    }
    document.cookie = `darkMode=${darkMode}; max-age=31536000; path=/`
  }, [darkMode])

  const convertTemp = (tempF) => {
    if (measurementSystem === 'metric') {
      return ((tempF - 32) * 5/9).toFixed(1)
    }
    return tempF.toFixed(1)
  }

  const convertPrecip = (inches) => {
    if (measurementSystem === 'metric') {
      return (inches * 25.4).toFixed(1)
    }
    return inches.toFixed(2)
  }

  const getTempUnit = () => measurementSystem === 'metric' ? '°C' : '°F'
  const getPrecipUnit = () => measurementSystem === 'metric' ? 'mm' : '"'

  const formatDate = (timestamp, tz) => {
    return dayjs.unix(timestamp).tz(tz).format('ddd M/D')
  }

  const getPrecipString = (day) => {
    if (day.precipProbability === 0 || day.precipType === 'none') {
      return '-'
    }
    const type = day.precipType || 'precip'
    const prob = Math.round(day.precipProbability * 100)
    const amount = convertPrecip(day.precipAccumulation)
    return `${type}, ${prob}%, ${amount}${getPrecipUnit()}`
  }

  const handleCellClick = (locationIndex, dayIndex, locationName) => {
    setSelectedCell({ locationIndex, dayIndex, locationName })
    setDetailLoading(true)
    setDetailError(null)
    setDetailData(null)

    const detailUrl = import.meta.env.DEV
      ? `/forecasts/detail/${config.code}/${String(locationIndex).padStart(3, '0')}.json`
      : `https://s3.amazonaws.com/www.longtrailsweather.net/forecasts/detail/${config.code}/${String(locationIndex).padStart(3, '0')}.json`

    fetch(detailUrl)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch')
        return res.json()
      })
      .then(data => {
        setDetailData(data)
        setDetailLoading(false)
      })
      .catch(err => {
        setDetailError('Failed to load forecast detail')
        setDetailLoading(false)
      })
  }

  const closeModal = () => {
    setSelectedCell(null)
    setDetailData(null)
    setDetailError(null)
  }

  if (!config || !data) {
    return <div>Loading...</div>
  }

  const lastModified = dayjs(data.last_modified).tz('America/Los_Angeles').format('YYYY-MM-DD HH:mm:ss') + ' Pacific Time'

  return (
    <div>
      <div>{config.name} Weather</div>
      <br />
      <div>Select a forecast for additional detail.</div>
      <br />
      <div>Forecasts updated as of: <span>{lastModified}</span></div>
      <br />
      <div>
        Format: <span>Daily high in {getTempUnit()} / Daily low in {getTempUnit()} / Precip. type, probability, amount in {measurementSystem === 'metric' ? 'mm' : 'inches'} / Summary.</span>
      </div>
      <br />
      <div>
        More trails at <a href="https://www.longtrailsweather.net">www.longtrailsweather.net</a>.
      </div>
      <br />
      <div>
        Thanks to <a target="_blank" rel="noopener noreferrer" href="https://pirate-weather.apiable.io/">Pirate Weather</a> for the weather data. Thanks to Erik Flowers and Lukas Bischoff for the <a target="_blank" rel="noopener noreferrer" href="https://erikflowers.github.io/weather-icons/">icons</a>.
      </div>
      <br />
      <div>
        <a target="_blank" rel="noopener noreferrer" href="mailto:ltwx@openlongtrails.org">Feedback</a>
      </div>
      <br />
      <fieldset>
        <div>
          <input
            type="radio"
            id="imperial"
            name="measurementSystem"
            value="imperial"
            checked={measurementSystem === 'imperial'}
            onChange={(e) => setMeasurementSystem(e.target.value)}
          />
          <label htmlFor="imperial">US Customary Units</label>
        </div>
        <div>
          <input
            type="radio"
            id="metric"
            name="measurementSystem"
            value="metric"
            checked={measurementSystem === 'metric'}
            onChange={(e) => setMeasurementSystem(e.target.value)}
          />
          <label htmlFor="metric">Metric</label>
        </div>
      </fieldset>
      <br />
      <fieldset>
        <div>
          <input
            type="checkbox"
            id="darkMode"
            checked={darkMode}
            onChange={(e) => setDarkMode(e.target.checked)}
          />
          <label htmlFor="darkMode">Dark Mode</label>
        </div>
      </fieldset>
      <br />
      <br />

      <table>
        <thead>
          <tr>
            <th>Location</th>
            <th>Mile</th>
            {data.forecasts[0]?.days.slice(0, 8).map((day, idx) => (
              <th key={idx}>{formatDate(day.time, data.forecasts[0].timezone)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.forecasts.map((forecast, idx) => (
            <tr key={idx}>
              <td>
                {forecast.location_name && <>{forecast.location_name}<br /></>}
                ({forecast.lat.toFixed(4)}, {forecast.lon.toFixed(4)})
              </td>
              <td>
                <a
                  href={`https://merrysky.net/forecast/${forecast.lat},${forecast.lon}/us12/en`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {forecast.distance}
                </a>
              </td>
              {forecast.days.slice(0, 8).map((day, dayIdx) => (
                <td
                  key={dayIdx}
                  className="forecast-cell"
                  onClick={() => handleCellClick(forecast.location_index, dayIdx, forecast.location_name)}
                >
                  <i className={`wi wi-forecast-io-${day.icon} weather-icon`}></i>
                  <div className="forecast-content">
                    {day.alert && <>⚠️ Severe weather alert<br /><br /></>}
                    {convertTemp(day.temperatureHigh)}° / {convertTemp(day.temperatureLow)}°<br />
                    {getPrecipString(day)}<br />
                    {day.summary}
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <DetailModal
        isOpen={!!selectedCell}
        onClose={closeModal}
        loading={detailLoading}
        error={detailError}
        locationName={selectedCell?.locationName}
        dayIndex={selectedCell?.dayIndex}
        detailData={detailData}
        measurementSystem={measurementSystem}
        timezone={data.forecasts.find(f => f.location_index === selectedCell?.locationIndex)?.timezone}
      />
    </div>
  )
}

export default App
