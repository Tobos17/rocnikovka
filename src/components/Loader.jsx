import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const title = ["p", "l", "a", "t", "n", "o", "a", "d", "l", "a", "t", "o"];

export const Loader = ({ setLoading }) => {
  return (
    <>
      <motion.h1
        exit={{
          opacity: 0,
          transition: {
            duration: 0.5,
            ease: "easeInOut",
          },
        }}
        className="fixed z-[60] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-title text-8xl text-white"
      >
        INSANITY
      </motion.h1>
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 1, duration: 2, ease: [0.76, 0, 0.24, 1] }}
        onAnimationComplete={() => {
          setTimeout(() => {
            document.body.classList.remove("loading");
            setLoading(false);
          }, 2500);
        }}
        exit={{
          top: "-115vh",
          rotate: "-4deg",
          transition: {
            duration: 2.75,
            ease: [0.25, 0, 0.24, 1],
          },
        }}
        className="z-[50] fixed inset-0 h-[115vh] w-[105vw] bg-zinc-950"
        style={{
          transformOrigin: "bottom right",
          clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 87.5%)",
        }}
      ></motion.div>
    </>
  );
};
