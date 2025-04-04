import {FastifyInstance, RouteShorthandOptions} from 'fastify';

const options: RouteShorthandOptions = {
  schema: {},
};

export default function (server: FastifyInstance) {
  server.get('', options, (request, reply) => {

  });
}
