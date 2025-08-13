
'use client';

import { useState, useEffect } from 'react';
import { HealthomaniaIcon } from '@/components/icons';

const healthQuotes = [
  "The greatest wealth is health.",
  "Take care of your body. It's the only place you have to live.",
  "A healthy outside starts from the inside.",
  "Sweat is just fat crying.",
  "The only bad workout is the one that didn't happen.",
  "Your body can stand almost anything. It’s your mind that you have to convince.",
  "Believe in yourself and all that you are. Know that there is something inside you that is greater than any obstacle.",
  "Strive for progress, not perfection."
];

export function LoadingSpinner() {
  const [quote, setQuote] = useState('');

  useEffect(() => {
    // Select a random quote on the client side to avoid hydration mismatch
    setQuote(healthQuotes[Math.floor(Math.random() * healthQuotes.length)]);
  }, []);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center space-y-6 text-center px-4">
        <HealthomaniaIcon className="h-20 w-20 animate-pulse text-primary" />
        {quote ? (
             <p className="text-lg text-muted-foreground italic">"{quote}"</p>
        ) : (
             <div className="h-7 w-48 animate-pulse rounded-md bg-muted" />
        )}
      </div>
    </div>
  );
}
