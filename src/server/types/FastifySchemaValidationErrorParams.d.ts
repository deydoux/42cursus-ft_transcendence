interface FastifySchemaValidationErrorParams {
  missingProperty?: string;
  limit?: number;
  type?: string;
  pattern?: string;
  [key: string]: unknown;
}
