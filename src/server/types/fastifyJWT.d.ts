import '@fastify/jwt';

interface JWTDataBase {
  type: 'access' | 'refresh' | 'login';
  id: number;
  it: number;
}

interface JWTDataSignup {
  type: 'signup';
  id: string;
  avatar: string;
  it: number;
}

type JWTData = JWTDataBase | JWTDataSignup;

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: JWTData;
    user: JWTDataBase;
  }
}
