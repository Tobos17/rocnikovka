import { OrbitControls } from "@react-three/drei";
import { Experience } from "../components/Experience";
import { Overlay } from "../components/Overlay";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Lenis from "lenis";
import { Loader } from "../components/Loader";
import Cursor from "../components/Cursor";
// import { AnimatePresence } from "framer-motion";

gsap.registerPlugin(ScrollTrigger);

function Home() {
  // console.log("home");
  const [loading, setLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const lenisRef = useRef(null);

  const tl = useRef(null);

  useLayoutEffect(() => {
    // setTimeout(() => {
    //   document.body.classList.remove("loading");
    //   setLoading(false);
    // }, 3000);

    lenisRef.current = new Lenis({
      duration: 3,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: "vertical",
      gestureDirection: "vertical",
      smooth: true,
      smoothWheel: true,
      smoothTouch: false,
      syncTouch: true,
      touchMultiplier: 0,
      wheelMultiplier: 0.45,
      infinite: false,
      autoResize: true,
    });
    const lenis = lenisRef.current;

    // console.log(lenis);
    loading ? lenis.stop() : lenis.start();

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    lenis.on("scroll", ScrollTrigger.update);
    // gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    requestAnimationFrame(raf);

    return () => {
      if (!loading) {
        lenis.destroy();
        // gsap.ticker.remove(raf);
      }
    };
  }, [loading]);

  useEffect(() => {
    tl.current = gsap.timeline({
      scrollTrigger: {
        trigger: "#triggerRef",
        start: "top top",
        end: "bottom bottom",
        pin: true,
        scrub: 1,

        onUpdate: (self) => {
          if (self.progress >= 0.99) {
            // setIsScrolled(true);
            tl.current.pause();
            lenisRef.current.stop();

            // console.log("stop");
          }
        },
        // markers: true,
      },
    });

    return () => {
      if (tl.current) tl.current.kill();
    };
  }, []);

  const [hasKeyboard, setHasKeyboard] = useState(false);

  useLayoutEffect(() => {
    function isTouchDevice() {
      return window.matchMedia("(pointer: coarse)").matches;
    }

    if (isTouchDevice()) {
      setHasKeyboard(false);
    } else {
      setHasKeyboard(true);
    }
  }, []);

  // useEffect(() => {
  //   const isFirefox =
  //     typeof navigator !== "undefined" && /Firefox/i.test(navigator.userAgent);
  //   const isSafari =
  //     typeof navigator !== "undefined" &&
  //     /Safari/i.test(navigator.userAgent) &&
  //     !/Chrome|Chromium/i.test(navigator.userAgent);

  //   const checkKeyboardPresence = async () => {
  //     if ("keyboard" in navigator) {
  //       try {
  //         await navigator.keyboard.getLayoutMap();

  //         window.innerWidth > 1200
  //           ? setHasKeyboard(true)
  //           : setHasKeyboard(false);
  //       } catch (error) {
  //         console.log(error);
  //         if (isFirefox || isSafari) {
  //           window.innerWidth > 1200
  //             ? setHasKeyboard(true)
  //             : setHasKeyboard(false);
  //         } else {
  //           setHasKeyboard(false);
  //         }
  //       }
  //     } else {
  //       if (isFirefox || isSafari) {
  //         window.innerWidth > 1200
  //           ? setHasKeyboard(true)
  //           : setHasKeyboard(false);
  //       } else {
  //         window.innerWidth > 1200
  //           ? setHasKeyboard(true)
  //           : setHasKeyboard(false);
  //       }
  //     }
  //   };

  //   checkKeyboardPresence();
  // }, []);

  const joystickRef = useRef(null);

  useEffect(() => {
    if (!joystickRef.current || !isReady) return;

    const startDrag = (e) => {
      // e.preventDefault();

      const touch = e.touches[0];
      if (touch.target.id === "reset") return;

      // Get the coordinates of the touch
      const touchX = touch.clientX;
      const touchY = touch.clientY;

      const rect = joystickRef.current.getBoundingClientRect();

      // gsap.set(joystickRef.current, { opacity: 1 });
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

  const [reset, setReset] = useState(false);

  const handleChange = () => {
    setReset(true);
    setTimeout(() => setReset(false), 1000);
  };

  return (
    <>
      {loading && <Loader setLoading={setLoading} />}

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
      <div className="h-full w-full flex flex-col pointer-events-none">
        <div className="h-screen w-screen fixed">
          <Experience
            loading={loading}
            tl={tl}
            isReady={isReady}
            hasKeyboard={hasKeyboard}
            reset={reset}
          />
        </div>

        <Overlay
          tl={tl}
          setIsReady={setIsReady}
          loading={loading}
          isReady={isReady}
        />
      </div>
    </>
  );
}

export default Home;
