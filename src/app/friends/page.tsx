
"use client";

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUserData } from '@/context/user-data';
import Link from 'next/link';

import { SiteLayout } from "@/components/site-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { UserPlus, UserCheck, UserX, Trash2, Swords } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const addFriendSchema = z.object({
  userCode: z.string().min(3, "Please enter a valid user code."),
});
type AddFriendFormValues = z.infer<typeof addFriendSchema>;

export default function FriendsPage() {
    const { userProfile, friends, friendRequests, isLoading, manageFriendRequest } = useUserData();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register, handleSubmit, formState: { errors }, reset } = useForm<AddFriendFormValues>({
        resolver: zodResolver(addFriendSchema),
    });

    const onAddFriendSubmit: SubmitHandler<AddFriendFormValues> = async (data) => {
        setIsSubmitting(true);
        try {
            await manageFriendRequest({ action: 'send', userCode: data.userCode });
            reset();
        } catch (error: any) {
             toast({
                variant: 'destructive',
                title: 'Failed to Send Request',
                description: error.message || "An unexpected error occurred.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    return (
        <SiteLayout>
             <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
                <div className="flex items-center justify-between space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">Friends</h2>
                </div>
                <p className="text-muted-foreground">
                    Connect with friends, challenge them, and climb the leaderboards together.
                </p>

                <div className="grid gap-8 lg:grid-cols-2 items-start">
                    <div className="space-y-8">
                        <Card>
                             <CardHeader>
                                <CardTitle>Add a Friend</CardTitle>
                                <CardDescription>
                                    Enter your friend's unique code to send them a request. Your code is: <span className="font-mono text-primary bg-primary/10 px-1 py-0.5 rounded">{userProfile?.userCode}</span>
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit(onAddFriendSubmit)} className="flex items-start gap-2">
                                    <div className="flex-1 space-y-1">
                                        <Label htmlFor="userCode" className="sr-only">User Code</Label>
                                        <Input id="userCode" placeholder="FRIEND-CODE-123" {...register("userCode")} />
                                        {errors.userCode && <p className="text-sm text-destructive px-1">{errors.userCode.message}</p>}
                                    </div>
                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        <UserPlus className="mr-2" />
                                        Send Request
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                        
                        <Card>
                            <CardHeader>
                                <CardTitle>Friend Requests</CardTitle>
                                <CardDescription>
                                    You have {friendRequests.length} pending request{friendRequests.length !== 1 && 's'}.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {isLoading ? (
                                    <div className="space-y-2">
                                        <Skeleton className="h-12 w-full" />
                                        <Skeleton className="h-12 w-full" />
                                    </div>
                                ) : friendRequests.length > 0 ? (
                                    <ul className="space-y-3">
                                        {friendRequests.map(req => (
                                            <li key={req.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                                                <div>
                                                    <p className="font-semibold">{req.fromName}</p>
                                                    <p className="text-sm text-muted-foreground">{req.fromUserCode}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button size="icon" variant="outline" className="bg-green-500/20 text-green-500 border-green-500/50 hover:bg-green-500/30 hover:text-green-400" onClick={() => manageFriendRequest({ action: 'accept', requestId: req.id })}>
                                                        <UserCheck />
                                                    </Button>
                                                    <Button size="icon" variant="outline" className="bg-red-500/20 text-red-500 border-red-500/50 hover:bg-red-500/30 hover:text-red-400" onClick={() => manageFriendRequest({ action: 'reject', requestId: req.id })}>
                                                        <UserX />
                                                    </Button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-center text-muted-foreground py-4">No pending friend requests.</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Your Friends</CardTitle>
                            <CardDescription>
                                You have {friends.length} friend{friends.length !== 1 && 's'}.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                             {isLoading ? (
                                    <div className="space-y-2">
                                        <Skeleton className="h-16 w-full" />
                                        <Skeleton className="h-16 w-full" />
                                        <Skeleton className="h-16 w-full" />
                                    </div>
                                ) : friends.length > 0 ? (
                                <ul className="space-y-3">
                                    {friends.map(friend => (
                                        <li key={friend.id} className="flex items-center justify-between p-2 rounded-md transition-colors hover:bg-muted/50">
                                            <div className="flex items-center gap-4">
                                                <Avatar>
                                                    <AvatarImage src={friend.photoURL || undefined} alt={friend.name || ''} />
                                                    <AvatarFallback>{friend.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-semibold">{friend.name}</p>
                                                    <p className="text-sm text-muted-foreground">Level {friend.level}</p>
                                                </div>
                                            </div>
                                             <div className="flex items-center gap-2">
                                                <Link href="/pixel-zone">
                                                    <Button size="icon" variant="outline">
                                                        <Swords />
                                                    </Button>
                                                </Link>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button size="icon" variant="destructive" className="bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20 hover:text-red-400">
                                                            <Trash2 />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Remove Friend?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Are you sure you want to remove {friend.name} from your friends list? This action cannot be undone.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => manageFriendRequest({ action: 'remove', friendId: friend.id })}>
                                                                Remove
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                             </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-center text-muted-foreground py-8">Your friends list is empty. Add some friends to get started!</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
             </div>
        </SiteLayout>
    );
}
