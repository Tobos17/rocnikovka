import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useProgress } from "@react-three/drei";

export const Loader = ({ setLoading }) => {
  const [animation, setAnimation] = useState(true);
  const { progress } = useProgress();

  useEffect(() => {
    if (progress === 100) {
      setAnimation(false);
      setLoading(false);
    }
  }, [progress]);

  return (
    <AnimatePresence mode="wait">
      {animation && (
        <motion.div
          style={{ willChange: "opacity", opacity: 0.995 }}
          exit={{
            opacity: 0,
            display: "none",
          }}
          transition={{
            duration: 2,
            delay: 2,
            ease: [0.25, 0.8, 0.25, 1],
          }}
          // onAnimationComplete={() => {}}
          className="z-[200] fixed inset-0 h-screen h-svh w-full bg-white"
        >
          <h1 className="absolute top-8 right-8 font-end text-xl flex">
            loading assets
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: 0.2,
              }}
            >
              .
            </motion.span>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: 0.4,
              }}
            >
              .
            </motion.span>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: 0.6,
              }}
            >
              .
            </motion.span>
          </h1>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
