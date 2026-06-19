export interface JwtPayload {
  id: string;
  email: string;
  tenant?: string;
  role?: string;
}
export declare const generateToken: (payload: JwtPayload) => string;
export declare const verifyToken: (token: string) => JwtPayload | null;
export declare const decodeToken: (token: string) => JwtPayload | null;
