import {FastifyPluginAsync} from 'fastify';
import SQL from 'sql-template-strings';

let it = 0;

const plugin: FastifyPluginAsync = async server => {
  const generateRefreshToken = (id: number) =>
    server.jwt.sign({type: 'refresh', id, it: ++it}, {expiresIn: '30d'});

  server.decorateRequest('generateTokens', async function (id) {
    const refreshToken = generateRefreshToken(id);
    const accessToken = await this.generateAccessToken(id);

    const {ip, connection} = this;
    const userAgent = this.headers['user-agent'] || null;

    if (connection)
      await server.db.run(SQL`
        UPDATE connections
        SET ip = ${ip}, user_agent = ${userAgent}, access_token = ${accessToken},
            refresh_token = ${refreshToken}
        WHERE id = ${connection}
      `);
    else
      await server.db.run(SQL`
        INSERT INTO connections(user_id, ip, user_agent, access_token,
                    refresh_token)
        VALUES(${id}, ${ip}, ${userAgent}, ${accessToken}, ${refreshToken})
      `);

    return {accessToken, refreshToken};
  });
};

export default plugin;
