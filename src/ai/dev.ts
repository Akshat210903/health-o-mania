import { config } from 'dotenv';
config();

import '@/ai/flows/generate-workout-plan.ts';
import '@/ai/flows/generate-meal-plan.ts';
import '@/ai/flows/scan-food.ts';
import '@/ai/flows/chatbot.ts';
