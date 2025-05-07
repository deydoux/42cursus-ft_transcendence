import '@fastify/jwt';

interface jwtDataBase {
  id: number;
  type: 'access' | 'refresh' | 'login';
  it: number;
}

type jwtData =
  | jwtDataBase
  | (jwtDataBase & {
      type: 'signup';
      nickname: string;
      avatar: string;
    });

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: jwtData;
    user: jwtData;
  }
}
