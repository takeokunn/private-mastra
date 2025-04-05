import { describe, it, expect, vi, beforeEach } from 'vitest';
import { z } from 'zod';

import { weatherTool } from './weather';
import type { GeocodingResponse, WeatherResponse } from './weather';

const mockFetch = vi.fn();
global.fetch = mockFetch;

const createMockResponse = (data: unknown, ok: boolean = true, status: number = 200): globalThis.Response => ({
    ok,
    status,
    json: async () => data,
} as globalThis.Response);


describe('Weather Tool (src/mastra/tools/weather.ts)', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('weatherTool configuration', () => {
    it('should have correct id and description', () => {
      expect(weatherTool.id).toBe('get-weather');
      expect(weatherTool.description).toBe('Get current weather for a location');
    });

    it('should have correct input schema', () => {
      expect(weatherTool.inputSchema).toBeInstanceOf(z.ZodObject);
      const parseResult = weatherTool.inputSchema?.safeParse({ location: 'Tokyo' });
      expect(parseResult?.success).toBe(true);
      const invalidResult = weatherTool.inputSchema?.safeParse({ loc: 'Tokyo' });
      expect(invalidResult?.success).toBe(false);
    });

    it('should have correct output schema', () => {
      expect(weatherTool.outputSchema).toBeInstanceOf(z.ZodObject);
      const parseResult = weatherTool.outputSchema?.safeParse({
        temperature: 15, feelsLike: 14, humidity: 60, windSpeed: 10, windGust: 15, conditions: 'Cloudy', location: 'Tokyo'
      });
      expect(parseResult?.success).toBe(true);
    });
  });

  describe('weatherTool.execute', () => {
    const mockLocation = 'London';
    const mockGeocodingData: GeocodingResponse = {
      results: [{ latitude: 51.5074, longitude: -0.1278, name: 'London, UK' }],
    };
    const mockWeatherData: WeatherResponse = {
      current: {
        time: '2025-04-06T10:00',
        temperature_2m: 12.5,
        apparent_temperature: 11.0,
        relative_humidity_2m: 75,
        wind_speed_10m: 15.0,
        wind_gusts_10m: 20.0,
        weather_code: 61,
      },
    };

    it('should execute successfully with valid location', async () => {
      mockFetch
        .mockResolvedValueOnce(createMockResponse(mockGeocodingData))
        .mockResolvedValueOnce(createMockResponse(mockWeatherData));

      const result = await weatherTool.execute?.({ context: { location: mockLocation } });

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(mockFetch).toHaveBeenNthCalledWith(1, `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(mockLocation)}&count=1`);
      expect(mockFetch).toHaveBeenNthCalledWith(2, expect.stringContaining(`https://api.open-meteo.com/v1/forecast?latitude=${mockGeocodingData.results[0].latitude}&longitude=${mockGeocodingData.results[0].longitude}`));
      expect(result).toEqual({
        temperature: 12.5,
        feelsLike: 11.0,
        humidity: 75,
        windSpeed: 15.0,
        windGust: 20.0,
        conditions: 'Slight rain',
        location: 'London, UK',
      });
    });

    it('should throw error if location is not found', async () => {
      const mockNotFoundLocation = 'NonExistentPlace';
      const mockNotFoundGeocodingData: GeocodingResponse = { results: [] };

      mockFetch.mockResolvedValueOnce(createMockResponse(mockNotFoundGeocodingData));

      await expect(weatherTool.execute?.({ context: { location: mockNotFoundLocation } }))
        .rejects
        .toThrow(`Location '${mockNotFoundLocation}' not found`);

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(mockNotFoundLocation)}&count=1`);
    });

    it('should throw error if geocoding API fetch fails', async () => {
       const fetchError = new Error('Network Error');
       mockFetch.mockRejectedValueOnce(fetchError);

       await expect(weatherTool.execute?.({ context: { location: mockLocation } }))
         .rejects
         .toThrow(fetchError);

       expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });
});
