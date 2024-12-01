import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import useDimension from "../../hooks/useDimension";
import gsap from "gsap";

const title = ["p", "l", "a", "t", "n", "o", "a", "d", "l", "a", "t", "o"];

const Loader = ({ setAnimLoading, isLoaded }) => {
  const { screenWidth } = useDimension();

  const [initialAnim, setInitialAnim] = useState(true);

  const itemMain = {
    hidden: { y: 35, scale: 0.75 },
    show: (i) => ({
      y: 0,
      scale: 1,
      transition: {
        display: {
          duration: 0.1,
        },
        y: {
          duration: 1,
          type: "tween",
          ease: [0.76, 0, 0.24, 1],
          delay: i * 0.15 + 0.5,
          repeatType: "loop",
        },
        scale: {
          duration: 1,
          type: "tween",
          ease: [0.76, 0, 0.24, 1],
          delay: i * 0.15 + 0.5,
        },
      },
    }),
  };

  const refs = useRef([]);

  useEffect(() => {
    if (initialAnim) return;

    const timeline = gsap.to(refs.current, {
      opacity: 0,
      duration: 1,
      stagger: 0.15,
      ease: "none",
      repeat: -1,
      yoyo: true,
      yoyoEase: true,
      onRepeat: () => {
        if (isLoaded) {
          timeline.kill();
          setAnimLoading(false);
        }
      },
    });
  }, [initialAnim, isLoaded]);

  const width =
    screenWidth === undefined || screenWidth === null || screenWidth === 0
      ? window.innerWidth
      : screenWidth;

  const initialPath = `M0 0 L${width} 0 V 100 Q${width / 2} 35 0 100`;
  const targetPath = `M0 0 L${width} 0 V 0 Q${width / 2} 0 0 0`;

  const curve = {
    initial: {
      d: initialPath,
    },
    enter: {
      d: targetPath,
    },
  };

  useEffect(() => {
    const handleResize = () => {
      window.location.reload();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="relative h-full w-full">
      <motion.div className="z-[50] absolute top-0 left-0 h-screen w-screen flex justify-center items-center gap-[0.6rem] sm:gap-4 xl:gap-5">
        {[...title].map((text, i) => (
          <motion.h1
            ref={(el) => (refs.current[i] = el)}
            key={i}
            className="relative text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-title text-white pointer-events-none"
            layoutId={`main-image-1-${i}`}
            custom={i}
            variants={itemMain}
            initial="hidden"
            animate="show"
            onAnimationComplete={() => {
              if (i === title.length - 1) setInitialAnim(false);
            }}
          >
            {text}
          </motion.h1>
        ))}
      </motion.div>

      <motion.div
        exit={{ top: "-100vh" }}
        transition={{ duration: 1.25, ease: [0.76, 0, 0.24, 1] }}
        className="z-[40] absolute top-0 left-0 h-screen w-full bg-zinc-950"
      ></motion.div>

      <div className="z-[150] absolute top-0 left-0 h-screen w-full overflow-hidden">
        <motion.svg
          initial={{ top: "100vh" }}
          exit={{ top: "0vh" }}
          transition={{ duration: 1.25, ease: [0.76, 0, 0.24, 1] }}
          className="z-[150] absolute  h-[100px] w-full left-0 top-[100vh] stroke-none fill-zinc-950 pointer-events-none"
        >
          <motion.path
            variants={curve}
            initial="initial"
            exit="enter"
            transition={{ duration: 2, ease: [0.76, 0, 0.24, 1] }}
          ></motion.path>
        </motion.svg>
      </div>
    </div>
  );
};

export default Loader;
