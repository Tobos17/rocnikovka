import React, { useEffect, useRef } from "react";
import { extend, useFrame } from "@react-three/fiber";
import { useControls } from "leva";
import * as THREE from "three";
import { shaderMaterial, useGLTF, useTexture } from "@react-three/drei";

import oceanVertexShader from "../shaders/ocean/vertex.glsl";
import oceanFragmentShader from "../shaders/ocean/fragment.glsl";

const OceanMaterial = shaderMaterial(
  {
    uTime: 0,
    uColor: new THREE.Color(0x6bbbee),
    uMap: null,
  },
  oceanVertexShader,
  oceanFragmentShader
);

extend({ OceanMaterial });

const waveElevation = (p, uTime) => {
  const position = p.clone().multiplyScalar(2.5);
  // console.log(position);
  const time = uTime * 0.05;
  const scale = 10;
  const strength = 0.75;

  let elv = 0;
  elv +=
    (Math.sin((position.x * 1) / scale + time) +
      Math.sin((position.x * 2.3) / scale + time * 1.5) +
      Math.sin((position.x * 3.3) / scale + time * 0.4)) /
    3;

  elv +=
    (Math.sin((position.z * 0.2) / scale + time * 1.8) +
      Math.sin((position.z * 1.8) / scale + time * 1.8) +
      Math.sin((position.z * 2.8) / scale + time * 0.8)) /
    3;

  elv *= strength;

  return elv;
};

const Water = ({ cubeRef }) => {
  useFrame((state, delta) => {
    oceanMaterial.current.uniforms.uTime.value += delta * 10; //delta
    oceanMaterial.current.uniforms.uMap.value = uMap;

    if (cubeRef.current) {
      // const offset = cubeRef.current.geometry.parameters.height / 2;
      const offset = 0;

      const shift = 0.1;

      const positionA = new THREE.Vector3().addVectors(
        cubeRef.current.position,
        new THREE.Vector3(shift, 0, 0)
      );
      const positionB = new THREE.Vector3().addVectors(
        cubeRef.current.position,
        new THREE.Vector3(0, 0, -shift)
      );

      cubeRef.current.position.y = waveElevation(
        cubeRef.current.position,
        oceanMaterial.current.uniforms.uTime.value
      );
      positionA.y = waveElevation(
        positionA,
        oceanMaterial.current.uniforms.uTime.value
      );
      positionB.y = waveElevation(
        positionB,
        oceanMaterial.current.uniforms.uTime.value
      );

      const up = new THREE.Vector3(0, 1, 0);
      const toA = positionA.clone().sub(cubeRef.current.position).normalize();
      const toB = positionB.clone().sub(cubeRef.current.position).normalize();
      const normal = new THREE.Vector3().crossVectors(toA, toB);

      cubeRef.current.position.y += offset;

      const quaternion = new THREE.Quaternion().setFromUnitVectors(up, normal);
      cubeRef.current.quaternion.copy(quaternion);
    }
  });

  const oceanMaterial = useRef();
  const uMap = useTexture("./textures/uMap.png");

  uMap.wrapS = THREE.RepeatWrapping;
  uMap.wrapT = THREE.RepeatWrapping;

  return (
    <>
      <mesh rotation-x={-Math.PI / 2}>
        <planeGeometry args={[100, 100, 150, 150]} />
        <oceanMaterial ref={oceanMaterial} />
        {/* <meshBasicMaterial color={"red"} /> */}
      </mesh>
    </>
  );
};

const Model = React.forwardRef((props, ref) => {
  const { scene } = useGLTF("/models/majak.glb");

  return <primitive ref={ref} object={scene} {...props} dispose={null} />;
});

export function Ocean() {
  const cubeRef = useRef();

  return (
    <group position={[0, -2, 0]} rotation={[0, Math.PI / 4, 0]}>
      <Model ref={cubeRef} position={[5, 0, -11.5]} />
      <Water cubeRef={cubeRef} />
    </group>
  );
}
