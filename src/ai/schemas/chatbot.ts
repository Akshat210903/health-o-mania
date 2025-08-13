import { z } from 'zod';

export const ChatbotInputSchema = z.object({
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.array(z.object({
        text: z.string()
    }))
  })).optional(),
  message: z.string().describe('The user message.'),
});
export type ChatbotInput = z.infer<typeof ChatbotInputSchema>;

export const ChatbotOutputSchema = z.object({
  message: z.string().describe('The AI response message.'),
});
export type ChatbotOutput = z.infer<typeof ChatbotOutputSchema>;
