
'use server';
/**
 * @fileOverview A helpful AI assistant for the Healthomania app.
 *
 * - chatbot - A function that handles the chat interaction.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { ChatbotInputSchema, ChatbotOutputSchema, type ChatbotInput, type ChatbotOutput } from '@/ai/schemas/chatbot';

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/tasks", label: "Tasks" },
  { href: "/food-scanner", label: "Food Scanner" },
  { href: "/plan-generator", label: "AI Plans" },
  { href: "/pixel-zone", label: "Pixel Zone" },
  { href: "/scoreboard", label: "Scoreboard" },
  { href: "/live-classes", label: "Live Classes" },
];

const getAppPages = ai.defineTool(
    {
        name: 'getAppPages',
        description: 'Get the list of available pages in the application.',
        inputSchema: z.object({}),
        outputSchema: z.array(z.object({
            href: z.string(),
            label: z.string(),
        })),
    },
    async () => navItems
);


const prompt = ai.definePrompt({
    name: 'chatbotPrompt',
    tools: [getAppPages],
    input: { schema: ChatbotInputSchema },
    output: { schema: ChatbotOutputSchema },
    prompt: `You are a friendly and helpful AI assistant named Health-o-Buddy. Your goal is to guide users around the website and answer their health-related questions.

    Use the 'getAppPages' tool to understand the app's features and help users navigate. For example, if a user asks what a page does, use the tool to confirm the page exists and then provide a helpful explanation.

    IMPORTANT: Do not give medical advice. Do not use phrases like "please consult a healthcare professional". You are an assistant for the app, not a doctor. A disclaimer is already shown in the UI.

    Keep your answers concise and helpful.

    Here is the conversation history:
    {{#each history}}
      {{this.role}}: {{this.content.[0].text}}
    {{/each}}

    User: {{{message}}}
    AI:`,
});


export async function chatbot(input: ChatbotInput): Promise<ChatbotOutput> {
    const llmResponse = await prompt(input);
    const response = llmResponse.output?.message ?? "Sorry, I couldn't process that. Please try again.";
    return { message: response };
}
