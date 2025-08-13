"use client";

import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { generateMealPlan } from "@/ai/flows/generate-meal-plan";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const mealFormSchema = z.object({
  dietPref: z.string().min(1, "Please select a diet preference."),
  goalType: z.string().min(1, "Please select a goal."),
});

type MealFormValues = z.infer<typeof mealFormSchema>;

export function MealForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [mealPlan, setMealPlan] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<MealFormValues>({
    resolver: zodResolver(mealFormSchema),
  });

  const onSubmit: SubmitHandler<MealFormValues> = async (data) => {
    setIsLoading(true);
    setMealPlan(null);
    try {
      const result = await generateMealPlan(data);
      setMealPlan(result.mealPlan);
      toast({
        title: "Meal Plan Generated!",
        description: "Your new meal plan is ready.",
      });
    } catch (error) {
      console.error("Meal plan generation failed", error);
      toast({
        title: "Generation Failed",
        description: "Could not generate a meal plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FormField
              control={form.control}
              name="dietPref"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dietary Preference</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a diet" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="anything">Anything</SelectItem>
                      <SelectItem value="vegetarian">Vegetarian</SelectItem>
                      <SelectItem value="vegan">Vegan</SelectItem>
                      <SelectItem value="keto">Keto</SelectItem>
                      <SelectItem value="paleo">Paleo</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="goalType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Health Goal</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a goal" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="weight loss">Weight Loss</SelectItem>
                      <SelectItem value="muscle gain">Muscle Gain</SelectItem>
                      <SelectItem value="general health">General Health</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            Generate Plan
          </Button>
        </form>
      </Form>
      
      {isLoading && (
         <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-muted-foreground">Generating your personalized plan...</p>
        </div>
      )}

      {mealPlan && (
        <Card className="mt-6 bg-accent">
            <CardHeader>
                <CardTitle>Your Custom Meal Plan</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                    {mealPlan}
                </div>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
