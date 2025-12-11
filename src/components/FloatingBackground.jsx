import React from 'react';
import { motion } from 'framer-motion';

const FloatingBackground = () => {
    const texts = Array.from({ length: 6 }); // 6 instances of the text

    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            {texts.map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute font-bold text-blue-600/20 select-none"
                    initial={{
                        x: Math.random() * window.innerWidth,
                        y: Math.random() * window.innerHeight,
                        opacity: 0
                    }}
                    animate={{
                        x: [
                            Math.random() * window.innerWidth,
                            Math.random() * window.innerWidth,
                            Math.random() * window.innerWidth
                        ],
                        y: [
                            Math.random() * window.innerHeight,
                            Math.random() * window.innerHeight,
                            Math.random() * window.innerHeight
                        ],
                        rotate: [0, 180, 360],
                        opacity: [0.2, 0.5, 0.2]
                    }}
                    transition={{
                        duration: 20 + Math.random() * 10,
                        repeat: Infinity,
                        repeatType: "reverse",
                        ease: "linear"
                    }}
                    style={{
                        fontSize: `${Math.max(2, Math.random() * 4)}rem`, // Random sizes
                    }}
                >
                    atif.dev
                </motion.div>
            ))}
        </div>
    );
};

export default FloatingBackground;
