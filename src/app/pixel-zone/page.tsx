
"use client";

import Link from 'next/link';
import { useState, type FC, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Heart, Shield, Skull, Swords, Users, Crown } from 'lucide-react';
import Image from 'next/image';
import { useUserData, type Friend } from '@/context/user-data';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Dumbbell, Grape, Citrus, Weight } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';


const PixelCard = ({ children, className }: { children: ReactNode, className?: string }) => (
    <div className={cn("bg-[#333] border-4 border-double border-gray-400 p-4 shadow-lg", className)}>
        {children}
    </div>
);

const StatBar = ({ label, value, max, colorClass, icon }: { label: string, value: number, max: number, colorClass: string, icon?: ReactNode }) => {
    const percentage = max > 0 ? (value / max) * 100 : 0;
    return (
        <div>
            <div className="flex justify-between items-center mb-1 text-sm">
                <span className="font-bold flex items-center gap-1">{icon}{label}</span>
                <span>{value}/{max}</span>
            </div>
            <div className="h-5 w-full bg-black border-2 border-gray-500">
                <div style={{ width: `${percentage}%` }} className={`h-full ${colorClass}`}></div>
            </div>
        </div>
    )
};

const ProjectileIcon: FC<{ name: string }> = ({ name }) => {
    switch (name) {
        case 'dumbbell': return <Dumbbell className="h-6 w-6 text-yellow-300" />;
        case 'grape': return <Grape className="h-6 w-6 text-purple-400" />;
        case 'citrus': return <Citrus className="h-6 w-6 text-orange-400" />;
        case 'weight':
        default: return <Weight className="h-6 w-6 text-gray-400" />;
    }
};

const projectileTypes = ['dumbbell', 'grape', 'citrus', 'weight'];


