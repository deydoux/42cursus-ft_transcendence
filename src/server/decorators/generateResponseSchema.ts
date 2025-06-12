import {FastifyPluginAsync} from 'fastify';
import status from 'http-status';

const responseFields: Record<string, object> = {
  avatar: {
    type: 'string',
    default: '/static/default_avatar.webp',
  },
  id: {example: 1},
  passwordEditedAt: {format: 'date-time'},
  totp: {default: false},
  username: {example: 'user123'},
};

const plugin: FastifyPluginAsync = async server => {
  server.decorate('generateResponseSchema', (code, fields, description) => {
    const statusMessage = (status as unknown as string[])[code];

    if (!description) {
      if (200 <= code && code <= 299) description = 'Successful operation';
      else description = statusMessage;
    }

    const properties: Record<string, object> = {};

    if (400 <= code && code <= 499) {
      properties.statusCode = {const: code};
      properties.error = {const: statusMessage};
      properties.message = {const: description};
    }

    fields.forEach(field => (properties[field] = responseFields[field]));

    return {
      [code]: {
        description,
        type: 'object',
        properties,
      },
    };
  });
};

export default plugin;
