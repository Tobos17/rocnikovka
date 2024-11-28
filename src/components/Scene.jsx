import { useGLTF, useTexture } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import gsap from "gsap";
import { useEffect, useLayoutEffect } from "react";
import * as THREE from "three";

export const Scene = ({ tl }) => {
  const { scene: env } = useGLTF("/models/Env.glb");
  const baked = useTexture("/textures/baked-2.jpg");
  const bakedRocks = useTexture("/textures/baked-rocks.jpg");
  const bakedFloors = useTexture("/textures/bf.jpg");

  baked.flipY = false;
  baked.colorSpace = THREE.SRGBColorSpace;

  bakedRocks.flipY = false;
  bakedRocks.colorSpace = THREE.SRGBColorSpace;

  bakedFloors.flipY = false;
  bakedFloors.colorSpace = THREE.SRGBColorSpace;

  useEffect(() => {
    env.traverse((child) => {
      if (
        (child.isMesh && child.name === "b") ||
        (child.isMesh && child.name === "b001") ||
        (child.isMesh && child.name === "b002") ||
        (child.isMesh && child.name === "b003")
      ) {
        child.material = new THREE.MeshBasicMaterial({
          map: bakedFloors,
        });
      } else if (child.isMesh && child.name === "bounds") {
        child.material = new THREE.MeshBasicMaterial({
          visible: false,
        });
      } else if (child.isMesh && child.name === "m") {
        child.material = new THREE.MeshBasicMaterial({
          map: bakedRocks,
        });
      }
    });
  }, [env]);

  const camera = useThree((state) => state.camera);
  const scene = useThree((state) => state.scene);

  useLayoutEffect(() => {
    if (tl.current && camera && scene) {
      camera.position.set(15, 1.75, -15);
      camera.lookAt(0, 1.75, 0);

      tl.current

        .to(camera.position, { x: 10, y: 1.5, z: -10, duration: 1 }, 0)

        .to(camera.rotation, { y: Math.PI / 3, duration: 1 }, 1)
        .to(camera.position, { x: -0.5, y: 0.75, z: -7.5, duration: 1 }, 1)

        .to(camera.rotation, { y: Math.PI / 8, duration: 1 }, 2)
        .to(camera.position, { x: 4, y: 5, z: -9, duration: 1 }, 2)

        // .to(camera.rotation, { y: Math.PI / 1.25, duration: 1 }, 3)
        .to(camera.position, { x: 4, y: 7, z: -9, duration: 1 }, 3);

      // .to(camera.rotation, { y: Math.PI / 1.25, duration: 1 }, 3)
      // .to(camera.position, { x: 6, y: 5.5, z: 8, duration: 1 }, 3)

      // .to(camera.rotation, { y: Math.PI / 4, duration: 1 }, 4)
      // .to(camera.position, { x: 10, y: 1.5, z: -10, duration: 1 }, 4);
    }
  }, [tl.current]);

  return (
    <>
      <primitive object={env} scale={1.2} position={[0, 0, 0]} />
    </>
  );
};
