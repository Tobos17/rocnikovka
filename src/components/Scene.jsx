import { useGLTF, useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect } from "react";
import * as THREE from "three";

export const Scene = ({ setScrolled }) => {
  const { scene } = useGLTF("/models/Env.glb");
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
    scene.traverse((child) => {
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
  }, [scene]);

  useFrame((state, delta) => {
    state.camera.position.set(10, 10, 10);
  });

  return (
    <>
      <primitive object={scene} scale={1.2} position={[0, 0, 0]} />
    </>
  );
};
