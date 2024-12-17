import gsap from "gsap";
import React, { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { Navbar } from "./Navbar";

import { CustomEase } from "gsap/CustomEase";

gsap.registerPlugin(CustomEase);

export const Overlay = ({ tl, isScrolled, setIsReady }) => {
  const textRefs = useRef([]);
  const text = useRef(null);
  const text2 = useRef(null);

  useEffect(() => {
    if (tl.current && textRefs.current) {
      tl.current.to(
        "#sectionRef",
        { translateZ: 5000, ease: "none", duration: 4 }, // Ease "none" for linear animation
        0 // Start at the beginning of the timeline
      );

      CustomEase.create("sm", "0.76, 0, 0.24, 1");
      let lastTime = 0;
      gsap.set(textRefs.current[0], { y: "100%" });
      gsap.set(textRefs.current[1], { y: "100%" });
      tl.current.call(
        () => {
          // Check if the timeline is moving forward or backward
          const isReversing = tl.current.time() < lastTime;

          // Animate accordingly
          gsap.to(textRefs.current[0], {
            y: isReversing ? "-100%" : "0%",
            opacity: isReversing ? 0 : 1,
            duration: 0.8,

            ease: "sm",
          });

          gsap.to(textRefs.current[1], {
            y: isReversing ? "-100%" : "0%",
            opacity: isReversing ? 0 : 1,

            duration: 0.8,
            delay: isReversing ? 0 : 0.15,
            ease: "sm",
          });

          // Update the lastTime for the next call
          lastTime = tl.current.time();
        },

        [],
        0.95
      );

      tl.current.fromTo(
        textRefs.current[2],
        { opacity: 0 },
        { opacity: 1, ease: "sm", duration: 0.075 },
        1.625
      );

      const x =
        window.innerWidth > 1024
          ? "-70vw"
          : window.innerWidth > 640
          ? "-50vw"
          : "0vw";
      tl.current.fromTo(
        textRefs.current[3],
        { x: "-100vw" },
        { x: x, ease: "linear", duration: 0.25 },
        2
      );
      tl.current.fromTo(
        textRefs.current[3],
        { y: "0vh" },
        { y: "-100vh", duration: 0.75 },
        2.25
      );
      tl.current.to(
        textRefs.current[3],

        { x: "-100vw", duration: 0.75 },
        3
      );
      tl.current.fromTo(
        textRefs.current[4],
        { y: "-100vh" },
        { y: "0vh", duration: 0.75 },
        3
      );

      //
      tl.current.call(
        () => {
          // Check if the timeline is moving forward or backward
          const isReversing = tl.current.time() < lastTime;

          // Animate accordingly
          gsap.to(textRefs.current[4], {
            backgroundColor: isReversing ? "white" : "black",
            duration: 0.5,
            ease: "sm",
          });

          gsap.to(textRefs.current[4], {
            backgroundColor: isReversing ? "white" : "black",
            duration: 0.5,
            // delay: isReversing ? 0 : 0.15,
            ease: "sm",
          });

          gsap.fromTo(
            textRefs.current[5],
            { opacity: 0, y: "125%" },
            { opacity: 1, y: 0, duration: 0.75, delay: 0.15, ease: "sm" }
          );
          gsap.fromTo(
            textRefs.current[6],
            { opacity: 0, y: "125%" },
            { opacity: 1, y: 0, duration: 0.75, delay: 0.15, ease: "sm" }
          );

          // Update the lastTime for the next call
          lastTime = tl.current.time();
        },

        [],
        3.75
      );
    }
  }, [tl.current]);

  useEffect(() => {
    if (text.current && text2.current) {
      gsap.fromTo(
        text.current,
        { opacity: 0, y: "100%" },
        { opacity: 1, y: 0, duration: 1.5, delay: 1.75, ease: "sm" }
      );

      gsap.fromTo(
        text2.current,
        { opacity: 0, y: 100 },
        { opacity: 1, y: 0, duration: 1.5, delay: 2.5, ease: "power1.inOut" }
      );
    }
  }, []);

  const handleClick = () => {
    gsap.to(textRefs.current[4], {
      opacity: 0,
      duration: 0.25,
      ease: "sm",
      onComplete: () => {
        textRefs.current.forEach((el) => {
          gsap.set(el, {
            display: "none",
          });
        });
      },
    });
    tl.current.kill();
    setIsReady(true);
  };

  return useMemo(
    () => (
      <div id="triggerRef" className="scene-inner pointer-events-none">
        <div className="scene-content">
          <div id="sectionRef" className="scene-content-inner">
            <div
              ref={text}
              className="absolute left-[7.5vw] bottom-[15vh] max-w-[800px] flex flex-col gap-1 items-start justify-center"
            >
              <h1 className="font-title text-6xl sm:text-7xl xl:text-7xl 2xl:text-8xl tracking-wide">
                ostrov plný zážitků
              </h1>
            </div>

            <div
              ref={text2}
              className="absolute right-[7.5vw] bottom-[5vh] sm:bottom-[7.5vh] lg:bottom-[15vh] max-w-[500px] flex flex-col gap-1 items-end justify-center"
            >
              <p className="font-title text-xl lg:text-xl xl:text-xl 2xl:text-3xl tracking-wide">
                Přijďte objevit místo kde
              </p>
              <p className="font-title text-xl lg:text-xl xl:text-xl 2xl:text-3xl tracking-wide">
                dobrodružství čeká na každém kroku
              </p>
            </div>

            <div
              style={{ transform: "translateZ(-1250px)" }}
              className="absolute left-[55vw] md:left-[62.5vw] top-[35vh] max-w-[320px] flex flex-col justify-center items-center font-title text-3xl tracking-wider "
            >
              <div className="overflow-hidden flex-1 relative flex justify-center items-center ">
                <span
                  ref={(el) => (textRefs.current[0] = el)}
                  style={{ opacity: 0 }}
                  className="font-title text-4xl md:text-5xl tracking-wide !leading-[1.1]"
                >
                  Jedinečný
                </span>
              </div>

              <div className="overflow-hidden flex-1 relative flex justify-center items-center ">
                <span
                  ref={(el) => (textRefs.current[1] = el)}
                  style={{ opacity: 0 }}
                  className="font-title text-4xl md:text-5xl tracking-wide !leading-[1.1]"
                >
                  zážitek
                </span>
              </div>
            </div>

            <div
              ref={(el) => (textRefs.current[2] = el)}
              style={{ transform: "translateZ(-2000px)" }}
              className="absolute right-[45vw] md:right-[30vw] top-[35vh] max-w-[320px] font-title text-3xl tracking-wider leading-normal"
            >
              <p className="font-title text-4xl md:text-5xl tracking-wide leading-snug">
                Nekonečná
              </p>
              <p className="font-title text-4xl md:text-5xl tracking-wide leading-snug">
                zábava
              </p>
            </div>
          </div>
          {/* gaz */}
          {/* {!isScrolled && <Navbar />} */}

          <div
            ref={(el) => (textRefs.current[3] = el)}
            className="absolute z-[50] left-[0vw] top-[0vh] h-[200vh] w-screen flex justify-end items-center overflow-hidden bg-primary"
          >
            <div className="h-full w-full sm:w-[50%] lg:w-[30%] flex flex-col justify-center items-center px-[5vh] py-[5vh] gap-[5vh]">
              <div className="flex-1 w-full flex flex-col items-center justify-center text-center gap-[5vh] px-10 rounded-[35px] bg-secondary">
                <p className="font-title text-4xl sm:text-5xl tracking-wide leading-tight">
                  Plavby snů
                </p>
                <p className="font-title text-base sm:text-xl tracking-wide leading-normal">
                  Vydejte se na dechberoucí plavbu našimi loděmi s proskleným
                  dnem, které vám umožní obdivovat podmořský život z pohodlí
                  paluby. Připravte se na výpravy za delfíny, korálovými útesy a
                  nádhernými západy slunce
                </p>
              </div>

              <div className="flex-1 w-full flex flex-col items-center justify-center text-center gap-10 px-10 rounded-[35px] bg-secondary">
                <p className="font-title text-4xl sm:text-5xl tracking-wide leading-tight">
                  Ponorkové dobrodružství
                </p>
                <p className="font-title text-base sm:text-xl tracking-wide leading-normal ">
                  S naší futuristickou ponorkou se ponoříte do hlubin oceánu a
                  zažijete svět, který je jinak vyhrazen jen potápěčům. Sledujte
                  majestátní manty, pestrobarevné ryby a tajemné vraky lodí
                </p>
              </div>

              <div className="flex-1 w-full flex flex-col items-center justify-center text-center gap-10 px-10 rounded-[35px] bg-secondary">
                <p className="font-title text-4xl sm:text-5xl tracking-wide leading-tight">
                  Balónem nad ostrovem
                </p>
                <p className="font-title text-base sm:text-xl tracking-wide leading-normal">
                  Zažijte nezapomenutelný pohled na ostrov z ptačí perspektivy!
                  Leťte horkovzdušným balónem a obdivujte zelené džungle,
                  tyrkysové laguny a nekonečné obzory
                </p>
              </div>
              <div className="flex-1 w-full flex flex-col items-center justify-center text-center gap-10 px-10 rounded-[35px] bg-secondary">
                <p className="font-title text-4xl sm:text-5xl tracking-wide leading-tight">
                  Magické plavby
                </p>
                <p className="font-title text-base sm:text-xl tracking-wide leading-normal">
                  Nasedněte na naši loď s proskleným dnem a odhalte tajemství
                  pod hladinou! Pozorujte korálové útesy, hrajte si s pohledem
                  na delfíny a užijte si kouzelné západy slunce na vodní hladině
                </p>
              </div>
            </div>
          </div>
          <div
            ref={(el) => (textRefs.current[4] = el)}
            className="z-[20] fixed inset-0 flex flex-col gap-4 justify-center items-center h-screen w-screen bg-primary"
          >
            <div
              onClick={handleClick}
              className="cursor-pointer pointer-events-auto overflow-hidden relative flex justify-center items-center"
            >
              <span
                ref={(el) => (textRefs.current[5] = el)}
                className="font-title text-4xl lg:text-6xl 2xl:text-8xl leading-[0.9] tracking-wide"
              >
                Klikni a hraj
              </span>
            </div>
            <div
              onClick={handleClick}
              className="cursor-pointer pointer-events-auto overflow-hidden relative flex justify-center items-center"
            >
              <span
                ref={(el) => (textRefs.current[6] = el)}
                className="font-title text-4xl lg:text-6xl 2xl:text-8xl leading-[0.9] tracking-wide"
              >
                hru
              </span>
            </div>
          </div>
        </div>
      </div>
    ),
    []
  );
};
