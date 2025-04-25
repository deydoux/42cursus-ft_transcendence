export const password = {
  type: 'string',
  minLength: 8,
  maxLength: 1024,
  pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9]).+$',
} as const;

export const username = {
  type: 'string',
  minLength: 3,
  maxLength: 16,
  pattern: '^[a-zA-Z0-9_]+$',
} as const;
