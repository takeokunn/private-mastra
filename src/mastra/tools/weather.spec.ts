import { describe, it, expect, vi, beforeEach } from 'vitest';
import { z } from 'zod';
import { weatherTool, getWeatherCondition } from './weather'; // Import tool and exported function

// fetch をモック
const mockFetch = vi.fn();
global.fetch = mockFetch;

// モックデータの型定義 (weather.tsからコピーまたはインポート)
interface GeocodingResult {
  latitude: number;
  longitude: number;
  name: string;
}
interface GeocodingResponse {
  results?: GeocodingResult[];
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
interface WeatherResponse {
  current: WeatherCurrentData;
}

describe('Weather Tool (src/mastra/tools/weather.ts)', () => {
  beforeEach(() => {
    vi.resetAllMocks(); // 各テスト前にモックをリセット
  });

  describe('weatherTool configuration', () => {
    it('should have correct id and description', () => {
      expect(weatherTool.id).toBe('get-weather');
      expect(weatherTool.description).toBe('指定された場所の現在の天気を取得します');
    });

    it('should have correct input schema', () => {
      expect(weatherTool.inputSchema).toBeInstanceOf(z.ZodObject);
      // Optional: More detailed schema check
      const parseResult = weatherTool.inputSchema.safeParse({ location: 'Tokyo' });
      expect(parseResult.success).toBe(true);
      const invalidResult = weatherTool.inputSchema.safeParse({ loc: 'Tokyo' });
      expect(invalidResult.success).toBe(false);
    });

    it('should have correct output schema', () => {
      expect(weatherTool.outputSchema).toBeInstanceOf(z.ZodObject);
       // Optional: More detailed schema check
      const parseResult = weatherTool.outputSchema.safeParse({
        temperature: 15, feelsLike: 14, humidity: 60, windSpeed: 10, windGust: 15, conditions: 'Cloudy', location: 'Tokyo'
      });
      expect(parseResult.success).toBe(true);
    });
  });

  describe('weatherTool.execute', () => {
    const mockLocation = 'Tokyo';
    const mockGeocodingData: GeocodingResponse = {
      results: [{ latitude: 35.6895, longitude: 139.6917, name: 'Tokyo' }],
    };
    const mockWeatherData: WeatherResponse = {
      current: {
        time: '2025-04-05T12:00',
        temperature_2m: 15.0,
        apparent_temperature: 14.0,
        relative_humidity_2m: 60,
        wind_speed_10m: 10.0,
        wind_gusts_10m: 15.0,
        weather_code: 3, // Overcast
      },
    };

    it('should execute successfully with valid location', async () => {
      // fetch のモックを設定 (Geocoding -> Weather)
      mockFetch
        .mockResolvedValueOnce({ ok: true, json: async () => mockGeocodingData } as Response)
        .mockResolvedValueOnce({ ok: true, json: async () => mockWeatherData } as Response);

      const result = await weatherTool.execute({ context: { location: mockLocation } });

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(mockFetch).toHaveBeenNthCalledWith(1, `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(mockLocation)}&count=1`);
      expect(mockFetch).toHaveBeenNthCalledWith(2, expect.stringContaining('https://api.open-meteo.com/v1/forecast?latitude=35.6895&longitude=139.6917'));
      expect(result).toEqual({
        temperature: 15.0,
        feelsLike: 14.0,
        humidity: 60,
        windSpeed: 10.0,
        windGust: 15.0,
        conditions: 'Overcast', // Code 3 maps to Overcast via getWeatherCondition
        location: 'Tokyo',
      });
    });

    it('should throw error if location is not found', async () => {
      const mockNotFoundLocation = 'InvalidCityName';
      const mockNotFoundGeocodingData: GeocodingResponse = { results: [] }; // Empty results

      mockFetch.mockResolvedValueOnce({ ok: true, json: async () => mockNotFoundGeocodingData } as Response);

      await expect(weatherTool.execute({ context: { location: mockNotFoundLocation } }))
        .rejects
        .toThrow(`Location '${mockNotFoundLocation}' not found`);

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(mockNotFoundLocation)}&count=1`);
    });

    it('should throw error if geocoding API fails', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 500 } as Response); // Simulate API error

      await expect(weatherTool.execute({ context: { location: mockLocation } }))
        .rejects
        .toThrow('Geocoding API request failed with status 500');

      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should throw error if weather API fails', async () => {
      mockFetch
        .mockResolvedValueOnce({ ok: true, json: async () => mockGeocodingData } as Response) // Geocoding OK
        .mockResolvedValueOnce({ ok: false, status: 503 } as Response); // Weather API Error

      await expect(weatherTool.execute({ context: { location: mockLocation } }))
        .rejects
        .toThrow('Weather API request failed with status 503');

      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('getWeatherCondition', () => {
    it('should return correct condition for known codes', () => {
      expect(getWeatherCondition(0)).toBe('Clear sky');
      expect(getWeatherCondition(3)).toBe('Overcast');
      expect(getWeatherCondition(63)).toBe('Moderate rain');
      expect(getWeatherCondition(73)).toBe('Moderate snow fall');
      expect(getWeatherCondition(95)).toBe('Thunderstorm');
    });

    it('should return "不明" for unknown codes', () => {
      expect(getWeatherCondition(999)).toBe('不明');
      expect(getWeatherCondition(-1)).toBe('不明');
    });
  });
});
