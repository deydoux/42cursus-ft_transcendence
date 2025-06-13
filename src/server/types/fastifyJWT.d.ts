import '@fastify/jwt';

interface JWTData {
  type: 'access' | 'refresh';
  scope?: string;
  id: number;
  it: number;
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: JWTData;
    user: JWTData;
  }
}
