import { useEffect, useState, useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export const Cursor = () => {
  const cursor = useRef(null);
  const cursorSize = 20;

  const mouse = {
    x: useMotionValue(0),
    y: useMotionValue(0),
  };

  //Smooth out the mouse values
  const smoothOptions = { damping: 20, stiffness: 300, mass: 0.5 };
  const smoothMouse = {
    x: useSpring(mouse.x, smoothOptions),
    y: useSpring(mouse.y, smoothOptions),
  };

  const manageMouseMove = (e) => {
    const { clientX, clientY } = e;

    mouse.x.set(clientX - cursorSize / 2);
    mouse.y.set(clientY - cursorSize / 2);
  };

  const manageMouseOut = (e) => {
    cursor.current.style.display = "none";
  };

  const manageMouseOver = (e) => {
    cursor.current.style.display = "block";
  };

  useEffect(() => {
    cursor.current.style.display = "none";
    window.addEventListener("mousemove", manageMouseMove);
    window.addEventListener("mouseout", manageMouseOut);
    window.addEventListener("mouseover", manageMouseOver);

    return () => {
      window.removeEventListener("mousemove", manageMouseMove);
      window.removeEventListener("mouseout", manageMouseOut);
      window.removeEventListener("mouseover", manageMouseOver);
    };
  }, []);

  return (
    <motion.div
      style={{
        left: smoothMouse.x,
        top: smoothMouse.y,
        opacity: 0.75,
      }}
      className="z-[200] fixed w-[20px] h-[20px] bg-white rounded-[50%] pointer-events-none"
      ref={cursor}
    ></motion.div>
  );
};
