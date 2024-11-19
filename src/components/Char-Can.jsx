import { useBox, useRaycastVehicle } from "@react-three/cannon";
import { useFrame, useLoader } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { useWheels } from "./useWheels";
import { useKeyboardControls } from "@react-three/drei";
import * as THREE from "three";

const WheelDebug = ({ radius, wheelRef }) => {
  return (
    <group ref={wheelRef}>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[radius, radius, 0.015, 16]} />
        <meshNormalMaterial transparent={true} opacity={0.25} />
      </mesh>
    </group>
  );
};

export const CharacterControlle = () => {
  const [sub, get] = useKeyboardControls();

  const position = [-1.5, 0.5, 3];
  const width = 0.15;
  const height = 0.07;
  const front = 0.15;
  const wheelRadius = 0.05;

  const chassisBodyArgs = [width, height, front * 2];
  const [chassisBody, chassisApi] = useBox(
    () => ({
      allowSleep: false,
      args: chassisBodyArgs,
      mass: 150,
      position,
    }),
    useRef(null)
  );

  const [wheels, wheelInfos] = useWheels(width, height, front, wheelRadius);

  const [vehicle, vehicleApi] = useRaycastVehicle(
    () => ({
      chassisBody,
      wheelInfos,
      wheels,
    }),
    useRef(null)
  );

  useFrame((state) => {
    if (!vehicleApi || !chassisApi) return;

    if (get().forward) {
      vehicleApi.applyEngineForce(50, 2);
      vehicleApi.applyEngineForce(50, 3);
    } else if (get().backward) {
      vehicleApi.applyEngineForce(-50, 2);
      vehicleApi.applyEngineForce(-50, 3);
    } else {
      vehicleApi.applyEngineForce(0, 2);
      vehicleApi.applyEngineForce(0, 3);
    }

    if (get().leftward) {
      vehicleApi.setSteeringValue(0.35, 2);
      vehicleApi.setSteeringValue(0.35, 3);
      vehicleApi.setSteeringValue(-0.1, 0);
      vehicleApi.setSteeringValue(-0.1, 1);
    } else if (get().rightward) {
      vehicleApi.setSteeringValue(-0.35, 2);
      vehicleApi.setSteeringValue(-0.35, 3);
      vehicleApi.setSteeringValue(0.1, 0);
      vehicleApi.setSteeringValue(0.1, 1);
    } else {
      for (let i = 0; i < 4; i++) {
        vehicleApi.setSteeringValue(0, i);
      }
    }

    // if (controls.arrowdown)
    //   chassisApi.applyLocalImpulse([0, -5, 0], [0, 0, +1]);
    // if (controls.arrowup) chassisApi.applyLocalImpulse([0, -5, 0], [0, 0, -1]);
    // if (controls.arrowleft)
    //   chassisApi.applyLocalImpulse([0, -5, 0], [-0.5, 0, 0]);
    // if (controls.arrowright)
    //   chassisApi.applyLocalImpulse([0, -5, 0], [+0.5, 0, 0]);

    let position = new THREE.Vector3(0, 0, 0);
    position.setFromMatrixPosition(chassisBody.current.matrixWorld);

    let cameraPosition = position.clone().add(new THREE.Vector3(-5, 5, 5));
    state.camera.position.copy(cameraPosition);

    let cameraTarget = position.clone().add(new THREE.Vector3(0, 0, 0));
    state.camera.lookAt(cameraTarget);

    if (get().space) {
      chassisApi.position.set(-1.5, 0.5, 3);
      chassisApi.velocity.set(0, 0, 0);
      chassisApi.angularVelocity.set(0, 0, 0);
      chassisApi.rotation.set(0, 0, 0);
    }
  });

  return (
    <group ref={vehicle} name="vehicle">
      {/* <mesh ref={chassisBody}>
        <meshBasicMaterial transparent={true} opacity={0.8} />
        <boxGeometry args={chassisBodyArgs} />
      </mesh> */}

      <WheelDebug wheelRef={wheels[0]} radius={wheelRadius} />
      <WheelDebug wheelRef={wheels[1]} radius={wheelRadius} />
      <WheelDebug wheelRef={wheels[2]} radius={wheelRadius} />
      <WheelDebug wheelRef={wheels[3]} radius={wheelRadius} />
    </group>
  );
};
