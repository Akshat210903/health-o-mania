
"use client";

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult } from "firebase/auth";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";


// Add RecaptchaVerifier to window
declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
  }
}

const fitnessVideos = [
    "https://cdn.pixabay.com/video/2022/06/15/120450-720880556_large.mp4",
    "https://media.istockphoto.com/id/497041804/video/woman-running-towards-setting-sun.mp4?s=mp4-640x640-is&k=20&c=TIAbm41BaIUlxfZvbklV6PBuFDrA5sDIOUsrJxpjVxg=",
    "https://cdn.pixabay.com/video/2020/02/27/32937-395456375_large.mp4",
    "https://cdn.pixabay.com/video/2022/10/16/135161-761273563_large.mp4",
    "https://cdn.pixabay.com/video/2021/01/11/61682-500316045_large.mp4",
    "https://cdn.pixabay.com/video/2015/08/13/445-136216234_medium.mp4",
    "https://cdn.pixabay.com/video/2020/06/11/41724-430090688_large.mp4",
    'https://cdn.pixabay.com/video/2024/02/15/200657-913478674_large.mp4'
];

const healthQuotes = [
  "The greatest wealth is health.",
  "Take care of your body. It's the only place you have to live.",
  "A healthy outside starts from the inside.",
  "Sweat is just fat crying.",
  "The only bad workout is the one that didn't happen.",
  "Your body can stand almost anything. It’s your mind that you have to convince."
];

const countries = [
  { name: 'India', code: '+91', iso: 'IN' },
  { name: 'United States', code: '+1', iso: 'US' },
  { name: 'United Kingdom', code: '+44', iso: 'GB' },
  { name: 'Afghanistan', code: '+93', iso: 'AF' },
  { name: 'Albania', code: '+355', iso: 'AL' },
  { name: 'Algeria', code: '+213', iso: 'DZ' },
  { name: 'American Samoa', code: '+1-684', iso: 'AS' },
  { name: 'Andorra', code: '+376', iso: 'AD' },
  { name: 'Angola', code: '+244', iso: 'AO' },
  { name: 'Argentina', code: '+54', iso: 'AR' },
  { name: 'Australia', code: '+61', iso: 'AU' },
  { name: 'Austria', code: '+43', iso: 'AT' },
  { name: 'Bangladesh', code: '+880', iso: 'BD' },
  { name: 'Belgium', code: '+32', iso: 'BE' },
  { name: 'Brazil', code: '+55', iso: 'BR' },
  { name: 'Canada', code: '+1', iso: 'CA' },
  { name: 'China', code: '+86', iso: 'CN' },
  { name: 'Colombia', code: '+57', iso: 'CO' },
  { name: 'Denmark', code: '+45', iso: 'DK' },
  { name: 'Egypt', code: '+20', iso: 'EG' },
  { name: 'Finland', code: '+358', iso: 'FI' },
  { name: 'France', code: '+33', iso: 'FR' },
  { name: 'Germany', code: '+49', iso: 'DE' },
  { name: 'Greece', code: '+30', iso: 'GR' },
  { name: 'Hong Kong', code: '+852', iso: 'HK' },
  { name: 'Iceland', code: '+354', iso: 'IS' },
  { name: 'Indonesia', code: '+62', iso: 'ID' },
  { name: 'Iran', code: '+98', iso: 'IR' },
  { name: 'Iraq', code: '+964', iso: 'IQ' },
  { name: 'Ireland', code: '+353', iso: 'IE' },
  { name: 'Israel', code: '+972', iso: 'IL' },
  { name: 'Italy', code: '+39', iso: 'IT' },
  { name: 'Japan', code: '+81', iso: 'JP' },
  { name: 'Kenya', code: '+254', iso: 'KE' },
  { name: 'Malaysia', code: '+60', iso: 'MY' },
  { name: 'Mexico', code: '+52', iso: 'MX' },
  { name: 'Netherlands', code: '+31', iso: 'NL' },
  { name: 'New Zealand', code: '+64', iso: 'NZ' },
  { name: 'Nigeria', code: '+234', iso: 'NG' },
  { name: 'Norway', code: '+47', iso: 'NO' },
  { name: 'Pakistan', code: '+92', iso: 'PK' },
  { name: 'Philippines', code: '+63', iso: 'PH' },
  { name: 'Poland', code: '+48', iso: 'PL' },
  { name: 'Portugal', code: '+351', iso: 'PT' },
  { name: 'Qatar', code: '+974', iso: 'QA' },
  { name: 'Russia', code: '+7', iso: 'RU' },
  { name: 'Saudi Arabia', code: '+966', iso: 'SA' },
  { name: 'Singapore', code: '+65', iso: 'SG' },
  { name: 'South Africa', code: '+27', iso: 'ZA' },
  { name: 'South Korea', code: '+82', iso: 'KR' },
  { name: 'Spain', code: '+34', iso: 'ES' },
  { name: 'Sweden', code: '+46', iso: 'SE' },
  { name: 'Switzerland', code: '+41', iso: 'CH' },
  { name: 'Thailand', code: '+66', iso: 'TH' },
  { name: 'Turkey', code: '+90', iso: 'TR' },
  { name: 'Ukraine', code: '+380', iso: 'UA' },
  { name: 'United Arab Emirates', code: '+971', iso: 'AE' },
  { name: 'Vietnam', code: '+84', iso: 'VN' },
];


