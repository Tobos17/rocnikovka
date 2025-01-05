import { useEffect, useRef } from "react";
import gsap from "gsap";

import { Cursor } from "./Cursor";

export const Overlay = ({ hasKeyboard, isReady, setReset }) => {
  const joystickRef = useRef(null);

  useEffect(() => {
    if (!joystickRef.current || !isReady) return;

    const startDrag = (e) => {
      const touch = e.touches[0];
      if (touch.target.id === "reset") return;

      // Get the coordinates of the touch
      const touchX = touch.clientX;
      const touchY = touch.clientY;

      const rect = joystickRef.current.getBoundingClientRect();

      gsap.to(joystickRef.current, {
        opacity: 1,
        x: touchX - rect.width / 2,
        y: touchY - rect.height / 2,
        duration: 0,
      });
    };

    const endDrag = () => {
      gsap.to(joystickRef.current, {
        opacity: 0,
        duration: 0,
      });
    };

    window.addEventListener("touchstart", (e) => startDrag(e));
    window.addEventListener("touchend", () => endDrag());

    return () => {
      window.removeEventListener("touchstart", (e) => startDrag(e));
      window.removeEventListener("touchend", () => endDrag());
    };
  }, [isReady]);

  const handleChange = () => {
    setReset(true);
    setTimeout(() => setReset(false), 1000);
  };

  return (
    <>
      {hasKeyboard && !isReady && <Cursor />}

      {!hasKeyboard && isReady && (
        <>
          <div className="z-[200] h-screen w-screen fixed pointer-events-none">
            <div style={{ opacity: 0 }} ref={joystickRef} id="joystick">
              <div id="outer-circle">
                <div id="inner-circle"></div>
              </div>
            </div>
          </div>
          <h1
            id="reset"
            onClick={() => handleChange()}
            className="select-none absolute z-[300] w-fit h-fit bottom-[50vh] right-[5vw] text-4xl font-title text-white text-nowrap tracking-wide"
          >
            reset
          </h1>
        </>
      )}
    </>
  );
};
