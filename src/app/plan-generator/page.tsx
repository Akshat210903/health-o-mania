import { SiteLayout } from "@/components/site-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dumbbell, UtensilsCrossed } from "lucide-react";
import { WorkoutForm } from "./workout-form";
import { MealForm } from "./meal-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function PlanGeneratorPage() {
    return (
        <SiteLayout>
            <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
                <div className="flex items-center justify-between space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">AI Plan Generator</h2>
                </div>
                <p className="text-muted-foreground">
                    Let our AI assistant craft the perfect workout and meal plans for your goals.
                </p>

                <Tabs defaultValue="workout" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="workout">
                            <Dumbbell className="mr-2 h-4 w-4" />
                            Workout Plan
                        </TabsTrigger>
                        <TabsTrigger value="meal">
                             <UtensilsCrossed className="mr-2 h-4 w-4" />
                            Meal Plan
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="workout">
                         <Card>
                            <CardHeader>
                                <CardTitle>Workout Plan Generator</CardTitle>
                                <CardDescription>Tell us your fitness goal and preferred difficulty.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <WorkoutForm />
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="meal">
                         <Card>
                            <CardHeader>
                                <CardTitle>Meal Plan Generator</CardTitle>
                                <CardDescription>Tell us your dietary preferences and health goals.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <MealForm />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </SiteLayout>
    );
}
