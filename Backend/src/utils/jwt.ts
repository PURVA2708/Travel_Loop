import jwt from 'jsonwebtoken';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'globetrotter_default_access_secret_2026';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'globetrotter_default_refresh_secret_2026';

export const signAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, ACCESS_SECRET, {
    expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN || '1d') as jwt.SignOptions['expiresIn'],
  });
};

export const signRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, REFRESH_SECRET, {
    expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'],
  });
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, ACCESS_SECRET) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, REFRESH_SECRET) as TokenPayload;
};
