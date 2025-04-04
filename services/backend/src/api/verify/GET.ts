import {FastifyInstance, RouteShorthandOptions} from 'fastify';

export default function (server: FastifyInstance) {
  const options: RouteShorthandOptions = {
    onRequest: [server.authenticate],
  };

  server.get('/', options, (request, reply) => {
    const {user} = request;
    return reply.send({user});
  });
}
