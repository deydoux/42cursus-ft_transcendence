const avatar = {
  type: 'string',
  default: '/static/default_avatar.webp',
};

const httpError = {
  404: (message = 'Not Found') => ({
    description: 'not found',
    type: 'object',
    properties: {
      statusCode: {const: 404},
      error: {const: 'Not Found'},
      message: {const: message},
    },
  }),
};

export const idParamsSchema = {
  params: {
    type: 'object',
    properties: {
      id: {type: 'number'},
    },
    required: ['id'],
  } as const,
};

const password = {
  type: 'string',
  minLength: 8,
  maxLength: 1024,
  pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9]).+$',
} as const;

const username = {
  type: 'string',
  minLength: 3,
  maxLength: 16,
  pattern: '^[a-zA-Z0-9_]+$',
} as const;

export default {
  avatar,
  httpError,
  idParamsSchema,
  password,
  username,
};
