import { Line, OrbitControls, useGLTF, useTexture } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import gsap from "gsap";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
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
          child.material = new THREE.MeshStandardMaterial({
            color: new THREE.Color(0x5e513c),
            roughness: 1,
            metalness: 0.9,
          });

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
  const imageTexture2 = useTexture("/textures/bggg.webp");
  const imageTexture3 = useTexture("/textures/bgggggggg.jpg");
  const imageTexture4 = useTexture("/textures/bgggg.jpeg");

  bakedFloors.flipY = false;
  bakedFloors.colorSpace = THREE.SRGBColorSpace;
  // imageTexture.flipY = false;
  imageTexture.colorSpace = THREE.SRGBColorSpace;

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        if (child.name === "image") {
          child.material = new THREE.MeshStandardMaterial({
            emissive: new THREE.Color(0xf1cc6c),
            emissiveIntensity: -0.5,
            map: imageTexture,
          });
          return;
        } else if (child.name === "image001") {
          child.material = new THREE.MeshStandardMaterial({
            emissive: new THREE.Color(0xf1cc6c),
            emissiveIntensity: -0.5,
            map: imageTexture1,
          });
          return;
        } else if (child.name === "image002") {
          child.material = new THREE.MeshStandardMaterial({
            emissive: new THREE.Color(0xf1cc6c),
            emissiveIntensity: -0.5,
            map: imageTexture3,
          });
          return;
        } else if (child.name === "image003") {
          child.material = new THREE.MeshStandardMaterial({
            emissive: new THREE.Color(0xf1cc6c),
            emissiveIntensity: -0.5,
            map: imageTexture4,
          });
          return;
        } else if (child.name === "image004") {
          child.material = new THREE.MeshStandardMaterial({
            emissive: new THREE.Color(0xf1cc6c),
            emissiveIntensity: -1,
            map: imageTexture2,
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

export const Scene = ({ loading, tl, isReady }) => {
  const camera = useThree((state) => state.camera);
  const scene = useThree((state) => state.scene);

  const LINE_NB_POINTS = 2000;

  const curvePoints = useMemo(
    () => [
      new THREE.Vector3(15, 1.5, -15),
      new THREE.Vector3(9, 1.5, -10),
      new THREE.Vector3(-0.5, 1.15, -7.25),
      new THREE.Vector3(3, 8, -8),
      new THREE.Vector3(-2, 10, -2),
    ],
    []
  );

  const curve = useMemo(() => {
    return new THREE.CatmullRomCurve3(curvePoints, false, "catmullrom", 0.5);
  }, []);

  const linePoints = useMemo(() => {
    return curve.getPoints(LINE_NB_POINTS);
  }, [curve]);

  useFrame((state, delta) => {
    if (tl.current && camera && scene && !loading && !isReady) {
      // console.log(loading);
      const curPointIndex = Math.min(
        Math.round(tl.current.progress() * linePoints.length),
        linePoints.length - 1
      );
      // console.log(state.camera.position.y);

      const curPoint = linePoints[curPointIndex];

      const lookAtPoint =
        linePoints[Math.min(linePoints.length, curPointIndex + 10)];

      // state.camera.lookAt(lookAtPoint);
      // console.log(state.camera.getWorldDirection());

      state.camera.position.lerp(curPoint, delta * 20);
    }
  });

  useLayoutEffect(() => {
    if (tl.current && camera && scene && loading) {
      gsap.fromTo(
        camera.position,
        { x: 19, y: 4, z: -19 },
        {
          x: 15,
          y: 1.5,
          z: -15,
          duration: 3,
          ease: "sm",
          onComplete: () => {
            window.addEventListener("mousemove", updateCursorPosition);
          },
        }
      );

      camera.lookAt(0, 1.5, 0);
      tl.current
        // .to(camera.position, { x: 10.3, y: 1.2, z: -10.3, duration: 1 }, 0)
        .to(camera.rotation, { y: Math.PI / 2.5, duration: 1.75 }, 0)
        // .to(camera.position, { x: -0.5, y: 1, z: -7.25, duration: 1 }, 1)
        .to(camera.rotation, { y: Math.PI / 60, duration: 1.5 }, 2);
      // .to(camera.position, { x: 2, y: 5, z: -9, duration: 1 }, 2)
      // .to(camera.position, { x: 2, y: 9, z: -9, duration: 1 }, 3);
    }
    return () => {
      return () =>
        window.removeEventListener("mousemove", updateCursorPosition);
    };
  }, [tl.current]);

  const cursor = useRef({ x: 0, y: 0 });

  const updateCursorPosition = (event) => {
    cursor.current = {
      x: (event.clientX / window.innerWidth) * 2 - 1, // Normalized X (-1 to 1)
      y: -(event.clientY / window.innerHeight) * 2 + 1, // Normalized Y (-1 to 1)
    };
  };

  // Add mousemove listener

  useFrame((state, delta) => {
    if (!isReady && !loading) {
      let t = 1.0 - Math.pow(0.01, delta * 0.2);

      const mouseX = cursor.current.x * 0.15;
      const mouseY = cursor.current.y * 0.15;

      scene.position.lerp(new THREE.Vector3(-mouseX, mouseY, -mouseX), t);
    }
  });

  return (
    <>
      <group scale={1.2} position={[0, 0, 0]}>
        {/* <OrbitControls /> */}
        {/* <primitive object={env} scale={1.2} position={[0, 0, 0]} /> */}
        <Props />
        <SpecialProps />
        <Bridge tl={tl} />
        <Mountains />
        <Floors />
      </group>

      {/* <Line points={linePoints} color={"white"} lineWidth={16} /> */}
    </>
  );
};
