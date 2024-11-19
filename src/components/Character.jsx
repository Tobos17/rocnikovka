import { useGLTF } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { forwardRef, useEffect, useRef } from "react";

const Ground = forwardRef(({ model, ...props }, ref) => {
  const { scene } = useGLTF(model);
  const group = useRef(null);

  const camera = useThree((state) => state.camera);

  return (
    <group ref={group}>
      <primitive object={scene} {...props} ref={ref} />
    </group>
  );
});

export default Ground;
