import { shaderMaterial, useAnimations, useGLTF } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";
import { useEffect, useRef } from "react";
import Ground from "./Ground";

export const Map = () => {
  const groundRef = useRef();

  return (
    <group>
      <RigidBody type="fixed" colliders="trimesh">
        <Ground
          ref={groundRef}
          scale={1}
          position={[0, -5, 0]}
          model={`models/Env.glb`}
        />
      </RigidBody>
    </group>
  );
};
