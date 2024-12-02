import { OrbitControls } from "@react-three/drei";
import { Sketch } from "../components/Sketch";
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
      duration: 1.5,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      syncTouch: false,
      touchMultiplier: 0,
      wheelMultiplier: 0.5,
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
        trigger: "#firstSection",
        start: "top top",
        end: "+=10000",
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

  useEffect(() => {
    if (isScrolled) {
      gsap.fromTo(
        loader.current,
        { height: "0vh", width: "0vh" },
        {
          duration: 0.75,
          ease: "power3.out",
          height: "65vh",
          width: "65vh",
        }
      );

      gsap.fromTo(
        clicker.current,
        { opacity: 0 },
        { duration: 1, ease: "power3.out", delay: 0.35, opacity: 1 }
      );
    }
  }, [isScrolled]);

  return (
    <>
      <AnimatePresence mode="wait">
        {loading && <Loader setLoading={setLoading} />}
      </AnimatePresence>
      <div className="h-full w-full flex flex-col">
        {isScrolled && (
          <div
            ref={loader}
            style={{
              left: "50%",
              top: "50%",
              transform: "translateX(-50%) translateY(-50%)",
              transformOrigin: "center center",
            }}
            className="z-50 bg-primary fixed rounded-full overflow-hidden"
          >
            <button
              ref={clicker}
              onClick={handleClick}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-title text-8xl tracking-wider"
            >
              Zablbni si
            </button>
          </div>
        )}

        <div className="h-screen w-screen fixed">
          <Sketch tl={tl} isReady={isReady} />
        </div>

        <Overlay tl={tl} isScrolled={isScrolled} />
      </div>
    </>
  );
}

export default Home;
