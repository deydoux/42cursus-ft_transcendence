import '@fastify/jwt';
// import {FastifyJWT} from '@fastify/jwt';

type JWTData = {
  id: number;
  type: 'access' | 'refresh';
  it: number;
};

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: JWTData;
    user: JWTData;
  }
}
