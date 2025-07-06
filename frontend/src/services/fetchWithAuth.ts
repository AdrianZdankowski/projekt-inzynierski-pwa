import { refreshToken as refreshTokenRequest } from "../services/authService";
import { getAccessToken, getRefreshToken, setTokens, logout } from "../context/tokenUtils";

export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  let accessToken = getAccessToken();
  let response = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (response.status !== 401) return response;

  // 401 Unauthorized – próba odświeżenia tokenów
  try {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
        logout();
        throw new Error("Refresh token is null");
    }
    const refreshed = await refreshTokenRequest(refreshToken);
    setTokens(refreshed);
    accessToken = refreshed.accessToken;

    // Ponowne żądanie z nowym access token
    const retryResponse = await fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    return retryResponse;
  } catch (error) {
    logout();
    throw new Error("Token refresh failed");
  }
};