export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedIso, setSelectedIso] = useState("IN");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isPhoneSubmitting, setIsPhoneSubmitting] = useState(false);
  const [isOtpSubmitting, setIsOtpSubmitting] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
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
    if (resendTimer > 0) {
      const timerId = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timerId);
    }
  }, [resendTimer]);

  useEffect(() => {
    if (isVideoReady && loadingProgress >= 100) {
      // Add a small delay for a smoother transition
      const timer = setTimeout(() => setShowContent(true), 500);
      return () => clearTimeout(timer);
    }
  }, [isVideoReady, loadingProgress]);

  useEffect(() => {
    if (!isLoading && user) {
        if (user.displayName) {
            router.push('/');
        } else {
            router.push('/complete-profile');
        }
    }
  }, [user, isLoading, router]);
  
  const setupRecaptcha = () => {
    // Ensure it's only created once
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': () => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
        },
        'expired-callback': () => {
            toast({
              variant: "destructive",
              title: "reCAPTCHA Expired",
              description: "Please try sending the OTP again.",
            });
            window.recaptchaVerifier?.clear();
        }
      });
    }
  }

  const handlePhoneLogin = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setIsPhoneSubmitting(true);
    setupRecaptcha();
    const appVerifier = window.recaptchaVerifier!;
    
    const selectedCountry = countries.find(c => c.iso === selectedIso);
    if (!selectedCountry) {
        toast({ variant: 'destructive', title: 'Invalid Country', description: 'Please select a valid country.'});
        setIsPhoneSubmitting(false);
        return;
    }

    const formattedPhone = `${selectedCountry.code}${phone.replace(/\D/g, '')}`.replace(/-/g, '');

    try {
        const result = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
        setConfirmationResult(result);
        setShowOtpInput(true);
        setResendTimer(120);
        toast({ title: "OTP Sent!", description: "Check your phone for the verification code."});
    } catch (error: any) {
        console.error("SMS not sent", error);
        let description = "Please check the phone number and try again.";
        if (error.code === 'auth/too-many-requests') {
          description = "Too many requests. Please wait a while before trying again.";
        } else if (error.code === 'auth/invalid-phone-number') {
            description = "The phone number is not valid. Please check and try again.";
        }
        toast({
            variant: 'destructive',
            title: "Failed to send OTP",
            description,
        });
        // Try to reset reCAPTCHA
        try {
            const widgetId = await window.recaptchaVerifier?.render();
            if (typeof grecaptcha !== 'undefined' && grecaptcha.reset && typeof widgetId === 'number') {
                grecaptcha.reset(widgetId);
            }
        } catch(e) {
            console.error("Failed to reset reCAPTCHA", e);
        }
    } finally {
        setIsPhoneSubmitting(false);
    }
  }

  const handleOtpVerify = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!confirmationResult) return;
      setIsOtpSubmitting(true);
      try {
          await confirmationResult.confirm(otp);
          // User is signed in. The useEffect will handle the redirect.
      } catch (error: any) {
          toast({
              variant: 'destructive',
              title: "Invalid OTP",
              description: "The OTP you entered is incorrect. Please try again.",
          });
      } finally {
          setIsOtpSubmitting(false);
      }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // The useEffect will handle the redirect
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: "Login Failed",
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // The useEffect will handle the redirect
    } catch (error: any) {
       toast({
        variant: 'destructive',
        title: "Google Login Failed",
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
        <div id="recaptcha-container"></div>
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
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl">Login</CardTitle>
            <CardDescription>
              Select a method to login to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="email" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="email">Email</TabsTrigger>
                <TabsTrigger value="phone">Phone</TabsTrigger>
              </TabsList>
              <TabsContent value="email">
                <form onSubmit={handleLogin} className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="m@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center">
                      <Label htmlFor="password">Password</Label>
                      <Link
                        href="#"
                        className="ml-auto inline-block text-sm underline text-muted-foreground hover:text-card-foreground"
                      >
                        Forgot your password?
                      </Link>
                    </div>
                    <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  </div>
                  <Button type="submit" className="w-full" disabled={isSubmitting || isGoogleLoading}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Login
                  </Button>
                </form>
              </TabsContent>
              <TabsContent value="phone">
                {!showOtpInput ? (
                  <form onSubmit={handlePhoneLogin} className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="flex gap-2">
                        <Select value={selectedIso} onValueChange={setSelectedIso}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Country" />
                            </SelectTrigger>
                            <SelectContent>
                                {countries.map(country => (
                                    <SelectItem key={country.iso} value={country.iso}>
                                        {country.name} ({country.code})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Input id="phone" type="tel" placeholder="98765 43210" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                      </div>
                       <p className="text-xs text-muted-foreground">Select your country and enter your number.</p>
                    </div>
                    <Button type="submit" className="w-full" disabled={isPhoneSubmitting}>
                      {isPhoneSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Send OTP
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleOtpVerify} className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="otp">Verification Code</Label>
                      <Input id="otp" type="text" placeholder="123456" value={otp} onChange={(e) => setOtp(e.target.value)} required />
                    </div>
                    <Button type="submit" className="w-full" disabled={isOtpSubmitting}>
                      {isOtpSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Verify OTP & Login
                    </Button>
                     <div className="text-center text-sm">
                        <Button 
                            type="button" 
                            variant="link" 
                            onClick={() => handlePhoneLogin()}
                            disabled={resendTimer > 0 || isPhoneSubmitting}
                            className="p-0 h-auto"
                        >
                            {isPhoneSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            {resendTimer > 0 ? `Resend OTP in ${Math.floor(resendTimer / 60)}:${String(resendTimer % 60).padStart(2, '0')}` : 'Resend OTP'}
                        </Button>
                    </div>
                  </form>
                )}
              </TabsContent>
            </Tabs>
            
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
             <Button variant="outline" className="w-full" onClick={handleGoogleLogin} disabled={isSubmitting || isGoogleLoading || isPhoneSubmitting || isOtpSubmitting}>
              {isGoogleLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Login with Google
            </Button>
          </CardContent>
        </Card>
        <div className="mt-4 text-center text-sm text-primary-foreground/80">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="underline font-semibold text-primary-foreground">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}

    