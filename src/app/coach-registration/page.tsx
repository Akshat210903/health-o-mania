
"use client";

import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useUserData } from "@/context/user-data";
import { useRouter } from "next/navigation";

import { SiteLayout } from "@/components/site-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { LoadingSpinner } from "@/components/loading-spinner";

const coachFormSchema = z.object({
    fullName: z.string().min(3, "Full name is required."),
    specialty: z.string().min(3, "Specialty is required."),
    certifications: z.string().min(10, "Please list your certifications."),
    bio: z.string().min(20, "Bio must be at least 20 characters long."),
    terms: z.boolean().refine(val => val === true, {
        message: "You must agree to the terms and conditions."
    }),
});

type CoachFormValues = z.infer<typeof coachFormSchema>;

export default function CoachRegistrationPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { user, addCoach, currentUserCoachProfile, isLoading } = useUserData();
    const { toast } = useToast();
    const router = useRouter();

    const form = useForm<CoachFormValues>({
        resolver: zodResolver(coachFormSchema),
        defaultValues: {
            fullName: "",
            specialty: "",
            certifications: "",
            bio: "",
            terms: false,
        }
    });

    const onSubmit: SubmitHandler<CoachFormValues> = async (data) => {
        setIsSubmitting(true);
        if (!user) {
             toast({
                variant: "destructive",
                title: "Not Authenticated",
                description: "You must be logged in to submit an application.",
            });
            setIsSubmitting(false);
            return;
        }
        try {
            const { terms, ...coachData } = data;
            await addCoach(coachData);
            form.reset();
            // Don't redirect here, the page will auto-update to show the "already a coach" view.
        } catch (error) {
            console.error("Failed to submit application", error);
            toast({
                variant: "destructive",
                title: "Submission Failed",
                description: "Something went wrong. Please try again.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <SiteLayout><LoadingSpinner /></SiteLayout>;
    }

    if (currentUserCoachProfile) {
        return (
            <SiteLayout>
                 <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
                    <div className="flex items-center justify-between space-y-2">
                        <h2 className="text-3xl font-bold tracking-tight">Become a Health Coach</h2>
                    </div>
                     <div className="flex justify-center items-start py-8">
                        <Card className="w-full max-w-2xl">
                            <CardHeader>
                                <CardTitle>You're Already a Coach!</CardTitle>
                                <CardDescription>
                                    Thank you for being part of our community.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground mb-4">
                                   You can manage your coach settings on your profile page.
                                </p>
                                <Link href="/profile">
                                    <Button>Go to Profile</Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </SiteLayout>
        );
    }

    return (
        <SiteLayout>
            <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
                <div className="flex items-center justify-between space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">Become a Health Coach</h2>
                </div>
                <p className="text-muted-foreground">
                    Join our team of professionals and help others on their health journey.
                </p>

                <div className="flex justify-center items-start py-8">
                    <Card className="w-full max-w-2xl">
                        <CardHeader>
                            <CardTitle>Coach Application</CardTitle>
                            <CardDescription>
                                Please fill out the form below. We'll review your application and get back to you.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                     <FormField
                                            control={form.control}
                                            name="fullName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <Label htmlFor="fullName">Full Name</Label>
                                                    <FormControl><Input id="fullName" placeholder="Priya Patel" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                    <FormField
                                        control={form.control}
                                        name="specialty"
                                        render={({ field }) => (
                                            <FormItem>
                                                <Label htmlFor="specialty">Specialty / Area of Expertise</Label>
                                                <FormControl><Input id="specialty" placeholder="e.g., Nutrition, Strength Training, Yoga" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    <FormField
                                        control={form.control}
                                        name="certifications"
                                        render={({ field }) => (
                                            <FormItem>
                                                <Label htmlFor="certifications">Certifications & Qualifications</Label>
                                                <FormControl><Textarea id="certifications" placeholder="List your relevant certifications..." {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    <FormField
                                        control={form.control}
                                        name="bio"
                                        render={({ field }) => (
                                            <FormItem>
                                                <Label htmlFor="bio">Short Bio</Label>
                                                <FormControl><Textarea id="bio" placeholder="Tell us a little about yourself and your coaching philosophy." {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    <FormField
                                        control={form.control}
                                        name="terms"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                </FormControl>
                                                <div className="space-y-1 leading-none">
                                                    <Label>
                                                        I agree to the <Link href="#" className="underline">terms and conditions</Link>
                                                    </Label>
                                                     <FormMessage />
                                                </div>
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Submit Application
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </SiteLayout>
    );
}
