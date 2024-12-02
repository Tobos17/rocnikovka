import { useGLTF, useTexture } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import gsap from "gsap";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import * as THREE from "three";

export const Props = () => {
  const { scene } = useGLTF("/models/Props.glb");
  const bakedProps = useTexture("/textures/bakedProps.jpg");

  bakedProps.flipY = false;
  bakedProps.colorSpace = THREE.SRGBColorSpace;

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshBasicMaterial({
          map: bakedProps,
        });
      }
    });
  }, [scene]);

  return <primitive object={scene} dispose={null} />;
};

export const SpecialProps = () => {
  const { scene } = useGLTF("/models/SpecialProps.glb");
  const bakedSpecialProps = useTexture("/textures/bakedSpecialProps.jpg");

  bakedSpecialProps.flipY = false;
  bakedSpecialProps.colorSpace = THREE.SRGBColorSpace;

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshBasicMaterial({
          map: bakedSpecialProps,
        });
      }
    });
  }, [scene]);

  return <primitive object={scene} dispose={null} />;
};

export const Bridge = ({ tl }) => {
  const { scene } = useGLTF("/models/bridge.glb");
  const bakedBridge = useTexture("/textures/bakedBridge.jpg");

  bakedBridge.flipY = false;
  bakedBridge.colorSpace = THREE.SRGBColorSpace;

  // const [intensity, setIntensity] = useState(0);
  const emissiveMaterial = useRef([]);

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        if (child.name.includes("emis")) {
          // console.log(child);
          child.material = new THREE.MeshStandardMaterial({
            emissive: new THREE.Color(0xf1cc6c),
            emissiveIntensity: 4,
          });
          emissiveMaterial.current.push(child.material);
          return;
        } else if (child.name.includes("Text")) {
          child.material = child.material;
          child.material.visible = false;
          return;
        } else {
          child.material = new THREE.MeshBasicMaterial({
            map: bakedBridge,
          });
        }
      }
    });
  }, [scene]);

  useEffect(() => {
    if (tl.current) {
      tl.current.fromTo(
        emissiveMaterial.current[0],
        { emissiveIntensity: -1 },
        { emissiveIntensity: 4, duration: 0.1 },
        0
      );

      tl.current.to(
        emissiveMaterial.current[0],
        { emissiveIntensity: -1, duration: 0.05 },
        0.15
      );

      tl.current.to(
        emissiveMaterial.current[0],
        { emissiveIntensity: 4, duration: 0.1 },
        0.25
      );
      tl.current.to(
        emissiveMaterial.current[0],
        { emissiveIntensity: -1, duration: 0.05 },
        0.4
      );
      tl.current.to(
        emissiveMaterial.current[0],
        { emissiveIntensity: 4, duration: 0.05 },
        0.55
      );
      tl.current.to(
        emissiveMaterial.current[0],
        { emissiveIntensity: -1, duration: 0.05 },
        0.7
      );

      tl.current.to(
        emissiveMaterial.current[0],
        { emissiveIntensity: 4, duration: 0.05 },
        0.9
      );
    }
  }, [tl.current]);

  return <primitive object={scene} dispose={null} />;
};

export const Mountains = () => {
  const { scene } = useGLTF("/models/Mountains.glb");
  const bakedMountains = useTexture("/textures/bakedMountains.jpg");

  bakedMountains.flipY = false;
  bakedMountains.colorSpace = THREE.SRGBColorSpace;

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshBasicMaterial({
          map: bakedMountains,
        });
      }
    });
  }, [scene]);

  return <primitive object={scene} dispose={null} />;
};

export const Floors = () => {
  const { scene } = useGLTF("/models/Floors.glb");
  const bakedFloors = useTexture("/textures/bakedFloors.jpg");
  const imageTexture = useTexture("/textures/bgg.jpg");
  const imageTexture1 = useTexture("/textures/bgggg.jpg");
  const imageTexture2 = useTexture("/textures/bgg.jpg");
  const imageTexture3 = useTexture("/textures/bgggg.jpg");
  const imageTexture4 = useTexture("/textures/bgg.jpg");

  bakedFloors.flipY = false;
  bakedFloors.colorSpace = THREE.SRGBColorSpace;
  // imageTexture.flipY = false;
  imageTexture.colorSpace = THREE.SRGBColorSpace;

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        if (child.name.includes("image")) {
          child.material = new THREE.MeshBasicMaterial({
            map: imageTexture,
          });
          return;
        } else if (child.name.includes("image.001")) {
          child.material = new THREE.MeshBasicMaterial({
            map: imageTexture1,
          });
          return;
        } else if (child.name.includes("image.002")) {
          child.material = new THREE.MeshBasicMaterial({
            map: imageTexture2,
          });
          return;
        } else if (child.name.includes("image.003")) {
          child.material = new THREE.MeshBasicMaterial({
            map: imageTexture3,
          });
          return;
        } else if (child.name.includes("image.004")) {
          child.material = new THREE.MeshBasicMaterial({
            map: imageTexture4,
          });
          return;
        } else {
          child.material = new THREE.MeshBasicMaterial({
            map: bakedFloors,
          });
        }
      }
    });
  }, [scene]);

  return <primitive object={scene} dispose={null} />;
};

export const Scene = ({ tl }) => {
  const camera = useThree((state) => state.camera);
  const scene = useThree((state) => state.scene);

  useLayoutEffect(() => {
    if (tl.current && camera && scene) {
      camera.position.set(15, 1.5, -15);
      camera.lookAt(0, 1.5, 0);

      tl.current

        .to(camera.position, { x: 10.3, y: 1.2, z: -10.3, duration: 1 }, 0)

        .to(camera.rotation, { y: Math.PI / 2.5, duration: 1 }, 0)
        .to(camera.position, { x: -0.5, y: 1, z: -7.25, duration: 1 }, 1)

        .to(camera.rotation, { y: Math.PI / 60, duration: 1 }, 2)
        .to(camera.position, { x: 2, y: 5, z: -9, duration: 1 }, 2)

        // .to(camera.rotation, { y: Math.PI / 1.25, duration: 1 }, 3)
        .to(camera.position, { x: 2, y: 9, z: -9, duration: 1 }, 3);

      // .to(camera.rotation, { y: Math.PI / 1.25, duration: 1 }, 3)
      // .to(camera.position, { x: 6, y: 5.5, z: 8, duration: 1 }, 3)

      // .to(camera.rotation, { y: Math.PI / 4, duration: 1 }, 4)
      // .to(camera.position, { x: 10, y: 1.5, z: -10, duration: 1 }, 4);
    }
  }, [tl.current]);

  return (
    <group scale={1.2} position={[0, 0, 0]}>
      {/* <primitive object={env} scale={1.2} position={[0, 0, 0]} /> */}
      <Props />
      <SpecialProps />
      <Bridge tl={tl} />
      <Mountains />
      <Floors />
    </group>
  );
};
