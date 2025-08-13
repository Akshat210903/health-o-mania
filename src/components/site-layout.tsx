
"use client";
import { type ReactNode, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from '@/components/ui/button';
import { MainNav } from './main-nav';
import { HealthomaniaIcon } from './icons';
import { PanelLeft } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import Link from 'next/link';
import { Chatbot } from './chatbot';
import { useUserData } from '@/context/user-data';
import { useRouter, usePathname } from 'next/navigation';
import { UserNav } from './user-nav';
import { LoadingSpinner } from './loading-spinner';
import { MarathonNav } from './marathon-nav';
import { AnimatedBackground } from './animated-background';

// --- Falling Runner Logic (moved from MarathonNav) ---
const Runner = ({ color, hairstyle }: { color: string, hairstyle: number }) => {
    const hairStyleOptions = [
        <div key="1" className="absolute -top-[3px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-[5px] border-b-black" />,
        <div key="2" className="absolute -top-[2px] right-[-2px] w-[5px] h-[2px] bg-black rounded-sm" />,
        <div key="3" className="absolute -top-[3px] left-1/2 -translate-x-1/2 w-[5px] h-[2px] bg-black" />,
    ];

    return (
        <div className="relative w-4 h-8">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[0.5rem] h-[0.5rem] bg-pink-200 rounded-full">
                <div className="absolute top-1/2 -translate-y-1/2 left-[1px] w-[2px] h-[2px] bg-black rounded-full" />
                {hairStyleOptions[hairstyle]}
            </div>
            <div className="absolute top-[0.4rem] left-1/2 -translate-x-1/2 w-[0.35rem] h-[0.7rem]" style={{ backgroundColor: color }} />
            <div className="absolute top-[1.1rem] left-1/2 -translate-x-1/2 w-[0.35rem] h-[0.3rem] bg-gray-600" />
            <motion.div className="absolute top-[0.5rem] right-[2px] w-[2px] h-[0.4rem]" style={{ backgroundColor: color, transformOrigin: 'top' }} animate={{ rotate: [-45, 45] }} transition={{ duration: 0.3, repeat: Infinity, repeatType: 'mirror', ease: 'linear' }} >
                <motion.div className="absolute top-[0.35rem] w-[2px] h-[0.4rem]" style={{ backgroundColor: color, transformOrigin: 'top' }} animate={{ rotate: [60, 10]}} transition={{ duration: 0.3, repeat: Infinity, repeatType: 'mirror', ease: 'linear' }} />
            </motion.div>
            <motion.div className="absolute top-[0.5rem] left-[2px] w-[2px] h-[0.4rem]" style={{ backgroundColor: color, transformOrigin: 'top' }} animate={{ rotate: [45, -45] }} transition={{ duration: 0.3, repeat: Infinity, repeatType: 'mirror', ease: 'linear' }} >
                <motion.div className="absolute top-[0.35rem] w-[2px] h-[0.4rem]" style={{ backgroundColor: color, transformOrigin: 'top' }} animate={{ rotate: [10, 60]}} transition={{ duration: 0.3, repeat: Infinity, repeatType: 'mirror', ease: 'linear' }} />
            </motion.div>
            <motion.div className="absolute top-[1.4rem] right-[2px] w-[2px] h-[0.5rem] z-10" style={{ backgroundColor: color, transformOrigin: 'top' }} animate={{ rotate: [45, -30] }} transition={{ duration: 0.3, repeat: Infinity, repeatType: 'mirror', ease: 'linear' }} >
                <motion.div className="absolute top-[0.45rem] w-[2px] h-[0.5rem]" style={{ backgroundColor: color, transformOrigin: 'top' }} animate={{ rotate: [-60, 0]}} transition={{ duration: 0.3, repeat: Infinity, repeatType: 'mirror', ease: 'linear' }} />
            </motion.div>
            <motion.div className="absolute top-[1.4rem] left-[2px] w-[2px] h-[0.5rem]" style={{ backgroundColor: color, transformOrigin: 'top' }} animate={{ rotate: [-30, 45] }} transition={{ duration: 0.3, repeat: Infinity, repeatType: 'mirror', ease: 'linear' }} >
                <motion.div className="absolute top-[0.45rem] w-[2px] h-[0.5rem]" style={{ backgroundColor: color, transformOrigin: 'top' }} animate={{ rotate: [0, -60]}} transition={{ duration: 0.3, repeat: Infinity, repeatType: 'mirror', ease: 'linear' }} />
            </motion.div>
        </div>
    );
};
const FallingRunner = ({ id, color, startX }: { id: number, color: string, startX: string }) => {
    return (
        <motion.div
            key={id}
            className="absolute z-0" 
            style={{ left: startX }}
            initial={{ top: '-10vh', rotate: 0 }}
            animate={{ top: '110vh', rotate: 720 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 3, ease: 'linear' }}
        >
             <Runner color={color} hairstyle={Math.floor(Math.random() * 3)} />
        </motion.div>
    );
};
// --- End Falling Runner Logic ---


export function SiteLayout({ children }: { children: ReactNode }) {
    const isMobile = useIsMobile();
    const { user, isLoading } = useUserData();
    const router = useRouter();
    const pathname = usePathname();
    const [fallingRunners, setFallingRunners] = useState<any[]>([]);
    
    // Falling runner state management
    useEffect(() => {
        const totalRunnersOnTrack = 7;
        const runnerColors = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef'];

        const fallInterval = setInterval(() => {
            if (Math.random() > 0.6) {
                const runnerIndexToFall = Math.floor(Math.random() * totalRunnersOnTrack);
                const startX = `${Math.random() * 90 + 5}vw`;
                const newFaller = {
                    id: Date.now() + runnerIndexToFall,
                    color: runnerColors[runnerIndexToFall % runnerColors.length],
                    startX: startX
                };
                setFallingRunners(prev => [...prev, newFaller]);
                setTimeout(() => {
                    setFallingRunners(prev => prev.filter(r => r.id !== newFaller.id));
                }, 3000);
            }
        }, 2500);
        return () => clearInterval(fallInterval);
    }, []);

    useEffect(() => {
        if (isLoading) {
            return; // Don't do anything while loading.
        }

        const isAuthFlowPage = pathname === '/login' || pathname === '/register' || pathname === '/complete-profile';

        // If not logged in and not on an auth-related page, redirect to login
        if (!user && !isAuthFlowPage) {
            router.push('/login');
            return;
        }

        // If logged in, but profile is not complete, redirect to completion page
        // This won't run on the completion page itself because it doesn't use SiteLayout
        if (user && !user.displayName && !isAuthFlowPage) {
            router.push('/complete-profile');
            return;
        }

    }, [isLoading, user, pathname, router]);

    // Show a loading spinner while we check auth status
    if (isLoading) {
        return <LoadingSpinner />;
    }
    
    // For pages that handle their own layout (login, register, complete-profile)
    // they are rendered here when the user is not yet fully authenticated/profiled.
    if (!user || !user.displayName) {
        return <>{children}</>;
    }

    const sidebarContent = (
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-white/20 shadow-lg">
           <Link href="/" className="flex items-center space-x-3">
            <HealthomaniaIcon className="h-8 w-8 text-primary" />
            <div>
                <p className="font-bold text-xl tracking-tight">Health-O-Mania</p>
                <p className="text-xs text-muted-foreground -mt-1">The Health Hero</p>
            </div>
          </Link>
        </div>
        <div className="flex-1 p-2">
          <MainNav />
        </div>
      </div>
    );
    
  return (
    <div className="w-full min-h-screen relative">
        <AnimatedBackground />
        <AnimatePresence>
            {fallingRunners.map(runner => (
                <FallingRunner key={runner.id} {...runner} />
            ))}
        </AnimatePresence>
        {isMobile ? (
             <div className="flex flex-col min-h-screen w-full">
                <header className="sticky top-0 z-30 flex flex-col border-b shrink-0 bg-card/70 backdrop-blur-md shadow-2xl">
                    <div className="flex h-16 items-center gap-4 px-4 md:px-6">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="outline" size="icon" className="shrink-0">
                                    <PanelLeft className="h-5 w-5" />
                                    <span className="sr-only">Toggle navigation menu</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="p-0 w-72 bg-card/70 backdrop-blur-md shadow-2xl">
                                {sidebarContent}
                            </SheetContent>
                        </Sheet>
                        <Link href="/" className="flex items-center gap-2 font-bold flex-1">
                        <HealthomaniaIcon className="h-6 w-6 text-primary" />
                        <span>Health-O-Mania</span>
                        </Link>
                        <UserNav />
                    </div>
                    <MarathonNav />
                </header>
                <main className="flex-1 overflow-y-auto relative z-10 bg-transparent">
                    {children}
                </main>
                <Chatbot />
            </div>
        ) : (
            <div className="grid w-full min-h-screen md:grid-cols-[280px_1fr]">
                <aside className="hidden md:block shadow-2xl z-20 bg-card/70 backdrop-blur-md">
                    {sidebarContent}
                </aside>
                <div className="flex flex-col max-h-screen">
                    <header className="flex flex-col h-auto shrink-0 border-b border-border/50 z-20 bg-card/70 backdrop-blur-md shadow-2xl">
                        <div className="flex h-16 items-center gap-4 px-6">
                            <div className="flex-1" />
                            <UserNav />
                        </div>
                        <MarathonNav />
                    </header>
                    <main className="flex-1 overflow-y-auto relative z-10 bg-transparent">
                        {children}
                    </main>
                </div>
                <Chatbot />
            </div>
        )}
    </div>
  );
}
