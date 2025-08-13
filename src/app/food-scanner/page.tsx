"use client"; // Needs to be a client component

import { SiteLayout } from "@/components/site-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { FoodScannerForm } from "./food-scanner-form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useUserData } from "@/context/user-data"; // New import
import { Button } from "@/components/ui/button"; // New import
import { Trash2 } from "lucide-react"; // New import
import { Skeleton } from "@/components/ui/skeleton";

export default function FoodScannerPage() {
    const { foodLog, isLoading, removeFoodLog } = useUserData(); // Use context

    const totals = foodLog.reduce((acc, item) => {
        acc.calories += item.calories;
        acc.protein += item.protein;
        acc.carb += item.carb;
        acc.fat += item.fat;
        return acc;
    }, { calories: 0, protein: 0, carb: 0, fat: 0 });

    return (
        <SiteLayout>
            <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
                <div className="flex items-center justify-between space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">Food Scanner & Log</h2>
                </div>
                <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Log a Meal</CardTitle>
                            <CardDescription>Scan an image or enter details manually.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <FoodScannerForm />
                        </CardContent>
                    </Card>
                    <Card className="flex flex-col">
                        <CardHeader>
                            <CardTitle>Today's Log</CardTitle>
                             { !isLoading && <CardDescription>You've logged {foodLog.length} meals today.</CardDescription> }
                        </CardHeader>
                        <CardContent className="flex-1">
                            <ScrollArea className="h-[400px]">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Food</TableHead>
                                            <TableHead className="text-right">Calories</TableHead>
                                            <TableHead className="w-[50px]"> </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {isLoading ? (
                                            Array.from({length: 3}).map((_, i) => (
                                                <TableRow key={i}>
                                                    <TableCell colSpan={3}>
                                                        <Skeleton className="h-8 w-full" />
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : foodLog.length > 0 ? (
                                            foodLog.map((food) => (
                                                <TableRow key={food.id}>
                                                    <TableCell>
                                                        <div className="font-medium">{food.foodName}</div>
                                                        <div className="text-sm text-muted-foreground">{food.scannedAt}</div>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Badge variant="outline">{food.calories.toFixed(1)} kcal</Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button variant="ghost" size="icon" onClick={() => removeFoodLog(food.id)}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={3} className="text-center text-muted-foreground">
                                                    No meals logged yet.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </ScrollArea>
                        </CardContent>
                        <CardFooter className="flex flex-col items-start gap-2 pt-4 mt-auto border-t">
                            <h4 className="font-semibold">Today's Totals</h4>
                            <div className="text-sm text-muted-foreground grid grid-cols-2 gap-x-4 gap-y-1 w-full">
                                <span>Total Calories:</span><span className="font-medium text-right text-card-foreground">{totals.calories.toFixed(1)} kcal</span>
                                <span>Total Protein:</span><span className="font-medium text-right text-card-foreground">{totals.protein.toFixed(1)} g</span>
                                <span>Total Carbs:</span><span className="font-medium text-right text-card-foreground">{totals.carb.toFixed(1)} g</span>
                                <span>Total Fat:</span><span className="font-medium text-right text-card-foreground">{totals.fat.toFixed(1)} g</span>
                            </div>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </SiteLayout>
    );
}
