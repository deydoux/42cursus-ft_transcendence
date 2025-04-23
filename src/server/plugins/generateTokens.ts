import {FastifyPluginAsync} from 'fastify';
import SQL from 'sql-template-strings';
import fp from 'fastify-plugin';

const plugin: FastifyPluginAsync = async server => {
  let it = 0;

  const generateRefreshToken = (userId: number) =>
    server.jwt.sign(
      {id: userId, type: 'refresh', it: ++it},
      {expiresIn: '30d'},
    );

  server.decorateRequest(
    'generateAccessToken',
    async function (id: number, refreshToken?: string) {
      const accessToken = server.jwt.sign({id, type: 'access', it: ++it});

      if (refreshToken) {
        const {ip} = this;
        const userAgent = this.headers['user-agent'] || null;

        await server.db.run(
          SQL`UPDATE connections SET access_token = ${accessToken}, ip = ${ip}, user_agent = ${userAgent} WHERE refresh_token = ${refreshToken}`,
        );
      }

      return accessToken;
    },
  );

  server.decorateRequest('generateTokens', async function (id: number) {
    const refreshToken = generateRefreshToken(id);
    const accessToken = await this.generateAccessToken(id);

    const {ip} = this;
    const userAgent = this.headers['user-agent'] || null;

    await server.db.run(
      SQL`INSERT INTO connections(refresh_token, access_token, ip, user_agent, user_id) VALUES(${refreshToken}, ${accessToken}, ${ip}, ${userAgent}, ${id})`,
    );

    return {accessToken, refreshToken};
  });
};

export default fp(plugin);
