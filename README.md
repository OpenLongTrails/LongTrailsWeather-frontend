# LongTrailsWeather.net

[www.longtrailsweather.net](https://www.longtrailsweather.net)

Weather forecasts for long distance hikers, updated daily.

Backend repo: https://github.com/OpenLongTrails/LongTrailsWeather-backend

## Overview

Detailed eight day forecasts every ~25 miles along several long distance hiking trails. Designed to be reasonably lightweight in order to increase probability of successful page loads for hikers that are on the side of a mountain with one bar of signal.

Currently, each trail's forecast.html is its own Preact page, but in a future version the entire site should probably be one Preact SPA.

## Supported Trails

- Appalachian Trail
- Arizona Trail
- Colorado Trail
- Long Trail
- Pacific Crest Trail

## Stack

- **Frontend**: Preact
- **Build Tool**: Vite
- **Date Handling**: Day.js
- **Deployment**: S3 + CloudFront
- **Weather Data**: Pirate Weather API

## Project Structure

```
longtrailsweather-frontend/
├── src/                # React app source code
├── public/             # Static assets
├── pages/              # Standalone HTML pages
├── configs/            # Trail configuration JSON files
├── scripts/            # Build and deployment scripts
├── forecasts/          # Local forecast data for testing
└── dist/               # Build output (git-ignored)
```

# Deployment

LTWx is deployed to S3 + CloudFront CDN. Deployment scripts are in the `scripts/` directory.

## Data Sources

- Weather data from [Pirate Weather](https://pirate-weather.apiable.io/)
- [Weather icons](https://erikflowers.github.io/weather-icons/) by Erik Flowers and Lukas Bischoff

## License

AGPL v3

## Contact

ltwx@openlongtrails.org
