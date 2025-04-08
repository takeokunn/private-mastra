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
