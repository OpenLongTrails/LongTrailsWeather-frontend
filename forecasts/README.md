# Forecasts Directory

This is the directory where the backend stores the forecast data files, and where the frontend expects to find them.

## Structure

- `processed/` - Sample processed forecast JSON files for local development
- `archive/` - (Not used locally; production has 970+ historical files, 1.2GB)
- `raw/` - (Not used locally; empty directories on production)

## Note

Production forecasts are generated externally and stored only on S3. 
