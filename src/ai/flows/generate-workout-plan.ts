'use server';

/**
 * @fileOverview Workout plan generation flow.
 *
 * - generateWorkoutPlan - A function that generates a workout plan based on user input.
 */

import {ai} from '@/ai/genkit';
import { GenerateWorkoutPlanInputSchema, GenerateWorkoutPlanOutputSchema, type GenerateWorkoutPlanInput, type GenerateWorkoutPlanOutput } from '@/ai/schemas/generate-workout-plan';

export async function generateWorkoutPlan(input: GenerateWorkoutPlanInput): Promise<GenerateWorkoutPlanOutput> {
  return generateWorkoutPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateWorkoutPlanPrompt',
  input: {schema: GenerateWorkoutPlanInputSchema},
  output: {schema: GenerateWorkoutPlanOutputSchema},
  prompt: `You are a personal trainer who provides workout plans to users. Generate a workout plan based on the following information:

Goal Type: {{{goalType}}}
Difficulty: {{{difficulty}}}
Dietary Preferences: {{{dietPref}}}

Workout Plan:`,
});

const generateWorkoutPlanFlow = ai.defineFlow(
  {
    name: 'generateWorkoutPlanFlow',
    inputSchema: GenerateWorkoutPlanInputSchema,
    outputSchema: GenerateWorkoutPlanOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
