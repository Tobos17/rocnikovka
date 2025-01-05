import { Cloud, Environment, Sky, Sparkles } from "@react-three/drei";
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

      <Sparkles
        size={15}
        scale={[8, 2, 8]}
        position={[10, 0.25, -10]}
        speed={0.25}
        count={75}
        color="white"
        noise={2}
        opacity={0.25}
      />

      <ambientLight intensity={5.5} color={0xffffff} />
    </>
  );
};