export default function PixelZonePage() {
    const { userProfile, friends, isLoading } = useUserData();
    const [isAnimating, setIsAnimating] = useState(false);
    const [projectiles, setProjectiles] = useState<any[]>([]);
    const [selectedRival, setSelectedRival] = useState<Friend | null>(null);

    const handleAnimation = () => {
        if (isAnimating) return;

        setIsAnimating(true);
        const projectileCount = 32;
        const newProjectiles = Array.from({ length: projectileCount }).map((_, i) => ({
            id: i,
            fromLeft: true,
            fromRight: false,
            icon: projectileTypes[Math.floor(Math.random() * projectileTypes.length)],
            style: {
                top: `${Math.random() * 80 + 10}%`,
                animationDelay: `${Math.random() * 0.4}s`,
                '--tw-rotate': `${Math.random() * 720 - 360}deg`
            } as React.CSSProperties
        }));
        setProjectiles(newProjectiles);

        setTimeout(() => {
            setIsAnimating(false);
            setProjectiles([]);
        }, 1500); // Duration of the clash animation
    };
    
    if (isLoading || !userProfile) {
        return <PixelZoneSkeleton />
    }
    
    const headerContent = (
        <div className="mb-6 flex justify-between items-center">
            <Link href="/">
                <Button variant="ghost" className="text-primary hover:bg-gray-700 hover:text-white">
                   <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home Page
                </Button>
            </Link>
        </div>
    );
    
    return (
        <div className="bg-[#212121] text-[#f5f5f5] font-pixel min-h-screen p-4 md:p-8 overflow-hidden">
            <div className="max-w-5xl mx-auto">
                {headerContent}
                
                <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl text-primary" style={{ textShadow: '3px 3px #000' }}>
                        PIXEL ZONE
                    </h1>
                    <p className="text-gray-400 mt-2">-- BATTLE ARENA --</p>
                </div>
                
                 <Card className="mb-8 bg-zinc-800 border-zinc-700">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2"><Users /> Select a Rival</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {friends.length > 0 ? (
                             <Select onValueChange={(id) => setSelectedRival(friends.find(f => f.id === id) || null)}>
                                <SelectTrigger className="w-full md:w-1/2 font-pixel bg-zinc-700 border-zinc-600 text-base">
                                    <SelectValue placeholder="Challenge a friend..." />
                                </SelectTrigger>
                                <SelectContent className="font-pixel bg-zinc-800 border-zinc-700 text-white">
                                    {friends.map(friend => (
                                        <SelectItem key={friend.id} value={friend.id} className="focus:bg-primary focus:text-black">
                                            {friend.name} (Lvl {friend.level})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        ): (
                            <p className="text-muted-foreground text-center">You have no friends to challenge. <Link href="/friends" className="underline text-primary">Add some!</Link></p>
                        )}
                    </CardContent>
                </Card>

                <div className="relative">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                        <PixelCard className={cn("border-primary transition-transform duration-300 z-10", isAnimating && 'animate-clash-player')}>
                            <h2 className="text-2xl text-center mb-4 text-primary">{userProfile.name}</h2>
                            <div className="flex flex-col items-center sm:flex-row sm:items-start gap-4">
                                <Image src={userProfile.photoURL || "https://placehold.co/128x128.png"} alt="Player Avatar" width={128} height={128} className="border-4 border-primary" data-ai-hint="pixel avatar" />
                                <div className="flex-1 w-full space-y-2">
                                    <StatBar label="Level" value={userProfile.level} max={100} colorClass="bg-blue-500" icon={<Crown />} />
                                    <StatBar label="HP" value={100} max={100} colorClass="bg-green-500" icon={<Heart />} />
                                    <StatBar label="XP" value={userProfile.xp} max={userProfile.xpToNextLevel} colorClass="bg-yellow-500" icon={<Shield />} />
                                </div>
                            </div>
                        </PixelCard>
                        
                        <PixelCard className={cn("border-purple-500 transition-transform duration-300 z-10", isAnimating && 'animate-clash-rival')}>
                            <h2 className="text-2xl text-center mb-4 text-purple-500">{selectedRival ? selectedRival.name : 'RAID BOSS'}</h2>
                             <div className="flex flex-col items-center sm:flex-row sm:items-start gap-4">
                                {selectedRival ? (
                                    <>
                                        <Image src={selectedRival.photoURL || "https://placehold.co/128x128.png"} alt="Rival Avatar" width={128} height={128} className="border-4 border-purple-500" data-ai-hint="pixel avatar" />
                                        <div className="flex-1 w-full space-y-2">
                                             <StatBar label="Level" value={selectedRival.level} max={100} colorClass="bg-blue-500" icon={<Crown />} />
                                            <StatBar label="HP" value={100} max={100} colorClass="bg-green-500" icon={<Heart />} />
                                            <StatBar label="XP" value={selectedRival.xp} max={selectedRival.xpToNextLevel} colorClass="bg-yellow-500" icon={<Shield />} />
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center w-full gap-4">
                                        <Image src="https://placehold.co/256x256.png" alt="Raid Boss" width={256} height={256} className="border-4 border-purple-500" data-ai-hint="pixel monster" />
                                        <div className="w-full space-y-2 text-center">
                                            <p className="flex items-center gap-2 justify-center text-red-500"><Skull className="h-5 w-5" /> GIGA-SALAD</p>
                                            <StatBar label="HP" value={5000} max={5000} colorClass="bg-red-500" icon={<Heart />} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </PixelCard>
                    </div>
                    
                    {isAnimating && (
                        <div className="absolute inset-0 w-full h-full pointer-events-none">
                            {projectiles.map((p: any) => (
                                <div key={p.id} className={'absolute animate-fly-from-left'} style={p.style}>
                                    <ProjectileIcon name={p.icon} />
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="text-center my-8">
                        <Button onClick={handleAnimation} disabled={isAnimating} className="font-pixel bg-yellow-400 text-black hover:bg-yellow-500 text-2xl p-8 border-4 border-black active:translate-y-1">
                            <Swords className="mr-4 h-8 w-8" />
                            {isAnimating ? 'ATTACKING...' : 'ATTACK!'}
                        </Button>
                    </div>
                </div>

                 <div className="text-center mt-8">
                     <Link href="/scoreboard">
                        <Button className="font-pixel bg-secondary text-secondary-foreground hover:bg-secondary/90 text-lg p-6">
                            View Scoreboard
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}

function PixelZoneSkeleton() {
    return (
         <div className="bg-[#212121] text-[#f5f5f5] font-pixel min-h-screen p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                   <Skeleton className="h-10 w-48 bg-gray-700" />
                </div>
                <div className="text-center mb-8">
                    <Skeleton className="h-12 w-3/4 mx-auto bg-gray-700" />
                    <Skeleton className="h-4 w-1/2 mx-auto mt-2 bg-gray-700" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Skeleton className="h-40 w-full bg-gray-700" />
                    <Skeleton className="h-40 w-full bg-gray-700" />
                </div>
            </div>
        </div>
    )
}
