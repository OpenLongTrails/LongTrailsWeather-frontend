# LongTrailsWeather.net

[www.longtrailsweather.net](https://www.longtrailsweather.net)

Weather forecasts for long distance hikers, updated daily.

Backend repo: https://github.com/OpenLongTrails/LongTrailsWeather-backend

## Overview

Detailed eight day forecasts every ~25 miles along several long distance hiking trails. Designed to be reasonably lightweight in order to increase probability of successful page loads for hikers that are on the side of a mountain with one bar of signal.

## Supported Trails

- Appalachian Trail
- Arizona Trail
- Colorado Trail
- Long Trail
- Pacific Crest Trail

## Technology Stack

- **Frontend**: Preact
- **Build Tool**: Vite
- **Date Handling**: Day.js
- **Deployment**: S3 + CloudFront
- **Weather Data**: Pirate Weather API

## Project Structure

```
longtrailswx/
├── src/                # React app source code
├── public/             # Static assets (processed by Vite)
├── pages/              # Standalone HTML pages (deployed directly)
├── configs/            # Trail configuration JSON files
├── scripts/            # Build and deployment scripts
├── forecasts/          # Local forecast data for testing (git-ignored)
└── dist/               # Build output (git-ignored)
```

## Development

### Prerequisites

- Node.js (v18 or higher recommended)
- npm

### Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Building

```bash
# Build for production
npm run build
```

The build output will be in the `dist/` directory.

## Deployment

LTWx is deployed to S3 + CloudFront CDN. Deployment scripts are in the `scripts/` directory.

## Data Sources

- Weather data provided by [Pirate Weather](https://pirate-weather.apiable.io/)
- Weather icons by Erik Flowers and Lukas Bischoff ([Weather Icons](https://erikflowers.github.io/weather-icons/))

## License

AGPL v3

## Contact

ltwx@openlongtrails.org

