import {FastifyPluginAsync} from 'fastify';
import SQL from 'sql-template-strings';

const {JWT_REFRESH_EXPIRES_IN} = process.env;
let it = 0;

const plugin: FastifyPluginAsync = async server => {
  const generateRefreshToken = (id: number) => {
    const expiresIn =
      JWT_REFRESH_EXPIRES_IN && server.dev ? JWT_REFRESH_EXPIRES_IN : '30d';

    return server.jwt.sign({type: 'refresh', id, it: ++it}, {expiresIn});
  };

  server.decorateRequest('generateTokens', async function (id) {
    const refreshToken = generateRefreshToken(id);
    const accessToken = await this.generateAccessToken(id);

    const {session} = this;
    const userAgent = this.headers['user-agent'] || '';

    if (session)
      await server.db.run(SQL`
        UPDATE sessions
        SET user_agent = ${userAgent}, access_token = ${accessToken},
            refresh_token = ${refreshToken}
        WHERE id = ${session}
      `);
    else
      await server.db.run(SQL`
        INSERT INTO sessions(user_id, user_agent, access_token, refresh_token)
        VALUES(${id}, ${userAgent}, ${accessToken}, ${refreshToken})
      `);

    return {accessToken, refreshToken};
  });
};

export default plugin;
