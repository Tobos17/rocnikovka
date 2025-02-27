import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Lenis from "lenis";

import { Experience } from "./components/Experience";
import { Overlay } from "./components/Overlay";
import { Loader } from "./components/Loader";
import { Content } from "./components/Content";

gsap.registerPlugin(ScrollTrigger);

function Home() {
  const [loading, setLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [reset, setReset] = useState(false);
  const [switched, setSwitched] = useState(false);
  const readyScroll = useRef(false);

  const [hasKeyboard, setHasKeyboard] = useState(false);

  const lenisRef = useRef(null);
  const tl = useRef(null);

  useLayoutEffect(() => {
    lenisRef.current = new Lenis({
      duration: 3,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: "vertical",
      gestureDirection: "vertical",
      smooth: true,
      smoothWheel: true,
      smoothTouch: false,
      syncTouch: true,
      touchInertiaMultiplier: 25,
      touchMultiplier: 2,
      wheelMultiplier: 0.45,
      infinite: false,
      autoResize: true,
      overscroll: false,
    });
    const lenis = lenisRef.current;

    if (loading) {
      lenis.stop();
    } else {
      setTimeout(() => {
        lenis.start();
        readyScroll.current = true;
        document.body.classList.remove("loading");
      }, 5000);
    }

    lenis.on("scroll", (e) => ScrollTrigger.update);

    gsap.ticker.add((time) => lenis.raf(time * 1000));

    gsap.ticker.lagSmoothing(0);

    return () => {
      if (!loading) {
        lenis.destroy();
        gsap.ticker.remove(lenis.raf);
      }
    };
  }, [loading]);

  useEffect(() => {
    const preventScroll = (e) => {
      e.preventDefault();
    };

    tl.current = gsap.timeline({
      scrollTrigger: {
        trigger: "#triggerRef",
        pin: true,
        start: "top top",
        end: "+=10000 bottom",

        scrub: 1,

        onUpdate: (self) => {
          if (self.progress >= 0 && !readyScroll.current) {
            tl.current.pause();
            lenisRef.current?.stop();

            document.addEventListener("wheel", preventScroll, {
              passive: false,
            });
          }

          if (self.progress === 1) {
            tl.current.pause();
            lenisRef.current?.stop();
            document.body.style.overflow = "hidden";
            document.body.style.touchAction = "none";

            document.addEventListener("touchmove", preventScroll, {
              passive: false,
            });
            document.addEventListener("wheel", preventScroll, {
              passive: false,
            });
          }
        },
        // markers: true,
      },
    });

    return () => {
      if (tl.current) {
        tl.current.kill();

        document.body.style.overflow = "auto";
        document.body.style.touchAction = "auto";
        document.removeEventListener("touchmove", preventScroll);
        document.removeEventListener("wheel", preventScroll);
      }
    };
  }, []);

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

  return (
    <main className="container">
      <Loader setLoading={setLoading} />

      <div className="h-screen h-svh w-screen fixed">
        <Experience
          loading={loading}
          tl={tl}
          isReady={isReady}
          hasKeyboard={hasKeyboard}
          reset={reset}
          switched={switched}
        />
      </div>

      <Content
        tl={tl}
        setIsReady={setIsReady}
        loading={loading}
        isReady={isReady}
      />

      <Overlay
        hasKeyboard={hasKeyboard}
        setReset={setReset}
        switched={switched}
        setSwitched={setSwitched}
        isReady={isReady}
      />
    </main>
  );
}

export default Home;
