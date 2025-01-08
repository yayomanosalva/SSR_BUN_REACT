import { z } from 'zod';

const mimeTypesSchema = z.record(z.string(), z.string());

const envSchema = z.object({
  REACT_APP_API_URL: z.string().url(),
  MIME_TYPES: mimeTypesSchema.default({
    '.js': 'application/javascript',
    '.jsx': 'application/javascript',
    '.ts': 'application/javascript',
    '.tsx': 'application/javascript',
    '.css': 'text/css',
    '.html': 'text/html',
  }),
});

const env = envSchema.safeParse(process.env);

if (!env.success) {
  console.error('Invalid environment variables:', env.error.flatten().fieldErrors);
  process.exit(1);
}

export const ENV = env.data;