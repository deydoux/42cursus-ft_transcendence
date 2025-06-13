import '@fastify/jwt';

interface JWTData {
  type: 'access' | 'refresh' | 'login';
  id: number;
  it: number;
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: JWTData;
    user: JWTData;
  }
}
