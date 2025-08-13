import { z } from 'zod';

export const GenerateMealPlanInputSchema = z.object({
  dietPref: z
    .string()
    .describe('The preferred diet of the user (e.g., vegetarian, vegan, paleo).'),
  goalType: z
    .string()
    .describe(
      'The goal type of the user (e.g., weight loss, muscle gain, general health).'    ),
});
export type GenerateMealPlanInput = z.infer<typeof GenerateMealPlanInputSchema>;

export const GenerateMealPlanOutputSchema = z.object({
  mealPlan: z.string().describe('The generated meal plan based on the user input.'),
});
export type GenerateMealPlanOutput = z.infer<typeof GenerateMealPlanOutputSchema>;
