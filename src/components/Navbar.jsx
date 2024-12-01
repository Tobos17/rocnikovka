import React from "react";

export function Navbar() {
  return (
    <nav className="fixed h-[5vh] w-full flex items-center justify-center top-[5vh] left-0 px-[10vw] py-0">
      <div className="h-full w-full relative flex justify-center items-center ">
        {/* Links */}
        <div className="rounded-[50px] h-full w-[45vw] flex flex-row items-center justify-center gap-32">
          <div className="px-8 bg-primary rounded-[50px] text-center">
            <h2 className="font-title text-3xl tracking-wider leading-normal">
              Projekt
            </h2>
          </div>
          <div className="px-8 bg-primary rounded-[50px] text-center">
            <h2 className="font-title text-3xl tracking-wider leading-normal">
              Projekt
            </h2>
          </div>
          <div className="px-8 bg-primary rounded-[50px] text-center">
            <h2 className="font-title text-3xl tracking-wider leading-normal">
              Projekt
            </h2>
          </div>
          <div className="px-8 bg-primary rounded-[50px] text-center">
            <h2 className="font-title text-3xl tracking-wider leading-normal">
              Projekt
            </h2>
          </div>
        </div>

        <div className="absolute bg-primary rounded-[50px] h-[5vh] w-[7.5vw] right-[5vw] flex items-center justify-center font-title text-3xl tracking-wider leading-normal">
          Spustit hru
        </div>
      </div>
    </nav>
  );
}
