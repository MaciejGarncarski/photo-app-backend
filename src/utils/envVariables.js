import { Type } from '@sinclair/typebox';

export const envVariablesSchema = Type.Object({
  DATABASE_URL: Type.String(),
  SECRET: Type.String(),
  IMG_KIT_PRIVATE: Type.String(),
  IMG_KIT_PUBLIC: Type.String(),
  IMG_KIT_ENDPOINT: Type.String(),
  APP_URL: Type.String({ format: 'uri' }),
  BACKEND_URL: Type.String({ format: 'uri' }),
  GOOGLE_CLIENT_ID: Type.String(),
  GOOGLE_CLIENT_SECRET: Type.String(),
  PRODUCTION: Type.String(),
});

/**
 * @type {{ [k in keyof Static<typeof envVariablesSchema>]: Static<typeof envVariablesSchema>[k] }}
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
  PRODUCTION: process.env.PRODUCTION,
};
