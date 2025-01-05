import React, { forwardRef, useEffect, useRef } from "react";
import { extend, useFrame } from "@react-three/fiber";
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

const Water = ({ modelRef }) => {
  const oceanMaterial = useRef();
  const uMap = useTexture("./textures/uMap.png");

  uMap.wrapS = THREE.RepeatWrapping;
  uMap.wrapT = THREE.RepeatWrapping;

  useEffect(() => {
    if (oceanMaterial.current) {
      oceanMaterial.current.uniforms.uMap.value = uMap;
    }
  }, [uMap]);

  useFrame((state, delta) => {
    if (!oceanMaterial.current || !modelRef.current) return;
    oceanMaterial.current.uniforms.uTime.value += delta * 10;

    if (modelRef.current) {
      const offset = 0;

      const shift = 0.1;

      const positionA = new THREE.Vector3().addVectors(
        modelRef.current.position,
        new THREE.Vector3(shift, 0, 0)
      );
      const positionB = new THREE.Vector3().addVectors(
        modelRef.current.position,
        new THREE.Vector3(0, 0, -shift)
      );

      modelRef.current.position.y = waveElevation(
        modelRef.current.position,
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
      const toA = positionA.clone().sub(modelRef.current.position).normalize();
      const toB = positionB.clone().sub(modelRef.current.position).normalize();
      const normal = new THREE.Vector3().crossVectors(toA, toB);

      modelRef.current.position.y += offset;

      const quaternion = new THREE.Quaternion().setFromUnitVectors(up, normal);
      modelRef.current.quaternion.copy(quaternion);
    }
  });

  return (
    <>
      <mesh rotation-x={-Math.PI / 2}>
        <planeGeometry args={[100, 100, 150, 150]} />
        <oceanMaterial ref={oceanMaterial} />
      </mesh>
    </>
  );
};

const Model = forwardRef((props, ref) => {
  const { scene } = useGLTF("/models/majak.glb");

  return <primitive ref={ref} object={scene} {...props} dispose={null} />;
});

export function Ocean() {
  const modelRef = useRef();

  return (
    <group position={[0, -2, 0]} rotation={[0, Math.PI / 4, 0]}>
      <Model ref={modelRef} position={[5, 0, -11.5]} />
      <Water modelRef={modelRef} />
    </group>
  );
}
