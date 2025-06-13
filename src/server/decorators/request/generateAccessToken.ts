import {FastifyPluginAsync} from 'fastify';
import SQL from 'sql-template-strings';

let it = 0;

const plugin: FastifyPluginAsync = async server => {
  server.decorateRequest(
    'generateAccessToken',
    async function (id, scope = '*') {
      const accessToken = server.jwt.sign({
        type: 'access',
        scope,
        id,
        it: ++it,
      });

      const {ip, headers, connection} = this;
      const userAgent = headers['user-agent'] || null;

      if (connection)
        await server.db.run(SQL`
          UPDATE connections
          SET ip = ${ip}, user_agent = ${userAgent}, access_token = ${accessToken}
          WHERE id = ${connection}
        `);
      else if (scope !== '*')
        await server.db.run(SQL`
          INSERT INTO connections(user_id, ip, user_agent, access_token)
          VALUES(${id}, ${ip}, ${userAgent}, ${accessToken})
        `);

      return accessToken;
    },
  );
};

export default plugin;
