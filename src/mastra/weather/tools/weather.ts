import { createTool } from "@mastra/core/tools";
import { z } from "zod";

import type { WeatherToolResponse } from "../types";
import { getWeather } from "../utils/fetcher";

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
