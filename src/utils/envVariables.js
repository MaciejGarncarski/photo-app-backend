import { z } from 'zod';

export const envVariablesSchema = z.object({
  DATABASE_URL: z.string(),
  SECRET: z.string(),
  IMG_KIT_PRIVATE: z.string(),
  IMG_KIT_PUBLIC: z.string(),
  IMG_KIT_ENDPOINT: z.string(),
  APP_URL: z.string().url(),
  BACKEND_URL: z.string().url(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
});

/**
 * @type {{ [k in keyof z.infer<typeof envVariablesSchema>]: z.infer<typeof envVariablesSchema>[k] }}
 */
export const envVariables = {
  DATABASE_URL: process.env.DATABASE_URL,
  SECRET: process.env.SECRET,
  IMG_KIT_PRIVATE: process.env.IMG_KIT_PRIVATE,
  IMG_KIT_PUBLIC: process.env.IMG_KIT_PUBLIC,
  IMG_KIT_ENDPOINT: process.env.IMG_KIT_ENDPOINT,
  APP_URL: process.env.APP_URL,
  BACKEND_URL: process.env.BACKEND_URL,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
};
