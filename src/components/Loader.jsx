import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useProgress } from "@react-three/drei";

export const Loader = ({ setLoading }) => {
  const [animationFinished, setAnimationFinished] = useState(false);
  const [loadingAnim, setLoadingAnim] = useState(true);
  const { progress } = useProgress();

  useEffect(() => {
    if (progress === 100) {
      setLoadingAnim(false);
    }
  }, [progress]);

  useEffect(() => {
    if (animationFinished) {
      setTimeout(() => {
        document.body.classList.remove("loading");
        setLoading(false);
      }, 2000);
    }
  }, [animationFinished]);
  return useMemo(
    () => (
      <AnimatePresence mode="wait">
        {loadingAnim && (
          <motion.div
            style={{ willChange: "opacity", opacity: 1 }}
            exit={{
              opacity: 0,
            }}
            transition={{
              duration: 1.5,
              delay: 0.5,
              ease: [0.76, 0, 0.24, 1],
            }}
            onAnimationComplete={() => {
              setAnimationFinished(true);
            }}
            className="z-[200] fixed inset-0 h-screen w-full bg-white"
          >
            <h1 className="absolute top-8 right-6 font-end">
              loading assets...
            </h1>
          </motion.div>
        )}
      </AnimatePresence>
    ),
    [loadingAnim]
  );
};
