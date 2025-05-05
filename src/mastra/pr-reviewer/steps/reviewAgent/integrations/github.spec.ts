import { describe, it, expect, vi } from "vitest";
import { tool } from "./github";
import { GithubIntegration } from "@mastra/github";

// Mock the GithubIntegration class and its methods
const mockGitGetRef = vi.fn();
const mockGetApiClient = vi.fn().mockResolvedValue({
  gitGetRef: mockGitGetRef,
});

vi.mock("@mastra/github", () => {
  // Mock the constructor and methods
  const MockGithubIntegration = vi.fn().mockImplementation(() => ({
    getApiClient: mockGetApiClient,
  }));
  return { GithubIntegration: MockGithubIntegration };
});

// Mock environment variable
vi.stubEnv("GITHUB_TOKEN", "test-token");

describe("github integration tool", () => {
  it("should have the correct id and description", () => {
    expect(tool.id).toBe("github-integration");
    expect(tool.description).toBe(""); // Assuming description is empty as per the source
  });

  it("should call GithubIntegration constructor with correct config", () => {
    // The constructor is called when the module is imported.
    // We check if it was called with the expected environment variable.
    expect(GithubIntegration).toHaveBeenCalledWith({
      config: {
        PERSONAL_ACCESS_TOKEN: "test-token",
      },
    });
  });

  it("should execute successfully and return the ref", async () => {
    const inputContext = {
      owner: "test-owner",
      repo: "test-repo",
      ref: "heads/main", // Example ref string
    };

    const mockApiResponse = {
      data: {
        ref: "refs/heads/main", // Example response ref
        // other properties...
      },
      // other response properties...
    };
    mockGitGetRef.mockResolvedValue(mockApiResponse);

    const result = await tool.execute({ context: inputContext });

    // Verify getApiClient was called
    expect(mockGetApiClient).toHaveBeenCalled();

    // Verify gitGetRef was called with correct parameters
    expect(mockGitGetRef).toHaveBeenCalledWith({
      path: {
        owner: inputContext.owner,
        repo: inputContext.repo,
        ref: inputContext.ref,
      },
    });

    // Verify the result
    expect(result).toEqual({ ref: mockApiResponse.data.ref });
  });

  it("should handle API errors gracefully (e.g., ref not found)", async () => {
    const inputContext = {
      owner: "test-owner",
      repo: "test-repo",
      ref: "heads/nonexistent",
    };

    // Simulate an error from the API call
    const apiError = new Error("Ref not found");
    mockGitGetRef.mockRejectedValue(apiError);

    // Expect the execute function to throw or handle the error appropriately
    // Depending on the desired behavior, this might re-throw or return an error object.
    // Here, we assume it re-throws.
    await expect(tool.execute({ context: inputContext })).rejects.toThrow(
      "Ref not found",
    );

    // Verify mocks were called
    expect(mockGetApiClient).toHaveBeenCalled();
    expect(mockGitGetRef).toHaveBeenCalledWith({
      path: {
        owner: inputContext.owner,
        repo: inputContext.repo,
        ref: inputContext.ref,
      },
    });
  });

  it("should handle cases where API response data is null/undefined", async () => {
    const inputContext = {
      owner: "test-owner",
      repo: "test-repo",
      ref: "heads/main",
    };

    // Simulate API response with null data
    const mockApiResponse = {
      data: null, // or undefined
    };
    mockGitGetRef.mockResolvedValue(mockApiResponse);

    const result = await tool.execute({ context: inputContext });

    // The current implementation returns { ref: undefined } in this case.
    // Adjust expectation based on desired behavior.
    expect(result).toEqual({ ref: undefined });

    // Verify mocks were called
    expect(mockGetApiClient).toHaveBeenCalled();
    expect(mockGitGetRef).toHaveBeenCalledWith({
      path: {
        owner: inputContext.owner,
        repo: inputContext.repo,
        ref: inputContext.ref,
      },
    });
  });
});
