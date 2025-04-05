# Documentation for `src/mastra/tools/index.ts`

This file defines and exports various tools available for agents, primarily focusing on weather information and re-exporting GitHub tools.

## Overview

It uses `@mastra/core/tools` to create tools with defined schemas (`zod`) and execution logic. It includes functions to fetch and process data from external APIs (Open-Meteo).

## Exports

### `weatherTool`

A tool created using `createTool` for fetching current weather information.

- **ID:** `get-weather`
- **Description:** 'Get current weather for a location'
- **Input Schema:** Requires a `location` (string, city name).
  ```typescript
  z.object({
    location: z.string().describe('City name'),
  })
  ```
- **Output Schema:** Returns an object with weather details.
  ```typescript
  z.object({
    temperature: z.number(),
    feelsLike: z.number(),
    humidity: z.number(),
    windSpeed: z.number(),
    windGust: z.number(),
    conditions: z.string(),
    location: z.string(), // The resolved location name
  })
  ```
- **Execute:** Calls the internal `getWeather` function with the provided location.

### `getPullRequestDetails`

Re-exported from `./github`. See `docs/mastra/tools/github.md` for details.

### `getPullRequestDiff`

Re-exported from `./github`. See `docs/mastra/tools/github.md` for details.

## Internal Functions

### `getWeather(location: string)`

Asynchronously fetches geocoding data for the location, then uses the coordinates to fetch weather data from the Open-Meteo API. Throws an error if the location is not found. Returns the structured weather data matching the `outputSchema`.

### `getWeatherCondition(code: number)`

Maps Open-Meteo weather codes to human-readable condition strings (e.g., 'Clear sky', 'Moderate rain'). Returns '不明' (Unknown) for unmapped codes.

## Dependencies

- `@mastra/core/tools`: For `createTool`.
- `zod`: For schema definition and validation.
- `./github`: For GitHub-related tools.
- `fetch`: Implicit dependency for making API calls.
