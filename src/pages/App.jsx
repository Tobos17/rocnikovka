import { OrbitControls } from "@react-three/drei";
import { Experience } from "../components/Experience";
import { Overlay } from "../components/Overlay";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Lenis from "lenis";
import { Loader } from "../components/Loader";
import { AnimatePresence } from "framer-motion";

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
      // duration: 1.5,
      // easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      // smoothWheel: true,
      // syncTouch: false,
      // touchMultiplier: 0,
      // syncTouch: true,
      // wheelMultiplier: 0.5,

      duration: 3,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: "vertical",
      gestureDirection: "vertical",
      smooth: true,
      smoothWheel: true,
      smoothTouch: false,
      syncTouch: false,
      touchMultiplier: 0,
      wheelMultiplier: 0.4,
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

  useLayoutEffect(() => {
    tl.current = gsap.timeline({
      scrollTrigger: {
        trigger: "#triggerRef",
        start: "top top",

        end: "bottom bottom",
        pin: true,
        scrub: 1,
        onUpdate: (self) => {
          // console.log(self.progress);

          if (self.progress === 1) {
            setIsScrolled(true);
            tl.current.kill();
            lenisRef.current.stop();
            // console.log("done");
          }
        },
        // markers: true,
      },
    });

    return () => {
      if (tl.current) tl.current.kill();
    };
  }, []);

  const loader = useRef(null);
  const clicker = useRef(null);

  const handleClick = () => {
    gsap
      .to(loader.current, {
        duration: 1,
        ease: "power3.out",
        height: "250vh",
        width: "250vh",
      })
      .then(() => {
        setIsReady(true);
        gsap.to(loader.current, {
          duration: 0.75,
          ease: "power3.out",
          height: "0vh",
          width: "0vh",
        });
        gsap.to(clicker.current, {
          duration: 0.5,
          ease: "power3.out",
          opacity: 0,
        });
      });
  };

  const [hasKeyboard, setHasKeyboard] = useState(false);

  useEffect(() => {
    const checkKeyboardPresence = async () => {
      if ("keyboard" in navigator) {
        try {
          await navigator.keyboard.getLayoutMap();
          setHasKeyboard(true);
        } catch (error) {
          setHasKeyboard(false);
        }
      } else {
        setHasKeyboard(false);
      }
    };

    checkKeyboardPresence();
  }, []);
  return (
    <>
      <AnimatePresence mode="wait">
        {loading && <Loader setLoading={setLoading} />}
      </AnimatePresence>

      {!hasKeyboard && isReady && (
        <div className="z-[150] h-screen w-screen fixed">
          <div id="joystick">
            <div id="outer-circle">
              <div id="inner-circle"></div>
            </div>
          </div>
        </div>
      )}
      <div className="h-full w-full flex flex-col">
        <div className="h-screen w-screen fixed">
          <Experience
            loading={loading}
            tl={tl}
            isReady={isReady}
            hasKeyboard={hasKeyboard}
          />
        </div>

        <Overlay tl={tl} isScrolled={isScrolled} setIsReady={setIsReady} />
      </div>
    </>
  );
}

export default Home;
