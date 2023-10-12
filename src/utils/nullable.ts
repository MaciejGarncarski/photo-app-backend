import { TSchema, Type } from '@fastify/type-provider-typebox';

export const Nullable = <T extends TSchema>(schema: T) => Type.Union([schema, Type.Null()]);
