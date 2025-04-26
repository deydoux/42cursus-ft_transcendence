interface FastifySchemaValidationErrorParams {
  limit?: number;
  missingProperty?: string;
  pattern?: string;
  type?: string;
  [key: string]: unknown;
}
