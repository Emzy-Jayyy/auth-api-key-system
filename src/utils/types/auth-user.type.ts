export interface JwtPayload {
  userId: string;
  email: string;
}

export interface ApiKeyPayload {
  userId: string;
  keyId: string;
  type: 'api-key';
}

export type AuthUser = JwtPayload | ApiKeyPayload;
