import { createTool } from "@mastra/core/tools";
import { match } from "ts-pattern";
import { z } from "zod";

/**
 * Open-Meteo Geocoding API のレスポンス型。
 * @see https://open-meteo.com/en/docs/geocoding-api
 */
export type GeocodingResponse = {
  results: {
    latitude: number;
    longitude: number;
    name: string;
  }[];
};

/**
 * Open-Meteo Weather API のレスポンス型。
 * @see https://open-meteo.com/en/docs
 */
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

/**
 * weatherTool が返す整形された天気情報の型。
 */
export type WeatherToolResponse = {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windGust: number;
  conditions: string;
  location: string;
};

/**
 * 指定された場所の現在の天気を取得する Mastra ツール。
 * Open-Meteo API を使用して位置情報を解決し、天気データを取得します。
 */
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

/**
 * 指定された場所の天気情報を取得する内部ヘルパー関数。
 * Geocoding API で緯度経度を取得し、Weather API で天気情報を取得します。
 *
 * @param location 天気を取得する場所の名前 (例: "東京")。
 * @returns 整形された天気情報を含む Promise。
 * @throws 場所が見つからない場合や API リクエストに失敗した場合にエラーをスローします。
 */
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

/**
 * Open-Meteo の天気コードを人間が読める形式の文字列に変換します。
 *
 * @param code 天気コード (WMO Weather interpretation codes)。
 * @returns 天気の状態を表す文字列。
 * @see https://open-meteo.com/en/docs#weathervariables
 */
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
