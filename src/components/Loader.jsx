import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useProgress } from "@react-three/drei";

const title = ["p", "l", "a", "t", "n", "o", "a", "d", "l", "a", "t", "o"];

export const Loader = ({ setLoading }) => {
  const { progress } = useProgress();
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
          setTimeout(() => {
            document.body.classList.remove("loading");
            setLoading(false);
          }, 4500);
        }}
        className="z-[200] fixed inset-0 h-[100vh] w-[100vw] bg-white"
      >
        <h1 className="absolute top-10 right-10 font-end">loading assets...</h1>
      </motion.div>
    </>
  );
};
