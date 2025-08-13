
"use client";

import Image from 'next/image';

const imageUrl = 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=2070&auto=format&fit=crop';

export const Background = () => {
    return (
        <div className="fixed inset-0 w-full h-full -z-10 overflow-hidden">
            <Image
                src={imageUrl}
                alt="Fitness background"
                layout="fill"
                objectFit="cover"
                className="opacity-30"
                priority
            />
        </div>
    );
};
