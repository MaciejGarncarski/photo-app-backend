import { z } from 'zod';

export const createMessageSchema = z.object({
  receiver: z.string(),
  sender: z.string(),
  message: z.string(),
});

export type CreateMessage = z.infer<typeof createMessageSchema>;
