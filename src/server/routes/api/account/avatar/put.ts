import {FastifyPluginAsync} from 'fastify';

const plugin: FastifyPluginAsync = async server => {
  await server.register(import('@fastify/multipart'), {
    limits: {
      files: 1,
      fields: 0,
      fileSize: 5 * 1024 * 1024, // 5MB
    },
  });

  server.put('/', async (request, reply) => {
    const data = await request.file();
    if (!data) return reply.badRequest('No file uploaded');

    if (!data.mimetype.startsWith('image/'))
      return reply.unsupportedMediaType('File type not supported');

    if (data.file.truncated)
      throw {
        ...server.multipartErrors.FilesLimitError(),
        message: 'File too large (max 5MB)',
      };

    const {id} = request.user;
    const buffer = await data.toBuffer();

    await server.storeAvatar(id, buffer);

    return reply.code(204).send();
  });
};

export default plugin;
