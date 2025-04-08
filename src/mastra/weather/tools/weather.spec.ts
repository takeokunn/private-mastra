import { describe, expect, it, vi, beforeEach } from "vitest";
import { z } from "zod";

import { weatherTool } from "./index";
import * as fetcherModule from "../utils/fetcher";

describe("Weather Tool", () => {
  describe("weatherTool configuration", () => {
    it("should have correct id and description", () => {
      expect(weatherTool.id).toBe("get-weather");
      expect(weatherTool.description).toBe("Get current weather for a location");
    });

    it("should have correct input schema", () => {
      expect(weatherTool.inputSchema).toBeInstanceOf(z.ZodObject);
      const parseResult = weatherTool.inputSchema?.safeParse({
        location: "Tokyo",
      });
      expect(parseResult?.success).toBe(true);
      const invalidResult = weatherTool.inputSchema?.safeParse({
        loc: "Tokyo",
      });
      expect(invalidResult?.success).toBe(false);
    });

    it("should have correct output schema", () => {
      expect(weatherTool.outputSchema).toBeInstanceOf(z.ZodObject);
      const parseResult = weatherTool.outputSchema?.safeParse({
        temperature: 15,
        feelsLike: 14,
        humidity: 60,
        windSpeed: 10,
        windGust: 15,
        conditions: "Cloudy",
        location: "Tokyo",
      });
      expect(parseResult?.success).toBe(true);
    });
  });

  describe("weatherTool.execute", () => {
    beforeEach(() => {
      vi.restoreAllMocks();
    });

    it("should call getWeather with location and return weather data", async () => {
      const mockWeather = {
        temperature: 20,
        feelsLike: 19,
        humidity: 60,
        windSpeed: 5,
        windGust: 10,
        conditions: "Mainly clear",
        location: "Tokyo, Japan",
      };
      const spy = vi.spyOn(fetcherModule, "getWeather").mockResolvedValue(mockWeather);

      const result = await weatherTool.execute!({
        context: { location: "Tokyo" },
      } as any);

      expect(spy).toHaveBeenCalledWith("Tokyo");
      expect(result).toEqual(mockWeather);
    });

    it("should throw if getWeather throws", async () => {
      const error = new Error("API error");
      vi.spyOn(fetcherModule, "getWeather").mockRejectedValue(error);

      await expect(
        weatherTool.execute!({
          context: { location: "Tokyo" },
        } as any),
      ).rejects.toThrow(error);
    });
  });
});
