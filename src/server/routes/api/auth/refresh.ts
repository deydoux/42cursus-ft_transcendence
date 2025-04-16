import {FastifyPluginAsync} from 'fastify';
import fp from 'fastify-plugin';
import SQL from 'sql-template-strings';

const plugin: FastifyPluginAsync = async server => {
  server.post(
    '/api/auth/refresh',
    {onRequest: server.authenticateRefresh},
    async (request, reply) => {
      const {id} = request.user;
      const {refreshToken} = request.cookies;

      const accessToken = server.jwt.sign({id, type: 'access'});

      await server.db.run(
        SQL`UPDATE tokens SET access = ${accessToken} WHERE refresh = ${refreshToken}`,
      );

      return reply.send({accessToken}).code(201);
    },
  );
};

export default fp(plugin);
