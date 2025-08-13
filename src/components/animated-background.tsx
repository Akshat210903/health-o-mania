"use client";

const videoUrl = 'https://cdn.pixabay.com/video/2023/11/19/189813-887078786_large.mp4';

export const AnimatedBackground = () => {
    return (
        <video
            autoPlay
            loop
            muted
            playsInline
            className="fixed inset-0 w-full h-full -z-10 object-cover opacity-30"
            src={videoUrl}
        >
            Your browser does not support the video tag.
        </video>
    );
};
