"use client";

import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { generateWorkoutPlan } from "@/ai/flows/generate-workout-plan";

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

const workoutFormSchema = z.object({
  goalType: z.string().min(1, "Please select a goal."),
  difficulty: z.string().min(1, "Please select a difficulty."),
});

type WorkoutFormValues = z.infer<typeof workoutFormSchema>;

export function WorkoutForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [workoutPlan, setWorkoutPlan] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<WorkoutFormValues>({
    resolver: zodResolver(workoutFormSchema),
  });

  const onSubmit: SubmitHandler<WorkoutFormValues> = async (data) => {
    setIsLoading(true);
    setWorkoutPlan(null);
    try {
      const result = await generateWorkoutPlan(data);
      setWorkoutPlan(result.workoutPlan);
      toast({
        title: "Workout Plan Generated!",
        description: "Your new workout plan is ready.",
      });
    } catch (error) {
      console.error("Workout plan generation failed", error);
      toast({
        title: "Generation Failed",
        description: "Could not generate a workout plan. Please try again.",
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
              name="goalType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Primary Goal</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a goal" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="strength">Strength Training</SelectItem>
                      <SelectItem value="cardio">Cardio & Endurance</SelectItem>
                      <SelectItem value="weight loss">Weight Loss</SelectItem>
                      <SelectItem value="flexibility">Flexibility & Mobility</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="difficulty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Difficulty</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a difficulty level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
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

      {workoutPlan && (
        <Card className="mt-6 bg-accent">
            <CardHeader>
                <CardTitle>Your Custom Workout Plan</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                    {workoutPlan}
                </div>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
