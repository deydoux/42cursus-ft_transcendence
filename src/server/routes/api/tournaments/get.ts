import {FastifyPluginAsync} from 'fastify';
import SQL from 'sql-template-strings';
import serializeUserAvatar from '#lib/serializeUserAvatar';

const plugin: FastifyPluginAsync = async server => {
  server.get('/', async (request, reply) => {
    const tournaments = server.tournaments._ as {owner: {id: number}}[];

    let owners = [];

    const ownerIDs = tournaments.map(tournament => tournament.owner.id);
    if (ownerIDs.length > 0) {
      const query = SQL`
        SELECT id, username, has_avatar, avatar_version
        FROM users
        WHERE id IN (`;

      for (const [index, id] of ownerIDs.entries()) {
        if (index !== 0) query.append(SQL`, `);
        query.append(SQL`${id}`);
      }

      query.append(SQL`)`);

      owners = await server.db.all(query);
      owners.forEach(serializeUserAvatar);
    }

    for (const tournament of tournaments) {
      const owner = owners.find(owner => owner.id === tournament.owner.id);
      if (owner) tournament.owner = owner;
    }

    return reply.send(tournaments);
  });
};

export default plugin;
