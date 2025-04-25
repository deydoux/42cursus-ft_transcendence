import {FastifyPluginAsync, errorCodes} from 'fastify';
import capitalize from '#lib/capitalize';

function schemaErrorMessageFormatter(
  field: string,
  keyword: string,
  params: FastifySchemaValidationErrorParams,
) {
  const templates: Record<
    string,
    (params: FastifySchemaValidationErrorParams) => string
  > = {
    required: () => 'field is required',
    type: params => `must be a ${params.type}`,
    minLength: params => `length must be at least ${params.limit} characters`,
    maxLength: params => `length must not exceed ${params.limit} characters`,
    pattern: params => `must match the pattern ${params.pattern}`,
  };

  const template = templates[keyword];
  if (!template) return;

  return `${capitalize(field)} ${template(params)}`;
}

const plugin: FastifyPluginAsync = async server => {
  server.setSchemaErrorFormatter(errors => {
    const error = errors[0];
    if (!error) throw errorCodes.FST_ERR_VALIDATION();

    const {keyword} = error;
    const params: FastifySchemaValidationErrorParams = error.params;
    const field = error.instancePath
      ? error.instancePath.slice(1)
      : (params.missingProperty as string) || 'field';

    const message = schemaErrorMessageFormatter(field, keyword, params);

    throw {...errorCodes.FST_ERR_VALIDATION(message), field};
  });
};

export default plugin;
