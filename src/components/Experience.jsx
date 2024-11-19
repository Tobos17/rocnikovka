import {
  Environment,
  OrbitControls,
  OrthographicCamera,
} from "@react-three/drei";
import { useControls } from "leva";
import { useRef } from "react";
import { Map } from "./Map";
// import { Physics } from "@react-three/rapier";
import { Physics } from "@react-three/cannon";
import { CharacterController } from "./CharacterController";
import { CharacterControlle } from "./Char-Can";
import { Groundd } from "./Groundd";

export const Experience = () => {
  const shadowCameraRef = useRef();

  return (
    <>
      <OrbitControls />
      <Environment preset="sunset" />
      {/* <directionalLight
        intensity={0.65}
        castShadow
        position={[-15, 10, 15]}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.00005}
      >
        <OrthographicCamera
          left={-22}
          right={15}
          top={10}
          bottom={-20}
          ref={shadowCameraRef}
          attach={"shadow-camera"}
        />
      </directionalLight> */}

      <Physics broadphase="SAP" gravity={[0, -2.6, 0]}>
        <CharacterControlle />
        <Groundd />
      </Physics>

      {/* <Physics debug>
        <Map />
        <CharacterController />
      </Physics> */}
    </>
  );
};
