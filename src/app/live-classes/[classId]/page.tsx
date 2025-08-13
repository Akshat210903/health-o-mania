
"use client";

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc, type Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useUserData, type LiveClass, type UserProfile } from '@/context/user-data';

import { SiteLayout } from '@/components/site-layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Clock, Tv, Video, AlarmClock } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';

// The LiveClass type from context is correct, but when fetching directly, TS doesn't know
// that `startAt` is a Firestore Timestamp, so we create a specific type for the doc.
type LiveClassDoc = Omit<LiveClass, 'createdAt' | 'startAt'> & { createdAt: Timestamp; startAt: Timestamp };

export default function ClassLobbyPage({ params }: { params: Promise<{ classId: string }> }) {
    const router = useRouter();
    const { classId } = use(params);
    const { userProfile, isLoading: isUserLoading } = useUserData();

    const [liveClass, setLiveClass] = useState<LiveClassDoc | null>(null);
    const [instructor, setInstructor] = useState<UserProfile | null>(null);
    const [isLoadingClass, setIsLoadingClass] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [timeLeft, setTimeLeft] = useState("");
    const [canJoin, setCanJoin] = useState(false);

    useEffect(() => {
        if (!classId) {
            setIsLoadingClass(false);
            setError("No Class ID provided.");
            return;
        }

        const fetchClassAndInstructor = async () => {
            setIsLoadingClass(true);
            try {
                const classDocRef = doc(db, 'liveClasses', classId);
                const classDocSnap = await getDoc(classDocRef);

                if (classDocSnap.exists()) {
                    const classData = { id: classDocSnap.id, ...classDocSnap.data() } as LiveClassDoc;
                    setLiveClass(classData);

                    // Fetch instructor profile directly
                    const instructorDocRef = doc(db, 'users', classData.instructorId);
                    const instructorDocSnap = await getDoc(instructorDocRef);
                    if (instructorDocSnap.exists()) {
                        setInstructor({ id: instructorDocSnap.id, ...instructorDocSnap.data() } as UserProfile);
                    } else {
                         // This case is unlikely if data is consistent, but good to handle
                        setInstructor({
                            id: classData.instructorId,
                            name: classData.instructorName,
                        } as any);
                    }
                } else {
                    setError("Sorry, this class could not be found.");
                }
            } catch (e) {
                console.error("Error fetching live class:", e);
                setError("An error occurred while trying to load the class.");
            } finally {
                setIsLoadingClass(false);
            }
        };

        fetchClassAndInstructor();
    }, [classId]);
    
    useEffect(() => {
        if (!liveClass?.startAt) return;

        const intervalId = setInterval(() => {
            const now = new Date();
            const classStartTime = liveClass.startAt.toDate();
            const difference = classStartTime.getTime() - now.getTime();

            // Set join button availability
            // Allow joining up to 10 minutes before and for 2 hours after start
            const tenMinutes = 10 * 60 * 1000;
            const twoHours = 2 * 60 * 60 * 1000;
            
            if (difference <= tenMinutes && difference > -twoHours) {
                setCanJoin(true);
            } else {
                setCanJoin(false);
            }
            
            // Set the display text for the timer
            if (difference < -twoHours) {
                setTimeLeft("This class has ended.");
                clearInterval(intervalId);
            } else if (difference <= 0) {
                 setTimeLeft("Class is live! Join now.");
            } else {
                const days = Math.floor(difference / (1000 * 60 * 60 * 24));
                const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((difference % (1000 * 60 * 60)) / 1000 / 60);
                const seconds = Math.floor((difference % (1000 * 60)) / 1000);
                
                let remainingString = '';
                if (days > 0) remainingString += `${days}d `;
                if (hours > 0) remainingString += `${hours}h `;
                remainingString += `${minutes}m ${seconds}s`;

                setTimeLeft(remainingString);
            }
        }, 1000);

        return () => clearInterval(intervalId);
    }, [liveClass]);


    if (isLoadingClass || isUserLoading) {
        return <LobbySkeleton />;
    }

    if (error) {
        return (
            <SiteLayout>
                <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 flex flex-col items-center justify-center">
                    <Card className="w-full max-w-md">
                        <CardHeader><CardTitle>Error</CardTitle></CardHeader>
                        <CardContent>
                            <Alert variant="destructive">
                                <AlertTitle>Loading Failed</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={() => router.back()} className="w-full">Go Back</Button>
                        </CardFooter>
                    </Card>
                </div>
            </SiteLayout>
        );
    }
    
    if (!liveClass || !instructor) {
        return <SiteLayout><div className="text-center p-8">Class not found.</div></SiteLayout>;
    }

    return (
        <SiteLayout>
            <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
                <Link href="/live-classes">
                    <Button variant="ghost"><ArrowLeft className="mr-2 h-4 w-4" />Back to All Classes</Button>
                </Link>
                <div className="flex items-center justify-center py-12">
                     <Card className="w-full max-w-2xl shadow-2xl">
                        <CardHeader className="text-center">
                            <p className="text-sm font-medium text-primary">You are about to join</p>
                            <CardTitle className="text-4xl">{liveClass.title}</CardTitle>
                            <CardDescription className="text-base">{liveClass.category}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                           <Alert className="text-center">
                                <AlarmClock className="h-4 w-4" />
                                <AlertTitle className="text-2xl font-bold">{timeLeft}</AlertTitle>
                                <AlertDescription>
                                    The launch button will be enabled 10 minutes before the class starts.
                                </AlertDescription>
                           </Alert>
                           <div className="flex flex-col items-center gap-4 pt-6 border-t">
                                <Avatar className="h-24 w-24 border-4 border-primary">
                                    <AvatarImage src={instructor?.photoURL || undefined} alt={instructor.name || ''} />
                                    <AvatarFallback className="text-3xl">{instructor.name?.substring(0,2)}</AvatarFallback>
                                </Avatar>
                                <div className="text-center">
                                    <p className="font-bold text-lg">{instructor.name}</p>
                                    <p className="text-sm text-muted-foreground">Your Instructor</p>
                                </div>
                           </div>
                           <div className="flex justify-around text-center text-sm text-muted-foreground pt-4 border-t">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    <span>{liveClass.time}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Video className="h-4 w-4" />
                                    <span>{liveClass.duration}</span>
                                </div>
                           </div>
                        </CardContent>
                        <CardFooter>
                            <Button
                                size="lg"
                                className="w-full text-lg py-8"
                                onClick={() => window.open(liveClass.meetLink, '_blank')}
                                disabled={!canJoin || !liveClass.meetLink}
                            >
                                <Tv className="mr-4 h-6 w-6" />
                                Launch Meeting
                            </Button>
                        </CardFooter>
                     </Card>
                </div>
            </div>
        </SiteLayout>
    );
}

function LobbySkeleton() {
    return (
        <SiteLayout>
             <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
                <Skeleton className="h-10 w-48" />
                 <div className="flex items-center justify-center py-12">
                    <Card className="w-full max-w-2xl">
                        <CardHeader className="text-center items-center flex flex-col gap-2">
                             <Skeleton className="h-5 w-40" />
                             <Skeleton className="h-10 w-80" />
                             <Skeleton className="h-5 w-24" />
                        </CardHeader>
                         <CardContent className="space-y-6">
                            <Skeleton className="h-20 w-full" />
                           <div className="flex flex-col items-center gap-4 pt-6 border-t">
                                <Skeleton className="h-24 w-24 rounded-full" />
                                 <div className="text-center w-32 space-y-2">
                                    <Skeleton className="h-6 w-full" />
                                    <Skeleton className="h-4 w-2/3 mx-auto" />
                                </div>
                           </div>
                            <div className="flex justify-around pt-4 border-t">
                               <Skeleton className="h-6 w-24" />
                               <Skeleton className="h-6 w-24" />
                            </div>
                         </CardContent>
                         <CardFooter>
                            <Skeleton className="h-20 w-full" />
                         </CardFooter>
                    </Card>
                </div>
             </div>
        </SiteLayout>
    )
}
