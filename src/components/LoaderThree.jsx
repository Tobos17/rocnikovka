import { Html, useProgress } from "@react-three/drei";

export function LoaderThree() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="fixed inset-0 z-[100] h-screen w-screen flex items-center justify-center bg-black overflow-hidden select-none">
        <h1 className="text-[8vw] text-white font-loader">
          {progress.toFixed(0)}%
        </h1>
      </div>
    </Html>
  );
}
