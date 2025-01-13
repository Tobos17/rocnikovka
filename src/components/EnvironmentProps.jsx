import { Cloud, Environment, Sky } from "@react-three/drei";
import { Ocean } from "./Ocean";

export const EnvironmentProps = () => {
  return (
    <>
      <Environment preset="sunset" />
      <Sky
        turbidity={8.2}
        rayleigh={1.099}
        mieCoefficient={0.005}
        mieDirectionalG={0.447}
        sunPosition={[60, 60, 150]}
      />

      <Cloud
        position={[15, 5, 40]}
        color={0xffffff}
        speed={0}
        opacity={0.75}
        scale={4}
        seed={8}
      />
      <Cloud
        position={[-30, 5, 30]}
        color={0xffffff}
        speed={0}
        opacity={0.75}
        scale={5}
        seed={2}
      />
      <Cloud
        position={[-60, -10, 30]}
        color={0xffffff}
        speed={0}
        opacity={0.75}
        scale={10}
        seed={1}
      />

      <Ocean />

      <ambientLight intensity={5.5} color={0xffffff} />
    </>
  );
};
