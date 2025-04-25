import '@fastify/jwt';

interface jwtData {
  id: number;
  type: 'access' | 'refresh';
  it: number;
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: jwtData;
    user: jwtData;
  }
}
