interface ValidationErrorItemParams {
  missingProperty?: string;
  limit?: number;
  type?: string;
  pattern?: string;
  [key: string]: unknown;
}

interface ValidationErrorItem {
  instancePath: string;
  schemaPath: string;
  keyword: string;
  params: ValidationErrorItemParams;
  message: string;
}

type ValidationError =
  | (Error & {
      validation: ValidationErrorItem[];
      validationContext: string;
    })
  | undefined;
