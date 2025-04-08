import { beforeEach, describe, expect, it, vi } from "vitest";
import { getWeather } from "./fetcher";
import type { GeocodingResponse, WeatherResponse } from "../types";

const mockFetch = vi.fn();
global.fetch = mockFetch as any;

const mockLocation = "Tokyo";
const mockGeocodingData: GeocodingResponse = {
  results: [{ latitude: 35.68, longitude: 139.76, name: "Tokyo, Japan" }],
};
const mockWeatherData: WeatherResponse = {
  current: {
    time: "2025-04-08T12:00",
    temperature_2m: 20,
    apparent_temperature: 19,
    relative_humidity_2m: 60,
    wind_speed_10m: 5,
    wind_gusts_10m: 10,
    weather_code: 1,
  },
};

const createMockResponse = (data: unknown): Response =>
  ({
    ok: true,
    status: 200,
    json: async () => data,
  } as Response);

describe("getWeather", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("正常系: 緯度経度と天気を取得し整形して返す", async () => {
    mockFetch
      .mockResolvedValueOnce(createMockResponse(mockGeocodingData))
      .mockResolvedValueOnce(createMockResponse(mockWeatherData));

    const result = await getWeather(mockLocation);

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
      temperature: 20,
      feelsLike: 19,
      humidity: 60,
      windSpeed: 5,
      windGust: 10,
      location: "Tokyo, Japan",
      conditions: "Mainly clear",
    });
  });

  it("異常系: 地名が見つからない場合はエラー", async () => {
    mockFetch.mockResolvedValueOnce(createMockResponse({ results: [] }));

    await expect(getWeather("UnknownPlace")).rejects.toThrow("Location 'UnknownPlace' not found");
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("異常系: fetch が reject された場合はそのまま例外", async () => {
    const error = new Error("network error");
    mockFetch.mockRejectedValueOnce(error);

    await expect(getWeather("Tokyo")).rejects.toThrow(error);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});
