import { usePlane, useTrimesh } from "@react-three/cannon";
import { MeshReflectorMaterial, useGLTF } from "@react-three/drei";
import { useEffect, useRef } from "react";

export function Groundd() {
  const { nodes, scene } = useGLTF("models/Env.glb");

  const [ref] = usePlane(
    () => ({
      type: "Static",
      rotation: [-Math.PI / 2, 0, 0],
    }),
    useRef(null)
  );

  return (
    <group>
      <primitive object={scene} />
    </group>
  );
}
