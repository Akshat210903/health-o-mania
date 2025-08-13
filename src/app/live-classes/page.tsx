
"use client";

import { useState, useEffect, type ChangeEvent } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

import { SiteLayout } from "@/components/site-layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Clock, PlusCircle, Trash2, Tv, User } from "lucide-react";
import Image from "next/image";
import { useUserData } from "@/context/user-data";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";


// Form Schema for creating a new class
const classFormSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters."),
  category: z.string().min(1, "Please select a category."),
  duration: z.string().min(3, "Please enter a duration (e.g., 45 mins)."),
  meetLink: z.string().url({ message: "Please enter a valid Google Meet URL." }),
  startAt: z.date({
    required_error: "A date and time for the class is required.",
  }),
});
type ClassFormValues = z.infer<typeof classFormSchema>;


// The form component to be rendered inside the dialog
function HostClassForm({ setDialogOpen }: { setDialogOpen: (open: boolean) => void }) {
    const { addLiveClass } = useUserData();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const form = useForm<ClassFormValues>({
        resolver: zodResolver(classFormSchema),
        defaultValues: { title: "", category: "", duration: "", meetLink: "" }
    });

    // Clean up the object URL to prevent memory leaks
    useEffect(() => {
        return () => {
            if(imagePreview) {
                URL.revokeObjectURL(imagePreview);
            }
        }
    }, [imagePreview]);


    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        } else {
            setImageFile(null);
            setImagePreview(null);
        }
    };


    const onSubmit: SubmitHandler<ClassFormValues> = async (data) => {
        setIsSubmitting(true);
        await addLiveClass(data, imageFile);
        setIsSubmitting(false);
        setDialogOpen(false);
        form.reset();
        setImageFile(null);
        setImagePreview(null);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="title" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Class Title</FormLabel>
                        <FormControl><Input placeholder="e.g., Morning Mobility Flow" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                 <FormField control={form.control} name="category" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="Flexibility">Flexibility</SelectItem>
                                <SelectItem value="Cardio">Cardio</SelectItem>
                                <SelectItem value="Nutrition">Nutrition</SelectItem>
                                <SelectItem value="Strength">Strength</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )} />
                 <FormItem>
                    <FormLabel>Banner Image (Optional)</FormLabel>
                    <FormControl>
                        <Input type="file" accept="image/png, image/jpeg, image/webp" onChange={handleImageChange} />
                    </FormControl>
                    <FormMessage />
                </FormItem>

                {imagePreview && (
                    <div>
                        <FormLabel>Preview</FormLabel>
                        <div className="mt-2 relative aspect-video w-full">
                            <Image src={imagePreview} alt="Banner preview" fill className="rounded-md object-cover" />
                        </div>
                    </div>
                )}
                 <FormField
                    control={form.control}
                    name="startAt"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                        <FormLabel>Start Time</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                )}
                                >
                                {field.value ? (
                                    format(field.value, "PPP HH:mm")
                                ) : (
                                    <span>Pick a date and time</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                             <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                  date < new Date(new Date().setHours(0,0,0,0))
                                }
                                initialFocus
                              />
                               <div className="p-2 border-t border-border">
                                    <div className="flex items-center gap-2">
                                        <Select
                                            onValueChange={(value) => {
                                                const newDate = field.value ? new Date(field.value) : new Date();
                                                newDate.setHours(Number(value));
                                                field.onChange(newDate);
                                            }}
                                            value={field.value ? String(field.value.getHours()).padStart(2, '0') : undefined}
                                        >
                                            <SelectTrigger><SelectValue placeholder="Hour" /></SelectTrigger>
                                            <SelectContent position="popper">
                                                {Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')).map(hour => (
                                                    <SelectItem key={hour} value={hour}>{hour}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        :
                                         <Select
                                            onValueChange={(value) => {
                                                const newDate = field.value ? new Date(field.value) : new Date();
                                                newDate.setMinutes(Number(value));
                                                field.onChange(newDate);
                                            }}
                                            value={field.value ? String(field.value.getMinutes()).padStart(2, '0') : undefined}
                                        >
                                            <SelectTrigger><SelectValue placeholder="Minute" /></SelectTrigger>
                                            <SelectContent position="popper">
                                                <SelectItem value="00">00</SelectItem>
                                                <SelectItem value="15">15</SelectItem>
                                                <SelectItem value="30">30</SelectItem>
                                                <SelectItem value="45">45</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                               </div>
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                 <FormField control={form.control} name="duration" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Duration</FormLabel>
                        <FormControl><Input placeholder="e.g., 45 mins" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="meetLink" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Google Meet Link</FormLabel>
                        <FormControl><Input placeholder="https://meet.google.com/xyz-abcd-efg" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <DialogFooter>
                    <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Creating..." : "Create Class"}
                    </Button>
                </DialogFooter>
            </form>
        </Form>
    );
}

