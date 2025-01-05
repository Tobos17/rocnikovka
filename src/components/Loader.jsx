import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useProgress } from "@react-three/drei";

const dotAnimation = {
  hidden: { opacity: 0 },
  visible: (i) => ({
    opacity: 1,
    transition: {
      delay: i * 0.2,
      repeat: Infinity,
      repeatType: "mirror",
      duration: 0.5,
      ease: "easeInOut",
    },
  }),
};

export const Loader = ({ setLoading }) => {
  const [animation, setAnimation] = useState(true);
  const { progress } = useProgress();

  useEffect(() => {
    if (progress === 100) {
      setAnimation(false);
      setLoading(false);
    }
  }, [progress]);

  return useMemo(
    () => (
      <AnimatePresence mode="wait">
        {animation && (
          <motion.div
            style={{ willChange: "opacity", opacity: 1 }}
            exit={{
              opacity: 0,
            }}
            transition={{
              duration: 2,
              delay: 2,
              ease: [0.25, 0.8, 0.25, 1],
            }}
            // onAnimationComplete={() => {}}
            className="z-[200] fixed inset-0 h-screen w-full bg-white"
          >
            <h1 className="absolute top-8 right-8 font-end text-xl flex">
              loading assets ...
            </h1>
          </motion.div>
        )}
      </AnimatePresence>
    ),
    [animation]
  );
};
