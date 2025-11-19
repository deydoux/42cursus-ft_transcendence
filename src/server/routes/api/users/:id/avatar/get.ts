import {FastifyReply, FastifyRequest} from 'fastify';
import {FastifyPluginAsyncJsonSchemaToTs} from '@fastify/type-provider-json-schema-to-ts';
import {idParamsSchema as schema} from '#lib/schemas';

const defaultAvatars = [
  'aggretsuko',
  'badtz_maru',
  'bonbonribbon',
  'charmmy_kitty',
  'chococat',
  'cinnamoroll',
  'cogimyun',
  'corocorokuririn',
  'dear_daniel',
  'dokidoki_yummy_chums',
  'goropikadon',
  'gudetama',
  'hangyodon',
  'hk_and_friends',
  'keroppi',
  'kirimichan',
  'kuromi',
  'little_twin_stars',
  'marron_cream',
  'mimmy',
  'minna_no_tabo',
  'monkichi',
  'my_melody',
  'my_sweet_piano',
  'pandapple',
  'patty_jimmy',
  'pekkle',
  'pochacco',
  'pompompurin',
  'spottie_dottie',
  'tuxedosam',
  'wish_me_mell',
];

const getDefaultAvatar = (id: number) =>
  `/static/avatars/${defaultAvatars[id % defaultAvatars.length]}.webp`;

const handleError = (
  request: FastifyRequest,
  reply: FastifyReply,
  code: number,
) =>
  reply.redirect(getDefaultAvatar((request.params as {id: number}).id), code);

const plugin: FastifyPluginAsyncJsonSchemaToTs = async server => {
  if (server.prod)
    await server.register(import('@fastify/static'), {
      root: server.paths.avatars,
    });

  server.setNotFoundHandler((request, reply) =>
    handleError(request, reply, 301),
  );

  server.setErrorHandler((_, request, reply) =>
    handleError(request, reply, 302),
  );

  server.get('/*', {schema}, async (request, reply) => {
    const {id} = request.params;
    return reply.sendFile(`${id}.webp`, server.paths.avatars);
  });
};

export default plugin;
