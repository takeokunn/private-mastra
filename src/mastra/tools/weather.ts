import { createTool } from "@mastra/core/tools";
import { match } from "ts-pattern";
import { z } from "zod";

export type GeocodingResponse = {
  results: {
    latitude: number;
    longitude: number;
    name: string;
  }[];
};

export type WeatherResponse = {
  current: {
    time: string;
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
    wind_gusts_10m: number;
    weather_code: number;
  };
};

export type WeatherToolResponse = {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windGust: number;
  conditions: string;
  location: string;
};

export const weatherTool = createTool({
  id: "get-weather",
  description: "Get current weather for a location",
  inputSchema: z.object({
    location: z.string().describe("City name"),
  }),
  outputSchema: z.object({
    temperature: z.number(),
    feelsLike: z.number(),
    humidity: z.number(),
    windSpeed: z.number(),
    windGust: z.number(),
    conditions: z.string(),
    location: z.string(),
  }),
  execute: async ({ context }): Promise<WeatherToolResponse> => await getWeather(context.location),
});

const getWeather = async (location: string): Promise<WeatherToolResponse> => {
  const geocodingUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1`;
  const geocodingResponse = await fetch(geocodingUrl);
  const geocodingData = (await geocodingResponse.json()) as GeocodingResponse;

  if (!geocodingData.results?.[0]) {
    throw new Error(`Location '${location}' not found`);
  }

  const { latitude, longitude, name } = geocodingData.results[0];

  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,wind_gusts_10m,weather_code`;

  const response = await fetch(weatherUrl);
  const data = (await response.json()) as WeatherResponse;

  return {
    temperature: data.current.temperature_2m,
    feelsLike: data.current.apparent_temperature,
    humidity: data.current.relative_humidity_2m,
    windSpeed: data.current.wind_speed_10m,
    windGust: data.current.wind_gusts_10m,
    location: name,
    conditions: getWeatherCondition(data.current.weather_code),
  };
};

const getWeatherCondition = (code: number): string =>
  match(code)
    .with(0, () => "Clear sky")
    .with(1, () => "Mainly clear")
    .with(2, () => "Partly cloudy")
    .with(3, () => "Overcast")
    .with(45, () => "Foggy")
    .with(48, () => "Depositing rime fog")
    .with(51, () => "Light drizzle")
    .with(53, () => "Moderate drizzle")
    .with(55, () => "Dense drizzle")
    .with(56, () => "Light freezing drizzle")
    .with(57, () => "Dense freezing drizzle")
    .with(61, () => "Slight rain")
    .with(63, () => "Moderate rain")
    .with(65, () => "Heavy rain")
    .with(66, () => "Light freezing rain")
    .with(67, () => "Heavy freezing rain")
    .with(71, () => "Slight snow fall")
    .with(73, () => "Moderate snow fall")
    .with(75, () => "Heavy snow fall")
    .with(77, () => "Snow grains")
    .with(80, () => "Slight rain showers")
    .with(81, () => "Moderate rain showers")
    .with(82, () => "Violent rain showers")
    .with(85, () => "Slight snow showers")
    .with(86, () => "Heavy snow showers")
    .with(95, () => "Thunderstorm")
    .with(96, () => "Thunderstorm with slight hail")
    .with(99, () => "Thunderstorm with heavy hail")
    .otherwise(() => "Unknown");
