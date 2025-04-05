import { createTool, ToolExecutionContext } from '@mastra/core/tools'; // Import ToolExecutionContext
import { z } from 'zod';

// Define input and output schemas using Zod
const WeatherInputSchema = z.object({
  location: z.string().describe('都市名'),
});

const WeatherOutputSchema = z.object({
  temperature: z.number().describe('温度'),
  feelsLike: z.number().describe('体感温度'),
  humidity: z.number().describe('湿度'),
  windSpeed: z.number().describe('風速'),
  windGust: z.number().describe('突風'),
  conditions: z.string().describe('天気状況'),
  location: z.string().describe('解決された場所の名前'),
});

// Infer TypeScript types from Zod schemas
type WeatherInput = z.infer<typeof WeatherInputSchema>;
type WeatherOutput = z.infer<typeof WeatherOutputSchema>;

// Explicit types for API responses
interface GeocodingResult {
  latitude: number;
  longitude: number;
  name: string;
}

interface GeocodingResponse {
  results?: GeocodingResult[]; // Make results optional to handle not found cases
}

interface WeatherCurrentData {
  time: string;
  temperature_2m: number;
  apparent_temperature: number;
  relative_humidity_2m: number;
  wind_speed_10m: number;
  wind_gusts_10m: number;
  weather_code: number;
}

// Keep existing WeatherResponse interface
interface WeatherResponse {
  results: {
    latitude: number;
    longitude: number;
    name: string;
  }[];
}
interface WeatherResponse {
  current: {
    time: string;
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
    wind_gusts_10m: number;
    weather_code: number;
  };
}

export const weatherTool = createTool({
  id: 'get-weather',
  description: '指定された場所の現在の天気を取得します', // Updated description to Japanese
  inputSchema: WeatherInputSchema, // Use defined schema
  outputSchema: WeatherOutputSchema, // Use defined schema
  execute: async ({ context }: ToolExecutionContext<WeatherInput>): Promise<WeatherOutput> => { // Add types for context and return value
    return await getWeather(context.location);
  },
});

const getWeather = async (location: string): Promise<WeatherOutput> => { // Add return type
  const geocodingUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1`;
  const geocodingResponse: Response = await fetch(geocodingUrl);
  if (!geocodingResponse.ok) {
    throw new Error(`Geocoding API request failed with status ${geocodingResponse.status}`);
  }
  const geocodingData: GeocodingResponse = await geocodingResponse.json();

  const result = geocodingData.results?.[0];
  if (!result) {
    throw new Error(`Location '${location}' not found`);
  }

  const { latitude, longitude, name }: GeocodingResult = result;

  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,wind_gusts_10m,weather_code&timezone=auto`; // Added timezone=auto

  const weatherResponse: Response = await fetch(weatherUrl);
   if (!weatherResponse.ok) {
    throw new Error(`Weather API request failed with status ${weatherResponse.status}`);
  }
  const data: WeatherResponse = await weatherResponse.json();

  const weatherOutput: WeatherOutput = { // Explicitly create object matching the output type
    temperature: data.current.temperature_2m,
    feelsLike: data.current.apparent_temperature,
    humidity: data.current.relative_humidity_2m,
    windSpeed: data.current.wind_speed_10m,
    windGust: data.current.wind_gusts_10m,
    conditions: getWeatherCondition(data.current.weather_code),
    location: name,
  };
  return weatherOutput; // Add missing return statement
};

function getWeatherCondition(code: number): string {
  const conditions: Record<number, string> = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Foggy',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    56: 'Light freezing drizzle',
    57: 'Dense freezing drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    66: 'Light freezing rain',
    67: 'Heavy freezing rain',
    71: 'Slight snow fall',
    73: 'Moderate snow fall',
    75: 'Heavy snow fall',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail',
    99: 'Thunderstorm with heavy hail',
  };
  return conditions[code] || '不明';
}

// GitHubツールをインポートしてエクスポート
import { githubTools } from './github';
export const { getPullRequestDetails, getPullRequestDiff } = githubTools;
