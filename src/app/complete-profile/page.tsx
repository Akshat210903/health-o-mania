
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useUserData } from "@/context/user-data";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HealthomaniaIcon } from "@/components/icons";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { LoadingSpinner } from "@/components/loading-spinner";

const profileSchema = z.object({
    name: z.string().min(3, "Full name must be at least 3 characters long."),
});
type ProfileFormValues = z.infer<typeof profileSchema>;

export default function CompleteProfilePage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();
    const { toast } = useToast();
    const { user, updateUserProfile, isLoading } = useUserData();

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
    });

    useEffect(() => {
        // If the user is loaded and already has a name, they don't belong here.
        if (!isLoading && user && user.displayName) {
            router.push('/');
        }
        // If the user is not logged in at all, send them to login.
        if (!isLoading && !user) {
            router.push('/login');
        }
    }, [user, isLoading, router]);


    const onSubmit: SubmitHandler<ProfileFormValues> = async (data) => {
        setIsSubmitting(true);
        try {
            await updateUserProfile({ name: data.name });
            toast({ title: "Profile Complete!", description: "Welcome to Health-O-Mania!" });
            router.push('/'); // Redirect to dashboard after completion
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: "Update Failed",
                description: error.message,
            });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    if (isLoading || !user || (user && user.displayName)) {
        return <LoadingSpinner />;
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-muted">
            <div className="w-full max-w-md p-4 space-y-4">
                <div className="flex justify-center mb-6">
                    <div className="flex items-center space-x-3">
                        <HealthomaniaIcon className="h-10 w-10 text-primary" />
                         <div>
                            <p className="text-2xl font-bold text-foreground">Health-O-Mania</p>
                            <p className="text-sm text-muted-foreground -mt-1">The Health Hero</p>
                        </div>
                    </div>
                </div>
                <Card>
                    <CardHeader className="space-y-1 text-center">
                        <CardTitle className="text-2xl">One Last Step!</CardTitle>
                        <CardDescription>
                            Please tell us your name to complete your profile.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input id="name" placeholder="Rohan Sharma" {...form.register("name")} required />
                                {form.formState.errors.name && <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>}
                            </div>
                            <Button type="submit" className="w-full" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save & Continue
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
