import { z } from 'zod';

export const GenerateWorkoutPlanInputSchema = z.object({
  goalType: z
    .string()
    .describe('The user specified goal type - i.e. strength, cardio, weight loss, etc.'),
  difficulty: z
    .string()
    .describe('The difficulty level of the workout plan (easy, medium, hard).'),
  dietPref: z
    .string()
    .optional()
    .describe('The dietary preferences of the user, i.e. vegan, keto, etc.'),
});
export type GenerateWorkoutPlanInput = z.infer<typeof GenerateWorkoutPlanInputSchema>;

export const GenerateWorkoutPlanOutputSchema = z.object({
  workoutPlan: z.string().describe('A personalized workout plan based on the user input.'),
});
export type GenerateWorkoutPlanOutput = z.infer<typeof GenerateWorkoutPlanOutputSchema>;
