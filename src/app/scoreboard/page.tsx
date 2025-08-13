
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useUserData } from '@/context/user-data';
import { Skeleton } from '@/components/ui/skeleton';

const xpLogs = [
  { date: '2025-07-21', xp: 450, rank: 1 },
  { date: '2025-07-20', xp: 200, rank: 3 },
  { date: '2025-07-19', xp: 600, rank: 1 },
  { date: '2025-07-18', xp: 300, rank: 2 },
  { date: '2025-07-17', xp: 150, rank: 4 },
];

export default function ScoreboardPage() {
    const { userProfile, isLoading } = useUserData();
    
    if (isLoading || !userProfile) {
        return <ScoreboardSkeleton />;
    }

    return (
        <div className="bg-[#212121] text-[#f5f5f5] font-pixel min-h-screen p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                    <Link href="/pixel-zone">
                        <Button variant="ghost" className="text-primary hover:bg-gray-700 hover:text-white">
                           <ArrowLeft className="mr-2 h-4 w-4" /> Back to Pixel Zone
                        </Button>
                    </Link>
                </div>

                <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl text-primary" style={{ textShadow: '3px 3px #000' }}>
                        SCOREBOARD
                    </h1>
                    <p className="text-gray-400 mt-2">-- DAILY XP LOG --</p>
                </div>

                <div className="border-4 border-double border-gray-400 bg-[#333] shadow-lg">
                    <div className="grid grid-cols-3 text-center p-4 border-b-4 border-double border-gray-400">
                        <div className="font-bold">DATE</div>
                        <div className="font-bold text-green-400">{userProfile.name} XP</div>
                        <div className="font-bold">RANK</div>
                    </div>
                    <div className="p-2">
                        {xpLogs.map((log) => (
                            <div key={log.date} className="grid grid-cols-3 text-center p-3 hover:bg-gray-700 transition-colors duration-200">
                                <div>{log.date}</div>
                                <div className="text-green-400">{log.xp}</div>
                                <div className="text-yellow-400">#{log.rank}</div>
                            </div>
                        ))}
                    </div>
                </div>

                 <div className="text-center mt-8">
                     <Link href="/">
                        <Button className="font-pixel bg-primary text-primary-foreground hover:bg-primary/90 text-lg p-6">
                            Return to Dashboard
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}

function ScoreboardSkeleton() {
    return (
         <div className="bg-[#212121] text-[#f5f5f5] font-pixel min-h-screen p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                 <div className="mb-6">
                   <Skeleton className="h-10 w-52 bg-gray-700" />
                </div>
                 <div className="text-center mb-8">
                    <Skeleton className="h-12 w-3/4 mx-auto bg-gray-700" />
                    <Skeleton className="h-4 w-1/2 mx-auto mt-2 bg-gray-700" />
                </div>
                <Skeleton className="h-96 w-full bg-gray-700" />
            </div>
         </div>
    )
}
