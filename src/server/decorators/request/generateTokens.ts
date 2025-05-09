import {FastifyPluginAsync} from 'fastify';
import SQL from 'sql-template-strings';

let it = 0;

const plugin: FastifyPluginAsync = async server => {
  const generateRefreshToken = (id: number) =>
    server.jwt.sign({type: 'refresh', id, it: ++it}, {expiresIn: '30d'});

  server.decorateRequest('generateTokens', async function (id) {
    const refreshToken = generateRefreshToken(id);
    const accessToken = await this.generateAccessToken(id);

    const {ip} = this;
    const userAgent = this.headers['user-agent'] || null;

    await server.db.run(
      SQL`INSERT INTO connections(user_id, ip, user_agent, access_token, refresh_token) VALUES(${id}, ${ip}, ${userAgent}, ${accessToken}, ${refreshToken})`,
    );

    return {accessToken, refreshToken};
  });
};

export default plugin;
