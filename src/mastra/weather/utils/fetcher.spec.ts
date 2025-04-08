import { beforeEach, describe, expect, it, vi } from "vitest";

import { weatherTool } from "../tools";
import type { GeocodingResponse, WeatherResponse } from "../types";

/**
 * mock
 */
const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockLocation = "London";
const mockGeocodingData: GeocodingResponse = {
  results: [{ latitude: 51.5074, longitude: -0.1278, name: "London, UK" }],
};
const mockWeatherData: WeatherResponse = {
  current: {
    time: "2025-04-06T10:00",
    temperature_2m: 12.5,
    apparent_temperature: 11.0,
    relative_humidity_2m: 75,
    wind_speed_10m: 15.0,
    wind_gusts_10m: 20.0,
    weather_code: 61,
  },
};

const createMockResponse = (data: unknown, ok = true, status = 200): globalThis.Response =>
  ({
    ok,
    status,
    json: async () => data,
  }) as globalThis.Response;

const mockNotFoundLocation = "NonExistentPlace";
const mockNotFoundGeocodingData: GeocodingResponse = { results: [] };

/**
 * test
 */
describe("Weather Tool", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("weatherTool.execute", () => {
    it("should execute successfully with valid location", async () => {
      mockFetch
        .mockResolvedValueOnce(createMockResponse(mockGeocodingData))
        .mockResolvedValueOnce(createMockResponse(mockWeatherData));

      const result = await weatherTool.execute?.({
        context: { location: mockLocation },
      });

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(mockFetch).toHaveBeenNthCalledWith(
        1,
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(mockLocation)}&count=1`,
      );
      expect(mockFetch).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining(
          `https://api.open-meteo.com/v1/forecast?latitude=${mockGeocodingData.results[0].latitude}&longitude=${mockGeocodingData.results[0].longitude}`,
        ),
      );
      expect(result).toEqual({
        temperature: 12.5,
        feelsLike: 11.0,
        humidity: 75,
        windSpeed: 15.0,
        windGust: 20.0,
        conditions: "Slight rain",
        location: "London, UK",
      });
    });

    it("should throw error if location is not found", async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse(mockNotFoundGeocodingData));

      await expect(weatherTool.execute?.({ context: { location: mockNotFoundLocation } })).rejects.toThrow(
        `Location '${mockNotFoundLocation}' not found`,
      );

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(mockNotFoundLocation)}&count=1`,
      );
    });

    it("should throw error if geocoding API fetch fails", async () => {
      const fetchError = new Error("Network Error");
      mockFetch.mockRejectedValueOnce(fetchError);

      await expect(weatherTool.execute?.({ context: { location: mockLocation } })).rejects.toThrow(fetchError);

      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });
});
