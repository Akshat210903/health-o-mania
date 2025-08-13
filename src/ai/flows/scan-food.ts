'use server';
/**
 * @fileOverview Flow for scanning food images and extracting nutritional information.
 *
 * - scanFood - A function that handles the food scanning process.
 */

import {ai} from '@/ai/genkit';
import { ScanFoodInputSchema, ScanFoodOutputSchema, type ScanFoodInput, type ScanFoodOutput } from '@/ai/schemas/scan-food';

export async function scanFood(input: ScanFoodInput): Promise<ScanFoodOutput> {
  return scanFoodFlow(input);
}

const prompt = ai.definePrompt({
  name: 'scanFoodPrompt',
  input: {schema: ScanFoodInputSchema},
  output: {schema: ScanFoodOutputSchema},
  prompt: `You are an expert nutritionist. Analyze the image of the food at the provided data URI and extract the nutritional information, calories, and macros (protein, carbs, fat). Return the data as a JSON object.

Image: {{media url=photoDataUri}}

Here is the nutrition information:`,
});

const scanFoodFlow = ai.defineFlow(
  {
    name: 'scanFoodFlow',
    inputSchema: ScanFoodInputSchema,
    outputSchema: ScanFoodOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
