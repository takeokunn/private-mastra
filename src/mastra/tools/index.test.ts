import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { weatherTool } from './index'; // getWeather と getWeatherCondition はエクスポートされていないため、直接テストは難しい
import { z } from 'zod';

// getWeather と getWeatherCondition をテスト可能にするために、一時的にエクスポートするか、
// このテストファイル内で同等の関数を再定義/インポートする必要があります。
// ここでは weatherTool の execute を通して間接的にテストします。

// fetch をモック
const mockFetch = vi.fn();
global.fetch = mockFetch;

// モックデータの型定義 (index.tsからコピーまたはインポート)
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

describe('Weather Tool', () => {
  beforeEach(() => {
    vi.resetAllMocks(); // 各テスト前にモックをリセット
  });

  it('should have correct schema definitions', () => {
    expect(weatherTool.id).toBe('get-weather');
    expect(weatherTool.description).toBe('指定された場所の現在の天気を取得します');
    // スキーマの形状を検証 (より詳細な検証も可能)
    expect(weatherTool.inputSchema).toBeInstanceOf(z.ZodObject);
    expect(weatherTool.outputSchema).toBeInstanceOf(z.ZodObject);
  });

  it('should execute successfully with valid location', async () => {
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

    // fetch のモックを設定
    mockFetch
      .mockResolvedValueOnce({ // Geocoding API
        ok: true,
        json: async () => mockGeocodingData,
      } as Response)
      .mockResolvedValueOnce({ // Weather API
        ok: true,
        json: async () => mockWeatherData,
      } as Response);

    const result = await weatherTool.execute({ context: { location: mockLocation } });

    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockFetch).toHaveBeenNthCalledWith(1, `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(mockLocation)}&count=1`);
    expect(mockFetch).toHaveBeenNthCalledWith(2, expect.stringContaining('https://api.open-meteo.com/v1/forecast'));
    expect(result).toEqual({
      temperature: 15.0,
      feelsLike: 14.0,
      humidity: 60,
      windSpeed: 10.0,
      windGust: 15.0,
      conditions: 'Overcast', // Code 3 maps to Overcast
      location: 'Tokyo',
    });
  });

  it('should throw error if location is not found', async () => {
    const mockLocation = 'InvalidCityName';
    const mockGeocodingData: GeocodingResponse = { results: [] }; // Empty results

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockGeocodingData,
    } as Response);

    await expect(weatherTool.execute({ context: { location: mockLocation } }))
      .rejects
      .toThrow(`Location '${mockLocation}' not found`);

    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

   it('should throw error if geocoding API fails', async () => {
    const mockLocation = 'Tokyo';

    mockFetch.mockResolvedValueOnce({
      ok: false, // Simulate API error
      status: 500,
    } as Response);

    await expect(weatherTool.execute({ context: { location: mockLocation } }))
      .rejects
      .toThrow('Geocoding API request failed with status 500');

    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

   it('should throw error if weather API fails', async () => {
    const mockLocation = 'Tokyo';
     const mockGeocodingData: GeocodingResponse = {
      results: [{ latitude: 35.6895, longitude: 139.6917, name: 'Tokyo' }],
    };

    mockFetch
      .mockResolvedValueOnce({ // Geocoding API (Success)
        ok: true,
        json: async () => mockGeocodingData,
      } as Response)
      .mockResolvedValueOnce({ // Weather API (Failure)
        ok: false,
        status: 503,
      } as Response);

    await expect(weatherTool.execute({ context: { location: mockLocation } }))
      .rejects
      .toThrow('Weather API request failed with status 503');

    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  // getWeatherCondition のテスト (直接呼び出せないので、ツール実行結果から間接的に検証)
  // または、テストのためにこの関数をエクスポートするか、ここで再定義します。
  // 例として、ここで簡単なテストケースを追加します。
  // function getWeatherCondition(code: number): string { ... } // index.tsからコピー
  // it('getWeatherCondition should return correct conditions', () => {
  //   expect(getWeatherCondition(0)).toBe('Clear sky');
  //   expect(getWeatherCondition(63)).toBe('Moderate rain');
  //   expect(getWeatherCondition(999)).toBe('不明');
  // });
});