export default function LiveClassesPage() {
    const { liveClasses, isLoading, currentUserCoachProfile, removeLiveClass } = useUserData();
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const now = new Date();
    const threeHoursAgo = new Date(now.getTime() - (3 * 60 * 60 * 1000));
    const upcomingClasses = liveClasses.filter(cls => cls.startAt.toDate() > threeHoursAgo);
    const expiredClasses = liveClasses.filter(cls => cls.startAt.toDate() <= threeHoursAgo);

    return (
        <SiteLayout>
            <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
                <div className="flex items-center justify-between space-y-2">
                    <div className="space-y-1">
                        <h2 className="text-3xl font-bold tracking-tight">Live Classes</h2>
                        <p className="text-muted-foreground">
                            Join live sessions with our certified health professionals.
                        </p>
                    </div>
                    {currentUserCoachProfile && (
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Host a New Class
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Host a New Class</DialogTitle>
                                    <DialogDescription>
                                        Fill out the details below to schedule your class. It will be visible to all users.
                                    </DialogDescription>
                                </DialogHeader>
                                <HostClassForm setDialogOpen={setIsDialogOpen} />
                            </DialogContent>
                        </Dialog>
                    )}
                </div>

                 <div className="space-y-8">
                    <div>
                        <h3 className="text-2xl font-semibold tracking-tight mb-4">Upcoming Classes</h3>
                        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                            {isLoading ? (
                                Array.from({length: 3}).map((_, i) => <Skeleton key={i} className="h-[400px] w-full rounded-lg" />)
                            ) : upcomingClasses.length > 0 ? (
                                upcomingClasses.map((cls) => (
                                    <Card key={cls.id} className="flex flex-col">
                                        <CardHeader className="p-0">
                                            <div className="aspect-video relative">
                                                <Image
                                                    src={cls.image || 'https://placehold.co/600x400.png'}
                                                    alt={cls.title}
                                                    fill
                                                    className="rounded-t-lg object-cover"
                                                />
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-6 flex-1">
                                            <Badge variant="outline" className="mb-2">{cls.category}</Badge>
                                            <CardTitle className="text-xl mb-2">{cls.title}</CardTitle>
                                            <div className="text-muted-foreground space-y-2 text-sm">
                                                <p className="flex items-center"><User className="mr-2 h-4 w-4" />{cls.instructorName}</p>
                                                <p className="flex items-center"><Clock className="mr-2 h-4 w-4" />{cls.time} ({cls.duration})</p>
                                            </div>
                                        </CardContent>
                                        <CardFooter className="p-6 pt-0 flex items-center justify-between gap-2">
                                            <Button asChild className="w-full" disabled={!cls.meetLink}>
                                                <Link href={`/live-classes/${cls.id}`}>
                                                    <Tv className="mr-2 h-4 w-4" />
                                                    Join Class
                                                </Link>
                                            </Button>
                                            {currentUserCoachProfile?.userId === cls.instructorId && (
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="destructive" size="icon">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                This will permanently delete your class "{cls.title}". This action cannot be undone.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => removeLiveClass(cls.id)}>Delete</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            )}
                                        </CardFooter>
                                    </Card>
                                ))
                            ) : (
                                <div className="text-center text-muted-foreground col-span-full py-12">
                                    <p>No upcoming classes scheduled at the moment. Check back soon!</p>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {!isLoading && expiredClasses.length > 0 && (
                        <div>
                            <Separator className="my-6" />
                             <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="expired-classes">
                                    <AccordionTrigger>
                                        <h3 className="text-2xl font-semibold tracking-tight">
                                            Expired Sessions ({expiredClasses.length})
                                        </h3>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 pt-4">
                                            {expiredClasses.map((cls) => (
                                                 <Card key={cls.id} className="flex flex-col opacity-70">
                                                    <CardHeader className="p-0">
                                                        <div className="aspect-video relative">
                                                            <Image
                                                                src={cls.image || 'https://placehold.co/600x400.png'}
                                                                alt={cls.title}
                                                                fill
                                                                className="rounded-t-lg object-cover"
                                                            />
                                                        </div>
                                                    </CardHeader>
                                                    <CardContent className="p-6 flex-1">
                                                        <Badge variant="outline" className="mb-2">{cls.category}</Badge>
                                                        <CardTitle className="text-xl mb-2">{cls.title}</CardTitle>
                                                        <div className="text-muted-foreground space-y-2 text-sm">
                                                            <p className="flex items-center"><User className="mr-2 h-4 w-4" />{cls.instructorName}</p>
                                                            <p className="flex items-center"><Clock className="mr-2 h-4 w-4" />{cls.time} ({cls.duration})</p>
                                                        </div>
                                                    </CardContent>
                                                    <CardFooter className="p-6 pt-0 flex items-center justify-between gap-2">
                                                        <Button asChild className="w-full" disabled>
                                                            <Link href={`/live-classes/${cls.id}`}>
                                                                <Tv className="mr-2 h-4 w-4" />
                                                                Class Ended
                                                            </Link>
                                                        </Button>
                                                        {currentUserCoachProfile?.userId === cls.instructorId && (
                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <Button variant="destructive" size="icon">
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent>
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                                        <AlertDialogDescription>
                                                                            This will permanently delete your class "{cls.title}". This action cannot be undone.
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                        <AlertDialogAction onClick={() => removeLiveClass(cls.id)}>Delete</AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                        )}
                                                    </CardFooter>
                                                </Card>
                                            ))}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </div>
                    )}
                </div>
            </div>
        </SiteLayout>
    );
}

    