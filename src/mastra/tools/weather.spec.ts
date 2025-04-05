import { describe, it, expect, vi, beforeEach } from 'vitest';
import { z } from 'zod';
import { weatherTool, getWeatherCondition } from './weather'; // Import tool and exported function

// fetch をモック
const mockFetch = vi.fn();
global.fetch = mockFetch;

// モックデータの型定義 (weather.tsからコピーまたはインポート)
// Note: These interfaces are already defined in weather.ts,
// ideally they would be exported or defined in a shared types file.
// For simplicity in the test, we redefine them here.
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
      // Use the description from the actual code
      expect(weatherTool.description).toBe('Get current weather for a location');
    });

    it('should have correct input schema', () => {
      expect(weatherTool.inputSchema).toBeInstanceOf(z.ZodObject);
      // Check schema parsing
      const parseResult = weatherTool.inputSchema.safeParse({ location: 'London' });
      expect(parseResult.success).toBe(true);
      const invalidResult = weatherTool.inputSchema.safeParse({ city: 'London' });
      expect(invalidResult.success).toBe(false);
    });

    it('should have correct output schema', () => {
      expect(weatherTool.outputSchema).toBeInstanceOf(z.ZodObject);
      // Check schema parsing
      const parseResult = weatherTool.outputSchema.safeParse({
        temperature: 10, feelsLike: 9, humidity: 80, windSpeed: 5, windGust: 8, conditions: 'Rainy', location: 'London'
      });
      expect(parseResult.success).toBe(true);
    });
  });

  describe('weatherTool.execute', () => {
    const mockLocation = 'London';
    const mockGeocodingData: GeocodingResponse = {
      results: [{ latitude: 51.5074, longitude: -0.1278, name: 'London, UK' }], // More realistic name
    };
    const mockWeatherData: WeatherResponse = {
      current: {
        time: '2025-04-06T10:00',
        temperature_2m: 12.5,
        apparent_temperature: 11.0,
        relative_humidity_2m: 75,
        wind_speed_10m: 15.0,
        wind_gusts_10m: 20.0,
        weather_code: 61, // Slight rain
      },
    };

    it('should execute successfully with valid location', async () => {
      // Setup fetch mocks: Geocoding -> Weather
      mockFetch
        .mockResolvedValueOnce({ ok: true, json: async () => mockGeocodingData } as Response)
        .mockResolvedValueOnce({ ok: true, json: async () => mockWeatherData } as Response);

      const result = await weatherTool.execute({ context: { location: mockLocation } });

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(mockFetch).toHaveBeenNthCalledWith(1, `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(mockLocation)}&count=1`);
      expect(mockFetch).toHaveBeenNthCalledWith(2, expect.stringContaining(`https://api.open-meteo.com/v1/forecast?latitude=${mockGeocodingData.results![0].latitude}&longitude=${mockGeocodingData.results![0].longitude}`));
      expect(result).toEqual({
        temperature: 12.5,
        feelsLike: 11.0,
        humidity: 75,
        windSpeed: 15.0,
        windGust: 20.0,
        conditions: 'Slight rain', // Code 61 maps to Slight rain
        location: 'London, UK', // Use the name from geocoding result
      });
    });

    it('should throw error if location is not found', async () => {
      const mockNotFoundLocation = 'NonExistentPlace';
      const mockNotFoundGeocodingData: GeocodingResponse = { results: [] }; // Empty results

      mockFetch.mockResolvedValueOnce({ ok: true, json: async () => mockNotFoundGeocodingData } as Response);

      await expect(weatherTool.execute({ context: { location: mockNotFoundLocation } }))
        .rejects
        .toThrow(`Location '${mockNotFoundLocation}' not found`);

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(mockNotFoundLocation)}&count=1`);
    });

    // Note: The current implementation in weather.ts doesn't handle fetch errors explicitly.
    // These tests assume fetch might throw or return non-ok status.
    // Consider adding try/catch and response.ok checks in weather.ts for robustness.

    it('should throw error if geocoding API fetch fails', async () => {
       const fetchError = new Error('Network Error');
       mockFetch.mockRejectedValueOnce(fetchError); // Simulate fetch throwing an error

       await expect(weatherTool.execute({ context: { location: mockLocation } }))
         .rejects // Expect the promise to reject
         .toThrow(fetchError); // Check if it throws the same error fetch threw

       expect(mockFetch).toHaveBeenCalledTimes(1);
    });

     it('should throw error if weather API fetch fails', async () => {
       const fetchError = new Error('Weather Service Unavailable');
       mockFetch
         .mockResolvedValueOnce({ ok: true, json: async () => mockGeocodingData } as Response) // Geocoding OK
         .mockRejectedValueOnce(fetchError); // Weather API fetch throws

       await expect(weatherTool.execute({ context: { location: mockLocation } }))
         .rejects
         .toThrow(fetchError);

       expect(mockFetch).toHaveBeenCalledTimes(2);
     });

     // Test for non-ok response (requires adding response.ok checks in weather.ts)
     /*
     it('should throw error if geocoding API returns non-ok status', async () => {
       mockFetch.mockResolvedValueOnce({ ok: false, status: 500, statusText: 'Server Error' } as Response);

       await expect(weatherTool.execute({ context: { location: mockLocation } }))
         .rejects
         .toThrow('Geocoding API request failed with status 500'); // Requires error handling in getWeather

       expect(mockFetch).toHaveBeenCalledTimes(1);
     });

     it('should throw error if weather API returns non-ok status', async () => {
       mockFetch
         .mockResolvedValueOnce({ ok: true, json: async () => mockGeocodingData } as Response) // Geocoding OK
         .mockResolvedValueOnce({ ok: false, status: 503, statusText: 'Service Unavailable' } as Response); // Weather API Error

       await expect(weatherTool.execute({ context: { location: mockLocation } }))
         .rejects
         .toThrow('Weather API request failed with status 503'); // Requires error handling in getWeather

       expect(mockFetch).toHaveBeenCalledTimes(2);
     });
     */
  });

  describe('getWeatherCondition', () => {
    it('should return correct condition for known codes', () => {
      expect(getWeatherCondition(0)).toBe('Clear sky');
      expect(getWeatherCondition(3)).toBe('Overcast');
      expect(getWeatherCondition(61)).toBe('Slight rain');
      expect(getWeatherCondition(73)).toBe('Moderate snow fall');
      expect(getWeatherCondition(95)).toBe('Thunderstorm');
    });

    it('should return "Unknown" for unknown codes', () => {
      expect(getWeatherCondition(999)).toBe('Unknown');
      expect(getWeatherCondition(-1)).toBe('Unknown');
      expect(getWeatherCondition(10)).toBe('Unknown'); // Example of an unmapped code
    });
  });
});
