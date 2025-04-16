import {FastifyPluginAsync} from 'fastify';
import fp from 'fastify-plugin';
import SQL from 'sql-template-strings';

const plugin: FastifyPluginAsync = async server => {
  server.decorate('generateTokens', async (userId: number) => {
    const refreshToken = server.jwt.sign(
      {id: userId, type: 'refresh'},
      {expiresIn: '30d'},
    );

    const accessToken = server.jwt.sign({id: userId, type: 'access'});

    await server.db.run(
      SQL`INSERT INTO tokens (refresh, access, user_id) VALUES (${refreshToken}, ${accessToken}, ${userId})`,
    );

    return {accessToken, refreshToken};
  });
};

export default fp(plugin);
