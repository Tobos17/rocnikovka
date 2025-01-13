import {
  KeyboardControls,
  OrbitControls,
  PivotControls,
  useGLTF,
} from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Physics, RigidBody, TrimeshCollider } from "@react-three/rapier";
import { useEffect, useRef, useState } from "react";

import { Scene } from "./Scene";
import { Vehicle } from "./Vehicle";
import { PostProcessing } from "./PostProcessing";
import { EnvironmentProps } from "./EnvironmentProps";
import { GameProps } from "./GameProps";

const controls = [
  { name: "forward", keys: ["ArrowUp", "KeyW"] },
  { name: "back", keys: ["ArrowDown", "KeyS"] },
  { name: "left", keys: ["ArrowLeft", "KeyA"] },
  { name: "right", keys: ["ArrowRight", "KeyD"] },
  { name: "brake", keys: ["Space"] },
  { name: "reset", keys: ["KeyR"] },
  { name: "horn", keys: ["KeyE"] },
];

const ScenePhysics = () => {
  const { scene: colliderScene1 } = useGLTF("/models/collider.glb");
  const { scene: colliderScene2 } = useGLTF("/models/collider2.glb");

  const geometry = colliderScene2.children[0].geometry;
  const vertices = geometry.attributes.position.array;
  const indices = geometry.index.array;

  const geometry1 = colliderScene1.children[0].geometry;
  const vertices1 = geometry1.attributes.position.array;
  const indices1 = geometry1.index.array;

  const crashSound = new Audio("/sounds/crashhh.mp3");

  return (
    <>
      <RigidBody
        type="fixed"
        colliders="trimesh"
        scale={1.2}
        position={[0, 0, 0]}
        collisionGroups={(1 << 16) | 0x01}
      >
        <TrimeshCollider args={[vertices, indices]} />
      </RigidBody>
      <RigidBody
        type="fixed"
        colliders="trimesh"
        scale={1.2}
        position={[0, 0, 0]}
        collisionGroups={(1 << 16) | 0x01}
        onCollisionEnter={() => {
          crashSound.volume = 1;
          crashSound.currentTime = 0;
          crashSound.play();
        }}
      >
        <TrimeshCollider args={[vertices1, indices1]} />
      </RigidBody>
    </>
  );
};

export const Experience = ({
  loading,
  isReady,
  tl,
  hasKeyboard,
  reset,
  switched,
}) => {
  const [results, setResults] = useState([]);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1200) setIsSmallScreen(false);
      else setIsSmallScreen(true);
    };
    window.addEventListener("resize", handleResize);

    handleResize();
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const mainSound = new Audio("/sounds/main.mp3");

  useEffect(() => {
    if (isReady) {
      mainSound.volume = 0.01;
      mainSound.play();
    }
  }, [isReady]);

  return (
    <>
      <Canvas
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
        }}
        flat
        dpr={[1, 2]}
        camera={{
          near: 0.1,
          fov: isSmallScreen ? 80 : 55,
          position: [19, 4, -19],
          far: 100,
        }}
      >
        {/* <PivotControls scale={50} /> */}
        {/* <OrbitControls makeDefault /> */}

        {isReady && (
          <>
            <Physics debug={false}>
              <KeyboardControls map={controls}>
                <Vehicle
                  setResults={setResults}
                  hasKeyboard={hasKeyboard}
                  reset={reset}
                  switched={switched}
                />
              </KeyboardControls>

              <ScenePhysics />
            </Physics>

            <GameProps results={results} />
          </>
        )}

        <Scene loading={loading} tl={tl} isReady={isReady} />

        <EnvironmentProps />
        <PostProcessing />
      </Canvas>
    </>
  );
};
