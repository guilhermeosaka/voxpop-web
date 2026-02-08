
export interface PollOption {
  id: string;
  value: string;
  votes: number;
  hasVoted: boolean;
}

export enum VoteMode {
  SingleChoice = 1,
  MultipleChoice = 2
}

const CORE_API_URL = process.env.NEXT_PUBLIC_CORE_API_URL || "http://localhost:5001";
const IDENTITY_API_URL = process.env.NEXT_PUBLIC_IDENTITY_API_URL || "http://localhost:5002";

export interface Poll {
  id: string;
  question: string;
  voteMode: VoteMode;
  expiresAt: string | null;
  isClosed: boolean;
  createdAt: string;
  hasCreated: boolean;
  options: PollOption[];
}

export interface PollsResponse {
  items: Poll[];
}

export enum PollSortBy {
  CreatedAtDesc = 1,
  CreatedAtAsc = 2,
  TotalVotesDesc = 3,
  TotalVotesAsc = 4,
  ExpiresAtAsc = 5,
  ExpiresAtDesc = 6
}

export interface GetPollsParams {
  page?: number;
  pageSize?: number;
  sortBy?: PollSortBy;
  createdByMe?: boolean;
  votedByMe?: boolean;
  status?: number; // PollStatus enum
  voteMode?: VoteMode;
}

export async function fetchPolls(token?: string, params: GetPollsParams = {}): Promise<Poll[]> {
  try {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append("page", params.page.toString());
    if (params.pageSize) queryParams.append("pageSize", params.pageSize.toString());
    if (params.sortBy) queryParams.append("sortBy", params.sortBy.toString());
    if (params.createdByMe) queryParams.append("createdByMe", "true");
    if (params.votedByMe) queryParams.append("votedByMe", "true");
    if (params.status) queryParams.append("status", params.status.toString());
    if (params.voteMode) queryParams.append("voteMode", params.voteMode.toString());

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";
    let res: Response;

    if (token) {
      // Use authenticated fetch with auto-refresh
      res = await authenticatedFetch(`${CORE_API_URL}/polls${queryString}`, {
        method: "GET",
        cache: "no-store",
        token,
      });
    } else {
      // Anonymous fetch
      res = await fetch(`${CORE_API_URL}/polls${queryString}`, {
        cache: "no-store",
      });
    }
    if (!res.ok) {
      if (res.status === 503) {
        throw new Error("503");
      }
      throw new Error(`Failed to fetch polls: ${res.status}`);
    }

    const data: PollsResponse = await res.json();
    return data.items;
  } catch (error) {
    // Re-throw if it's our 503 error, otherwise log and return empty
    if (error instanceof Error && (error.message === "503" || error.message === "Failed to fetch")) {
      throw error;
    }
    console.error("Error fetching polls:", error);
    return [];
  }
}

export async function votePoll(pollId: string, optionId: string, token: string): Promise<void> {
  const res = await authenticatedFetch(`${CORE_API_URL}/polls/${pollId}/votes/${optionId}`, {
    method: "PUT",
    headers: {
      "Accept": "application/json"
    },
    token,
  });

  if (!res.ok) {
    throw new Error(`Failed to vote: ${res.status}`);
  }
}

export async function deleteVote(pollId: string, optionId: string, token: string): Promise<void> {
  const res = await authenticatedFetch(`${CORE_API_URL}/polls/${pollId}/votes/${optionId}`, {
    method: "DELETE",
    headers: {
      "Accept": "application/json"
    },
    token,
  });

  if (!res.ok) {
    throw new Error(`Failed to delete vote: ${res.status}`);
  }
}

export interface CreatePollRequest {
  question: string;
  expiresAt: string | null;
  voteMode: VoteMode;
  options: { value: string }[];
}

export async function createPoll(pollData: CreatePollRequest, token: string): Promise<Poll> {
  const res = await authenticatedFetch(`${CORE_API_URL}/polls`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(pollData),
    token,
  });

  if (!res.ok) {
    throw new Error(`Failed to create poll: ${res.status}`);
  }

  return res.json();
}

// Helper for authenticated requests with auto-refresh
async function authenticatedFetch(
  url: string,
  options: RequestInit & { token: string }
): Promise<Response> {
  const { token, ...fetchOptions } = options;

  // First attempt
  let res = await fetch(url, {
    ...fetchOptions,
    headers: {
      ...fetchOptions.headers,
      Authorization: `Bearer ${token}`,
    },
  });

  // If 401, try to refresh and retry once
  if (res.status === 401) {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    try {
      // Refresh tokens
      const newTokens = await refreshTokens(refreshToken);

      // Update localStorage
      localStorage.setItem("accessToken", newTokens.accessToken);
      localStorage.setItem("refreshToken", newTokens.refreshToken);

      // Retry original request with new token
      res = await fetch(url, {
        ...fetchOptions,
        headers: {
          ...fetchOptions.headers,
          Authorization: `Bearer ${newTokens.accessToken}`,
        },
      });
    } catch {
      // If refresh fails, clear auth and throw
      localStorage.removeItem("phoneNumber");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      throw new Error("Session expired. Please log in again.");
    }
  }

  return res;
}

// Authentication API
const AUTH_API_BASE = IDENTITY_API_URL;

export interface TokensResponse {
  accessToken: string;
  refreshToken: string;
}

export async function refreshTokens(refreshToken: string): Promise<TokensResponse> {
  const res = await fetch(`${AUTH_API_BASE}/tokens`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: refreshToken }),
  });

  if (!res.ok) {
    throw new Error(`Failed to refresh tokens: ${res.status}`);
  }

  return res.json();
}

export async function generateCode(target: string, channel: number = 1): Promise<void> {
  const res = await fetch(`${AUTH_API_BASE}/codes/otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ target, channel }),
  });

  if (!res.ok) {
    throw new Error(`Failed to generate code: ${res.status}`);
  }
}

export async function generateTokens(
  target: string,
  code: string,
  channel: number = 1
): Promise<TokensResponse> {
  const res = await fetch(`${AUTH_API_BASE}/tokens/otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ target, channel, code }),
  });

  if (!res.ok) {
    throw new Error(`Failed to generate tokens: ${res.status}`);
  }

  return res.json();
}
