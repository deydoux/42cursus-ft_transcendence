import '@fastify/jwt';

interface jwtData {
  id: number;
  type: 'access' | 'partial' | 'refresh';
  it: number;
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: jwtData;
    user: jwtData;
  }
}
