import React, { useEffect, useLayoutEffect, useRef } from "react";

export const Overlay = ({ tl }) => {
  const textRefs = useRef([]);
  useLayoutEffect(() => {
    if (tl.current) {
      tl.current.to(
        "#targetSection",
        { translateZ: 4000, ease: "none", duration: 4 }, // Ease "none" for linear animation
        0 // Start at the beginning of the timeline
      );

      tl.current.fromTo(
        textRefs.current[0],
        { opacity: 0 },
        { opacity: 1, ease: "none", duration: 0.1 }, // Ease "none" for linear animation
        0.5 // Start at the beginning of the timeline
      );
    }
  }, [tl.current]);

  return (
    <div id="firstSection" className="scene-inner">
      <div className="scene-content">
        <div id="targetSection" className="scene-content-inner">
          <div className="absolute left-[10vw] bottom-[15vh] max-w-[800px] flex flex-col gap-1 items-start justify-center">
            <p className="font-title text-8xl tracking-wider">
              Ostrov na který
            </p>
            <p className="font-title text-8xl tracking-wider">
              nikdy nezapomenete
            </p>
          </div>

          <div className="absolute right-[15vw] bottom-[20vh] max-w-[800px] flex flex-col gap-1 items-end justify-center">
            <p className="font-title text-3xl tracking-wider">
              Ostrov projektOstrov projekt
            </p>
            <p className="font-title text-3xl tracking-wider">
              KlobasnikuKlobasniku
            </p>
          </div>

          <div
            ref={(el) => (textRefs.current[0] = el)}
            style={{ transform: "translateZ(-400px)" }}
            className="absolute left-[52.5vw] top-[45vh] max-w-[320px] font-title text-3xl tracking-wider leading-normal"
          >
            <p className="font-title text-5xl tracking-wider leading-normal">
              Ostrov projekt
            </p>
            <p className="font-title text-5xl tracking-wider leading-normal">
              Klobasniku
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
