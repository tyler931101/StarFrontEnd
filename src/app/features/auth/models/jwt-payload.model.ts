export interface JwtPayload {
    id: string;
    role: string;
    exp: number;
    email: string;
}