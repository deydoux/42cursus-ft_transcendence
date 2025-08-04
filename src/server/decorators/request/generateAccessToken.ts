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

      const {ip, headers, session} = this;
      const userAgent = headers['user-agent'] || null;

      if (session)
        await server.db.run(SQL`
          UPDATE sessions
          SET ip = ${ip}, user_agent = ${userAgent}, access_token = ${accessToken}
          WHERE id = ${session}
        `);
      else if (scope !== '*')
        await server.db.run(SQL`
          INSERT INTO sessions(user_id, ip, user_agent, access_token)
          VALUES(${id}, ${ip}, ${userAgent}, ${accessToken})
        `);

      return accessToken;
    },
  );
};

export default plugin;
