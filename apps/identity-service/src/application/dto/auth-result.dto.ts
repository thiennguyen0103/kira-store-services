export interface AuthTokensResult {
  identityId: string;
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface RegisterResult {
  identityId: string;
  email: string;
  status: string;
  message: string;
}
