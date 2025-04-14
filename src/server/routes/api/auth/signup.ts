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

const plugin: FastifyPluginAsyncJsonSchemaToTs = async server => {
  function formatValidationError(error: ValidationError) {
    if (!error) return;

    const validation = error.validation[0];
    const {params} = validation;
    const field = validation.instancePath
      ? validation.instancePath.slice(1)
      : params.missingProperty;

    server.log.trace(`Validation error: ${JSON.stringify(validation)}`);

    let message = capitalize(`${field} field `);

    switch (validation.keyword) {
      case 'required':
        message += 'is required';
        break;
      case 'type':
        message += `should be ${params.type}`;
        break;
      case 'minLength':
        message += `should be at least ${params.limit} characters`;
        break;
      case 'maxLength':
        message += `should be at most ${params.limit} characters`;
        break;
      case 'pattern':
        if (field === 'username') {
          message +=
            'should only contain alphanumeric characters and underscores';
        } else if (field === 'password') {
          message +=
            'should contain at least one uppercase letter, one lowercase letter, one number, and one special character';
        } else {
          message += `should match the pattern ${params.pattern}`;
        }
        break;
      default:
        throw error;
    }

    error.message = message;
    throw error;
  }

  async function checkUsername(username: string) {
    const user = await server.db.get(
      sql`SELECT * FROM users WHERE username = ${username}`,
    );

    if (!user) return;

    const error = errorCodes.FST_ERR_VALIDATION('Username already taken');
    error.statusCode = 409;
    throw error;
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

      return reply.send({success: true, id});
    },
  );
};

export default fp(plugin);
