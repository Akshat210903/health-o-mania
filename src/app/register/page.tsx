
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useUserData } from "@/context/user-data";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HealthomaniaIcon } from "@/components/icons";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { LoadingSpinner } from "@/components/loading-spinner";
import { cn } from "@/lib/utils";

const fitnessVideos = [
    'https://cdn.pixabay.com/video/2024/02/15/200657-913478674_large.mp4',
    "https://cdn.pixabay.com/video/2022/06/15/120450-720880556_large.mp4",
    "https://media.istockphoto.com/id/497041804/video/woman-running-towards-setting-sun.mp4?s=mp4-640x640-is&k=20&c=TIAbm41BaIUlxfZvbklV6PBuFDrA5sDIOUsrJxpjVxg=",
    "https://cdn.pixabay.com/video/2020/02/27/32937-395456375_large.mp4",
    "https://cdn.pixabay.com/video/2022/10/16/135161-761273563_large.mp4",
    "https://cdn.pixabay.com/video/2021/01/11/61682-500316045_large.mp4",
    "https://cdn.pixabay.com/video/2015/08/13/445-136216234_medium.mp4",
    "https://cdn.pixabay.com/video/2020/06/11/41724-430090688_large.mp4"
];

const healthQuotes = [
  "The greatest wealth is health.",
  "Take care of your body. It's the only place you have to live.",
  "A healthy outside starts from the inside.",
  "Sweat is just fat crying.",
  "The only bad workout is the one that didn't happen.",
  "Your body can stand almost anything. It’s your mind that you have to convince."
];

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [showContent, setShowContent] = useState(false);
  const [quote, setQuote] = useState('');
  const router = useRouter();
  const { toast } = useToast();
  const { user, isLoading } = useUserData();

  useEffect(() => {
    // Select a random video and quote on component mount
    setVideoUrl(fitnessVideos[Math.floor(Math.random() * fitnessVideos.length)]);
    setQuote(healthQuotes[Math.floor(Math.random() * healthQuotes.length)]);
    
    // Fake progress interval
    const interval = setInterval(() => {
      setLoadingProgress(prev => {
        const newProgress = prev + Math.floor(Math.random() * 4) + 1;
        if (newProgress >= 100) {
          clearInterval(interval);
          return 100;
        }
        return newProgress;
      });
    }, 80);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isVideoReady && loadingProgress >= 100) {
      // Add a small delay for a smoother transition
      const timer = setTimeout(() => setShowContent(true), 500);
      return () => clearTimeout(timer);
    }
  }, [isVideoReady, loadingProgress]);

  useEffect(() => {
    if (!isLoading && user) {
      router.push('/');
    }
  }, [user, isLoading, router]);


  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
        toast({
            variant: "destructive",
            title: "Registration Failed",
            description: "Please enter your full name.",
        });
        return;
    }
    setIsSubmitting(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      // The useEffect will handle the redirect
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: `An error occurred: ${error.message}.`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

   const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // The useEffect will handle the redirect
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Google Sign-up Failed",
        description: `An error occurred: ${error.message}.`,
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  if (isLoading || (!isLoading && user)) {
     return <LoadingSpinner />;
  }

  return (
    <div className="relative flex items-center justify-center min-h-screen w-full overflow-hidden">
        {videoUrl && (
            <video
                key={videoUrl}
                autoPlay
                loop
                muted
                playsInline
                className="absolute z-0 w-full h-full object-cover"
                src={videoUrl}
                onCanPlay={() => setIsVideoReady(true)}
            >
                Your browser does not support the video tag.
            </video>
        )}
      <div className="absolute inset-0 z-10 bg-black/70" />

      {!showContent && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-background p-4">
            <HealthomaniaIcon className="h-16 w-16 text-primary mb-4 animate-pulse" />
            <div className="text-center mb-6">
                <p className="text-3xl font-bold text-foreground">Health-O-Mania</p>
                <p className="text-lg text-muted-foreground">The Health Hero</p>
            </div>
            {quote && <p className="text-lg mb-4 text-center italic text-muted-foreground">"{quote}"</p>}
            <div className="w-64 bg-muted rounded-full h-2.5">
                <div className="bg-primary h-2.5 rounded-full transition-all duration-300 ease-linear" style={{ width: `${loadingProgress}%` }}></div>
            </div>
            <p className="text-xl font-bold mt-2 text-primary">{loadingProgress}%</p>
        </div>
      )}

      <div className={cn(
          "relative z-20 w-full max-w-md p-4 space-y-4 transition-opacity duration-1000",
          !showContent ? "opacity-0" : "opacity-100"
      )}>
        <div className="flex justify-center mb-6">
          <Link href="/" className="flex items-center space-x-3">
            <HealthomaniaIcon className="h-10 w-10 text-primary-foreground" />
             <div>
              <p className="text-2xl font-bold text-primary-foreground">Health-O-Mania</p>
              <p className="text-sm text-primary-foreground/80 -mt-1">The Health Hero</p>
            </div>
          </Link>
        </div>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Create an account</CardTitle>
            <CardDescription>
              Enter your information to create an account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignUp} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="full-name">Full Name</Label>
                <Input id="full-name" placeholder="Rohan Sharma" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="rohan.sharma@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting || isGoogleLoading}>
                 {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create an account
              </Button>
            </form>
             <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>
            <Button variant="outline" className="w-full" onClick={handleGoogleSignUp} disabled={isSubmitting || isGoogleLoading}>
              {isGoogleLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign up with Google
            </Button>
          </CardContent>
        </Card>
        <div className="mt-4 text-center text-sm text-primary-foreground/80">
          Already have an account?{" "}
          <Link href="/login" className="underline font-semibold text-primary-foreground">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
