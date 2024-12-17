import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useProgress } from "@react-three/drei";

export const Loader = ({ setLoading }) => {
  const [animationFinished, setAnimationFinished] = useState(false);
  const { progress } = useProgress();

  useEffect(() => {
    if (progress === 100 && animationFinished) {
      setTimeout(() => {
        document.body.classList.remove("loading");
        setLoading(false);
      }, 4500);
    }
  }, [progress, animationFinished]);
  return (
    <>
      <motion.div
        animate={{
          opacity: progress === 100 ? 0 : 1,
        }}
        transition={{
          duration: 1.5,
          delay: 0.5,
          ease: [0.76, 0, 0.24, 1],
        }}
        onAnimationComplete={() => {
          setAnimationFinished(true);
        }}
        className="z-[200] fixed inset-0 h-[100vh] w-[100vw] bg-white"
      >
        <h1 className="absolute top-8 right-6 font-end">loading assets...</h1>
      </motion.div>
    </>
  );
};
