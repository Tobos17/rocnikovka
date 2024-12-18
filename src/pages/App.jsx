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
      smoothTouch: true,
      syncTouch: false,
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

    requestAnimationFrame(raf);

    return () => {
      if (!loading) {
        lenis.destroy();
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
          if (self.progress === 1) {
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

  useEffect(() => {
    const isFirefox =
      typeof navigator !== "undefined" && /Firefox/i.test(navigator.userAgent);
    const isSafari =
      typeof navigator !== "undefined" &&
      /Safari/i.test(navigator.userAgent) &&
      !/Chrome|Chromium/i.test(navigator.userAgent);

    const checkKeyboardPresence = async () => {
      if ("keyboard" in navigator) {
        try {
          await navigator.keyboard.getLayoutMap();

          window.innerWidth > 1200
            ? setHasKeyboard(true)
            : setHasKeyboard(false);
        } catch (error) {
          console.log(error);
          if (isFirefox || isSafari) {
            window.innerWidth > 1200
              ? setHasKeyboard(true)
              : setHasKeyboard(false);
          } else {
            setHasKeyboard(false);
          }
        }
      } else {
        if (isFirefox || isSafari) {
          window.innerWidth > 1200
            ? setHasKeyboard(true)
            : setHasKeyboard(false);
        } else {
          setHasKeyboard(false);
        }
      }
    };

    checkKeyboardPresence();
  }, []);

  return (
    <>
      {loading && <Loader setLoading={setLoading} />}

      {hasKeyboard && !isReady && !loading && <Cursor />}

      {!hasKeyboard && isReady && (
        <div className="z-[150] h-screen w-screen fixed pointer-events-none">
          <div id="joystick">
            <div id="outer-circle">
              <div id="inner-circle"></div>
            </div>
          </div>
        </div>
      )}
      <div className="h-full w-full flex flex-col pointer-events-none">
        <div className="h-screen w-screen fixed">
          <Experience
            loading={loading}
            tl={tl}
            isReady={isReady}
            hasKeyboard={hasKeyboard}
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
