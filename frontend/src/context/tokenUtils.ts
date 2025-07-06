export const getAccessToken = () => localStorage.getItem("accessToken");
export const getRefreshToken = () => localStorage.getItem("refreshToken");

export const setTokens = ({ accessToken, refreshToken }: { accessToken: string; refreshToken: string }) => {
  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("refreshToken", refreshToken);
};

export const logout = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
};
