import { describe, expect, it } from "vitest";
import { z } from "zod";

import { weatherTool } from "./index";

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
});
