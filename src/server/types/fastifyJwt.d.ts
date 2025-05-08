import '@fastify/jwt';

interface jwtDataBase {
  type: 'access' | 'refresh' | 'login';
  id: number;
  it: number;
}

type jwtData =
  | jwtDataBase
  | {
      type: 'signup';
      id: string;
      avatar: string;
      it: number;
    };

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: jwtData;
    user: jwtDataBase;
  }
}
