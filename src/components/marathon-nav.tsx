
"use client";

import React from 'react';
import { motion } from 'framer-motion';

// A simple component to represent a running character
const Runner = ({ color, hairstyle }: { color: string, hairstyle: number }) => {
    const hairStyleOptions = [
        // Style 1: Spiky
        <div key="1" className="absolute -top-[3px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-[5px] border-b-black" />,
        // Style 2: Ponytail (now on the left side to indicate rightward facing)
        <div key="2" className="absolute -top-[2px] right-[-2px] w-[5px] h-[2px] bg-black rounded-sm" />,
        // Style 3: Flat top
        <div key="3" className="absolute -top-[3px] left-1/2 -translate-x-1/2 w-[5px] h-[2px] bg-black" />,
    ];

    return (
        <div className="relative w-4 h-8"> 
            {/* Head */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[0.5rem] h-[0.5rem] bg-pink-200 rounded-full">
                {/* Eye */}
                <div className="absolute top-1/2 -translate-y-1/2 left-[1px] w-[2px] h-[2px] bg-black rounded-full" />
                {hairStyleOptions[hairstyle]}
            </div>
            
            {/* Torso */}
            <div className="absolute top-[0.4rem] left-1/2 -translate-x-1/2 w-[0.35rem] h-[0.7rem]" style={{ backgroundColor: color }} />
            {/* Shorts */}
            <div className="absolute top-[1.1rem] left-1/2 -translate-x-1/2 w-[0.35rem] h-[0.3rem] bg-gray-600" />
            
             {/* Arms with bending elbows */}
            <motion.div
                className="absolute top-[0.5rem] right-[2px] w-[2px] h-[0.4rem]" // Upper Arm 1
                style={{ backgroundColor: color, transformOrigin: 'top' }}
                animate={{ rotate: [-45, 45] }}
                transition={{ duration: 0.3, repeat: Infinity, repeatType: 'mirror', ease: 'linear' }}
            >
                <motion.div 
                    className="absolute top-[0.35rem] w-[2px] h-[0.4rem]" // Forearm 1
                    style={{ backgroundColor: color, transformOrigin: 'top' }}
                    animate={{ rotate: [60, 10]}}
                    transition={{ duration: 0.3, repeat: Infinity, repeatType: 'mirror', ease: 'linear' }}
                />
            </motion.div>
            <motion.div
                className="absolute top-[0.5rem] left-[2px] w-[2px] h-[0.4rem]" // Upper Arm 2
                style={{ backgroundColor: color, transformOrigin: 'top' }}
                animate={{ rotate: [45, -45] }}
                transition={{ duration: 0.3, repeat: Infinity, repeatType: 'mirror', ease: 'linear' }}
            >
                <motion.div 
                    className="absolute top-[0.35rem] w-[2px] h-[0.4rem]" // Forearm 2
                    style={{ backgroundColor: color, transformOrigin: 'top' }}
                    animate={{ rotate: [10, 60]}}
                    transition={{ duration: 0.3, repeat: Infinity, repeatType: 'mirror', ease: 'linear' }}
                />
            </motion.div>

            {/* Legs with bending knees */}
             <motion.div
                className="absolute top-[1.4rem] right-[2px] w-[2px] h-[0.5rem] z-10" // Thigh 1
                style={{ backgroundColor: color, transformOrigin: 'top' }}
                animate={{ rotate: [45, -30] }}
                transition={{ duration: 0.3, repeat: Infinity, repeatType: 'mirror', ease: 'linear' }}
            >
                <motion.div 
                    className="absolute top-[0.45rem] w-[2px] h-[0.5rem]" // Calf 1
                    style={{ backgroundColor: color, transformOrigin: 'top' }}
                    animate={{ rotate: [-60, 0]}}
                    transition={{ duration: 0.3, repeat: Infinity, repeatType: 'mirror', ease: 'linear' }}
                />
            </motion.div>
             <motion.div
                className="absolute top-[1.4rem] left-[2px] w-[2px] h-[0.5rem]" // Thigh 2
                style={{ backgroundColor: color, transformOrigin: 'top' }}
                animate={{ rotate: [-30, 45] }}
                transition={{ duration: 0.3, repeat: Infinity, repeatType: 'mirror', ease: 'linear' }}
            >
                <motion.div 
                    className="absolute top-[0.45rem] w-[2px] h-[0.5rem]" // Calf 2
                    style={{ backgroundColor: color, transformOrigin: 'top' }}
                    animate={{ rotate: [0, -60]}}
                    transition={{ duration: 0.3, repeat: Infinity, repeatType: 'mirror', ease: 'linear' }}
                />
            </motion.div>
        </div>
    );
};

// A single firework particle
const Firework = ({ delay }: { delay: number }) => (
    <motion.div
        className="absolute bottom-2 rounded-full w-1 h-1 bg-yellow-300"
        initial={{ y: 0, scale: 0.5, opacity: 1 }}
        animate={{
            y: [0, -20, -15, -30],
            x: [0, 5, -5, 0],
            scale: [0.5, 1, 0.8, 0],
            opacity: [1, 1, 1, 0],
        }}
        transition={{
            duration: 0.8,
            repeat: Infinity,
            repeatType: 'loop',
            delay: delay,
            ease: 'easeOut',
        }}
    />
);

// Container for the celebration effect
const Celebration = () => (
    <div className="absolute left-[26px] bottom-0 h-full w-10">
        {[...Array(5)].map((_, i) => (
            <Firework key={i} delay={i * 0.15} />
        ))}
    </div>
);

// Main component for the marathon animation
export const MarathonNav = () => {
    const totalRunnersOnTrack = 7;
    const runnerColors = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef'];

    return (
        <div className="relative h-[50px] w-full bg-zinc-800 border-b-2 border-zinc-900 overflow-hidden">
            {/* The track elements: road lines and finish line */}
            <div className="absolute inset-0 flex items-center justify-between">
                 <div className="w-full h-1 bg-white/50" style={{
                     backgroundImage: "linear-gradient(to right, white 50%, transparent 50%)",
                     backgroundSize: "40px 100%",
                     backgroundRepeat: "repeat-x",
                 }} />
            </div>
             <div className="absolute left-[41px] bottom-0 h-full w-3 bg-white" style={{ backgroundImage: 'repeating-conic-gradient(black 0% 25%, white 0% 50%)', backgroundSize: '8px 8px' }} />

            
            {/* Celebration at finish line */}
            <Celebration />

            {/* The runners on the track */}
            {[...Array(totalRunnersOnTrack)].map((_, i) => (
                 <motion.div
                    key={i}
                    className="absolute bottom-[2px]"
                    initial={{ x: '100vw' }}
                    animate={{ x: '-40px' }}
                    transition={{
                        duration: 8 + Math.random() * 5, // give them random speeds
                        repeat: Infinity,
                        ease: 'linear',
                        delay: Math.random() * 8 // stagger their start times
                    }}
                >
                    {/* Bouncing animation for jumping hurdles */}
                    <motion.div
                        className="w-full h-full"
                        animate={{ y: [0, -6, 0] }} // Increased jump height for more energy
                        transition={{
                            duration: 0.5,
                            repeat: Infinity,
                            ease: 'easeInOut',
                            repeatType: 'mirror',
                            delay: Math.random() * 0.3
                        }}
                    >
                        <Runner color={runnerColors[i]} hairstyle={i % 3} />
                    </motion.div>
                </motion.div>
            ))}
        </div>
    );
};
