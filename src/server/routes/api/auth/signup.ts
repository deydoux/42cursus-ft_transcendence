import {errorCodes} from 'fastify';
import {FastifyPluginAsyncJsonSchemaToTs} from '@fastify/type-provider-json-schema-to-ts';
import capitalize from '#lib/capitalize';
import fp from 'fastify-plugin';
import hash from '#lib/hash';
import sql from 'sql-template-strings';

type ValidationError =
  | (Error & {
      validation: any;
      validationContext: string;
    })
  | undefined;

const schema = {
  body: {
    type: 'object',
    properties: {
      username: {
        type: 'string',
        minLength: 3,
        maxLength: 16,
        pattern: '^[a-zA-Z0-9_]+$',
      },
      password: {
        type: 'string',
        minLength: 8,
        maxLength: 1024,
        pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^a-zA-Z0-9]).+$',
      },
    },
    required: ['username', 'password'],
    additionalProperties: false,
  } as const,
};

function formatValidationErrorMessage(
  field: string,
  keyword: string,
  params: any,
) {
  const details: {[key: string]: (params: any) => string} = {
    required: () => 'field is required',
    type: params => `must be a ${params.type}`,
    minLength: params => `length must be at least ${params.limit} characters`,
    maxLength: params => `length must not exceed ${params.limit} characters`,
    pattern: params => `must match the pattern ${params.pattern}`,
  };

  const detail = details[keyword];
  if (!detail) return;

  return `${capitalize(field)} ${detail(params)}`;
}

const plugin: FastifyPluginAsyncJsonSchemaToTs = async server => {
  function formatValidationError(error: ValidationError) {
    if (!error) return;

    const validation = error.validation[0];
    const {params} = validation;
    const field = validation.instancePath
      ? validation.instancePath.slice(1)
      : params.missingProperty;

    server.log.trace(`Validation error: ${JSON.stringify(validation)}`);

    const message = formatValidationErrorMessage(
      field,
      validation.keyword,
      params,
    );

    const customError: {message?: string; field?: string} = {};
    if (message) {
      customError.message = message;
      customError.field = field;
    }

    throw {...error, ...customError};
  }

  async function checkUsername(username: string) {
    const user = await server.db.get(
      sql`SELECT * FROM users WHERE LOWER(username) = LOWER(${username})`,
    );

    if (!user) return;

    const error = errorCodes.FST_ERR_VALIDATION('Username already taken');
    error.statusCode = 409;
    throw {...error, ...{field: 'username'}};
  }

  server.post(
    '/api/auth/signup',
    {schema, attachValidation: true},
    async (request, reply) => {
      formatValidationError(request.validationError);

      const {username} = request.body;
      await checkUsername(username);

      const password = hash(request.body.password);

      const {lastID: id} = await server.db.run(
        sql`INSERT INTO users (username, password) VALUES (${username}, ${password})`,
      );

      if (!id) throw new Error('Failed to create user');

      const {accessToken, refreshToken} = await server.generateTokens(id);

      return reply
        .setCookie('refreshToken', refreshToken)
        .send({accessToken})
        .code(201);
    },
  );
};

export default fp(plugin);
