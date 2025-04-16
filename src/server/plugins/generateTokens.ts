import {FastifyPluginAsync} from 'fastify';
import fp from 'fastify-plugin';
import SQL from 'sql-template-strings';

const plugin: FastifyPluginAsync = async server => {
  let it = 0;

  const generateRefreshToken = (userId: number) =>
    server.jwt.sign(
      {id: userId, type: 'refresh', it: ++it},
      {expiresIn: '30d'},
    );

  server.decorate('generateAccessToken', (userId: number) =>
    server.jwt.sign({id: userId, type: 'access', it: ++it}),
  );

  server.decorate('generateTokens', async (userId: number) => {
    const refreshToken = generateRefreshToken(userId);
    const accessToken = server.generateAccessToken(userId);

    await server.db.run(
      SQL`INSERT INTO tokens (refresh, access, user_id) VALUES (${refreshToken}, ${accessToken}, ${userId})`,
    );

    return {accessToken, refreshToken};
  });
};

export default fp(plugin);
