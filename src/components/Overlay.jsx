import gsap from "gsap";
import React, { useEffect, useLayoutEffect, useRef } from "react";
import { Navbar } from "./Navbar";

export const Overlay = ({ tl, isScrolled }) => {
  const textRefs = useRef([]);
  useLayoutEffect(() => {
    if (tl.current) {
      tl.current.to(
        "#targetSection",
        { translateZ: 5000, ease: "none", duration: 4 }, // Ease "none" for linear animation
        0 // Start at the beginning of the timeline
      );

      tl.current.fromTo(
        textRefs.current[1],
        { opacity: 0 },
        { opacity: 1, ease: "none", duration: 0.075 }, // Ease "none" for linear animation
        1.01 // Start at the beginning of the timeline
      );

      tl.current.fromTo(
        textRefs.current[2],
        { opacity: 0 },
        { opacity: 1, ease: "none", duration: 0.075 }, // Ease "none" for linear animation
        1.572 // Start at the beginning of the timeline
      );

      tl.current.fromTo(
        textRefs.current[3],
        { x: "-22.5vw" },
        { x: "0", ease: "none", duration: 0.25 }, // Ease "none" for linear animation
        2 // Start at the beginning of the timeline
      );
      tl.current.fromTo(
        textRefs.current[3],
        { y: "-100vh" },
        { y: "0", ease: "none", duration: 1 }, // Ease "none" for linear animation
        2 // Start at the beginning of the timeline
      );
      tl.current.to(
        textRefs.current[3],

        { x: "-23.5vw", ease: "power2.out", duration: 1 }, // Ease "none" for linear animation
        3 // Start at the beginning of the timeline
      );
    }
  }, [tl.current]);

  return (
    <div id="firstSection" className="scene-inner">
      <div className="scene-content">
        <div id="targetSection" className="scene-content-inner">
          <div className="absolute left-[10vw] bottom-[12.5vh] max-w-[800px] flex flex-col gap-1 items-start justify-center">
            <h1 className="font-title text-8xl tracking-wider">
              Ostrov na který
            </h1>
            <h1 className="font-title text-8xl tracking-wider">
              nikdy nezapomenete
            </h1>
          </div>

          <div className="absolute right-[15vw] bottom-[12.5vh] max-w-[350px] flex flex-col gap-1 items-end justify-center">
            <p className="font-title text-2xl tracking-wider">
              Ostrov projektOstrov projekt
            </p>
            <p className="font-title text-2xl tracking-wider">
              KlobasnikuKlobasniku KlobasnikuK
            </p>
            <p className="font-title text-2xl tracking-wider">
              KlobasnikuKlobasniku KlobasnikuKlo
            </p>
          </div>

          <div
            ref={(el) => (textRefs.current[1] = el)}
            style={{ transform: "translateZ(-1200px)" }}
            className="absolute left-[60vw] top-[40vh] max-w-[320px] font-title text-3xl tracking-wider leading-normal"
          >
            <p className="font-title text-5xl tracking-wider leading-normal">
              Ostrov projekt
            </p>
            <p className="font-title text-5xl tracking-wider leading-normal">
              Klobasniku
            </p>
          </div>

          <div
            ref={(el) => (textRefs.current[2] = el)}
            style={{ transform: "translateZ(-1850px)" }}
            className="absolute right-[30vw] top-[40vh] max-w-[320px] font-title text-3xl tracking-wider leading-normal"
          >
            <p className="font-title text-5xl tracking-wider leading-normal">
              Ostrov projekt
            </p>
            <p className="font-title text-5xl tracking-wider leading-normal">
              Klobasniku
            </p>
          </div>
        </div>
        {/* gaz */}
        {/* {!isScrolled && <Navbar />} */}

        <div
          ref={(el) => (textRefs.current[3] = el)}
          className="absolute left-[0vw] top-[0vh] h-[205vh] w-[22.5vw] flex flex-col justify-center items-center px-10 py-24 gap-24 overflow-hidden bg-primary font-title text-3xl tracking-wider leading-normal"
        >
          <div className="flex-1 w-full flex flex-col items-center justify-center text-center gap-10 px-10 rounded-[50px] bg-secondary">
            <p className="font-title text-5xl tracking-wider leading-normal">
              Ostrov projekt
            </p>
            <p className="font-banner text-xl tracking-wider leading-normal">
              Ostrov projektOstrov projektOstrov projektOstrov projektOstrov
              projektOstrov projekt projektOstrov projektOstrov projektOstrov
              projektOstrov projektOstrov projektOstrov
            </p>
          </div>

          <div className="flex-1 w-full flex flex-col items-center justify-center text-center gap-10 px-10 rounded-[50px] bg-secondary">
            <p className="font-title text-5xl tracking-wider leading-normal">
              Ostrov projekt
            </p>
            <p className="font-banner text-xl tracking-wider leading-normal ">
              Ostrov projektOstrov projektOstrov projektOstrov projektOstrov
              projektOstrov projekt
            </p>
          </div>

          <div className="flex-1 w-full flex flex-col items-center justify-center text-center gap-10 px-10 rounded-[50px] bg-secondary">
            <p className="font-title text-5xl tracking-wider leading-normal">
              Ostrov projekt
            </p>
            <p className="font-banner text-xl tracking-wider leading-normal">
              Ostrov projektOstrov projektOstrov projektOstrov projektOstrov
              projektOstrov projekt
            </p>
          </div>

          <div className="flex-1 w-full flex flex-col items-center justify-center text-center gap-10 px-10 rounded-[50px] bg-secondary">
            <p className="font-title text-5xl tracking-wider leading-normal">
              Ostrov projekt
            </p>
            <p className="font-banner text-xl tracking-wider leading-normal">
              Ostrov projektOstrov projektOstrov projektOstrov projektOstrov
              projektOstrov projekt
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
