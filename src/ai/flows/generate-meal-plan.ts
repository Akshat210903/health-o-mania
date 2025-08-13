'use server';

/**
 * @fileOverview An AI agent for generating personalized meal plans based on dietary restrictions and goals.
 *
 * - generateMealPlan - A function that handles the meal plan generation process.
 */

import {ai} from '@/ai/genkit';
import { GenerateMealPlanInputSchema, GenerateMealPlanOutputSchema, type GenerateMealPlanInput, type GenerateMealPlanOutput } from '@/ai/schemas/generate-meal-plan';

export async function generateMealPlan(input: GenerateMealPlanInput): Promise<GenerateMealPlanOutput> {
  return generateMealPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMealPlanPrompt',
  input: {schema: GenerateMealPlanInputSchema},
  output: {schema: GenerateMealPlanOutputSchema},
  prompt: `You are a nutrition expert specializing in generating personalized meal plans.

You will use the following information to generate a meal plan that aligns with the user's preferences and goals.

Dietary Preference: {{{dietPref}}}
Goal Type: {{{goalType}}}

Generate a detailed meal plan, including specific meals and portion sizes, suitable for the user.  Provide specific meal plans for breakfast, lunch, and dinner.
`,
});

const generateMealPlanFlow = ai.defineFlow(
  {
    name: 'generateMealPlanFlow',
    inputSchema: GenerateMealPlanInputSchema,
    outputSchema: GenerateMealPlanOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
