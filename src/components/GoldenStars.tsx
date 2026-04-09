import React, { useMemo } from 'react';

interface Star {
    id: number;
    top: string;
    left: string;
    size: number;
    twinkleDuration: string;
    delay: string;
    color: string;
}

const GoldenStars: React.FC = () => {
    const stars = useMemo(() => {
        const starCount = 80; // Cantidad óptima y menos saturada para un Viewport fijo
        const generatedStars: Star[] = [];

        for (let i = 0; i < starCount; i++) {
            const isLarge = Math.random() > 0.8;
            generatedStars.push({
                id: i,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                size: isLarge ? Math.random() * 5 + 5 : Math.random() * 3 + 2, // Sizes up to 10px
                twinkleDuration: `${Math.random() * 1.5 + 1}s`, // Very fast pulse
                delay: `${Math.random() * 3}s`,
                color: Math.random() > 0.3 ? '#FFD700' : '#FFFFFF', // Mix of gold and bright white
            });
        }
        return generatedStars;
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-[5]">
            {stars.map((star) => (
                <div
                    key={star.id}
                    className="absolute rounded-full animate-twinkle-hyper"
                    style={{
                        top: star.top,
                        left: star.left,
                        width: `${star.size}px`,
                        height: `${star.size}px`,
                        backgroundColor: star.color,
                        boxShadow: `0 0 ${star.size * 3}px ${star.color}, 0 0 ${star.size * 6}px ${star.color}`,
                        '--twinkle-duration': star.twinkleDuration,
                        animationDelay: star.delay,
                    } as React.CSSProperties}
                >
                    {/* Lens Flare effect for larger stars */}
                    {star.size > 6 && (
                        <>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400%] h-[1px] bg-white opacity-50 blur-[1px]"></div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1px] h-[400%] bg-white opacity-50 blur-[1px]"></div>
                        </>
                    )}
                </div>
            ))}
        </div>
    );
};

export default GoldenStars;
