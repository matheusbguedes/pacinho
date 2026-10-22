export type JwtPayload = {
  sub: string;
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: string;
};
