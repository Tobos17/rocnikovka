import {
  Cloud,
  Environment,
  Html,
  KeyboardControls,
  OrbitControls,
  PivotControls,
  Sky,
  useGLTF,
  useKeyboardControls,
  useTexture,
} from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  CuboidCollider,
  Physics,
  RigidBody,
  TrimeshCollider,
  useRapier,
} from "@react-three/rapier";
import { useControls } from "leva";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useVehicleController } from "./use-vehicle-controller";
import { Ocean } from "./Ocean";
import { Scene } from "./Scene";
import {
  Bloom,
  BrightnessContrast,
  EffectComposer,
  Vignette,
} from "@react-three/postprocessing";
import { Howl } from "howler";

const spawn = {
  position: [13, 1.5, -12.75],
  rotation: [0, Math.PI / 4.5, 0],
};

const controls = [
  { name: "forward", keys: ["ArrowUp", "KeyW"] },
  { name: "back", keys: ["ArrowDown", "KeyS"] },
  { name: "left", keys: ["ArrowLeft", "KeyA"] },
  { name: "right", keys: ["ArrowRight", "KeyD"] },
  { name: "brake", keys: ["Space"] },
  { name: "reset", keys: ["KeyR"] },
  { name: "horn", keys: ["KeyE"] },
];

const wheelInfo = {
  axleCs: new THREE.Vector3(0, 0, -1),
  suspensionRestLength: 0.125,
  suspensionStiffness: 15,
  maxSuspensionTravel: 5,
  radius: 0.15,
};

const wheels = [
  // front
  { position: new THREE.Vector3(-0.55, -0.15, -0.32), ...wheelInfo },
  { position: new THREE.Vector3(-0.55, -0.15, 0.32), ...wheelInfo },
  // rear
  { position: new THREE.Vector3(0.47, -0.15, -0.325), ...wheelInfo },
  { position: new THREE.Vector3(0.47, -0.15, 0.325), ...wheelInfo },
];

const cameraOffset = new THREE.Vector3(4, 5, -4);
const cameraTargetOffset = new THREE.Vector3(0, 0.2, 0);

const _bodyPosition = new THREE.Vector3();
const _airControlAngVel = new THREE.Vector3();
const _cameraPosition = new THREE.Vector3();
const _cameraTarget = new THREE.Vector3();

const Vehicle = ({ position, rotation, setResults }) => {
  const { world, rapier } = useRapier();
  const threeControls = useThree((s) => s.controls);
  const camera = useThree((s) => s.camera);
  const [, getKeyboardControls] = useKeyboardControls();

  const chasisMeshRef = useRef();
  const chasisBodyRef = useRef();
  const wheelsRef = useRef([]);

  const { vehicleController } = useVehicleController(
    chasisBodyRef,
    wheelsRef,
    wheels
  );

  // const { accelerateForce, brakeForce, steerAngle } = useControls(
  //   "rapier-dynamic-raycast-vehicle-controller",
  //   {
  //     accelerateForce: { value: 0.7, min: 0, max: 10 },
  //     brakeForce: { value: 0.05, min: 0, max: 0.5, step: 0.01 },
  //     steerAngle: { value: Math.PI / 8, min: 0, max: Math.PI / 8 },
  //   }
  // );

  // const [engine, setEngine] = useState({
  //   progress: 0,
  //   progressEasingUp: 0.3,
  //   progressEasingDown: 0.15,
  //   speed: 0,
  //   speedMultiplier: 2.5,
  //   acceleration: 0,
  //   accelerationMultiplier: 0.4,
  //   rate: { min: 0.4, max: 1.4 },
  //   volume: { min: 0.4, max: 1, master: 1 },
  // });

  const soundRef = useRef();

  // Initialize the Howl sound
  useEffect(() => {
    soundRef.current = new Howl({
      src: ["./sounds/engine.mp3"],
      loop: true,
    });
    // console.log(soundRef.current);

    soundRef.current.play();

    return () => soundRef.current.stop(); // Cleanup on component unmount
  }, []);

  // useEffect(() => {
  //   if (!soundRef.current) return;

  //   let isPressed = false;
  //   const handleKeyDown = (event) => {
  //     console.log("Key pressed:", event.code);
  //     if (
  //       event.code === "KeyW" ||
  //       event.code === "ArrowUp" ||
  //       event.code === "KeyS" ||
  //       event.code === "ArrowDown"
  //     ) {
  //       if (!isPressed) {
  //         soundRef.current.play();
  //         // console.log(soundRef.current.volume);
  //       }
  //       isPressed = true;
  //     }
  //   };

  //   const handleKeyUp = (event) => {
  //     console.log("Key released:", event.code);
  //     if (
  //       event.code === "KeyW" ||
  //       event.code === "ArrowUp" ||
  //       event.code === "KeyS" ||
  //       event.code === "ArrowDown"
  //     ) {
  //       isPressed = false;
  //       soundRef.current.pause();
  //     }
  //   };

  //   window.addEventListener("keydown", handleKeyDown);
  //   window.addEventListener("keyup", handleKeyUp);

  //   return () => {
  //     window.removeEventListener("keydown", handleKeyDown);
  //     window.removeEventListener("keyup", handleKeyUp);
  //   };
  // }, []);

  let hornSound = new Audio("/sounds/horn.mp3");
  let engineSound = new Audio("/sounds/engine.mp3");

  engineSound.loop = true;
  engineSound.preload = "auto";
  engineSound.volume = 0;

  let isPlaying = false;

  const accelerateForce = 0.7;
  const brakeForce = 0.05;
  const steerAngle = Math.PI / 8;

  const [smoothedCameraPosition] = useState(new THREE.Vector3(0, 10, 0));
  const [smoothedCameraTarget] = useState(new THREE.Vector3());

  const collider = useRef(null);
  const collider2 = useRef(null);
  const collider3 = useRef(null);

  const [shadowOffset] = useState(new THREE.Vector3(0, -0.25, 0));
  const shadow = useRef(null);

  let intercest = false;

  useFrame((state, delta) => {
    if (
      !chasisMeshRef.current ||
      !vehicleController.current ||
      !!threeControls ||
      !camera ||
      !soundRef.current
    )
      return;

    let t = 1.0 - Math.pow(0.01, delta);

    /* controls */

    const controller = vehicleController.current;

    const chassisRigidBody = controller.chassis();

    const controls = getKeyboardControls();

    const engineForce =
      Number(controls.forward) * accelerateForce - Number(controls.back);

    controller.setWheelEngineForce(0, engineForce);
    controller.setWheelEngineForce(1, engineForce);

    const wheelBrake = Number(controls.brake) * brakeForce;
    controller.setWheelBrake(0, wheelBrake);
    controller.setWheelBrake(1, wheelBrake);
    controller.setWheelBrake(2, wheelBrake);
    controller.setWheelBrake(3, wheelBrake);

    const currentSteering = controller.wheelSteering(0) || 0;
    const steerDirection = Number(controls.left) - Number(controls.right);

    const steering = THREE.MathUtils.lerp(
      currentSteering,
      steerAngle * steerDirection,
      0.5
    );

    controller.setWheelSteering(0, steering);
    controller.setWheelSteering(1, steering);

    const forwardAngVel = Number(controls.forward) - Number(controls.back);
    const sideAngVel = Number(controls.left) - Number(controls.right);

    const angvel = _airControlAngVel.set(0, sideAngVel * t, forwardAngVel * t);
    angvel.applyQuaternion(chassisRigidBody.rotation());
    angvel.add(chassisRigidBody.angvel());

    if (controls.forward || controls.back) {
      chassisRigidBody.setAngvel(
        new rapier.Vector3(angvel.x, angvel.y, angvel.z),
        true
      );
    }

    const vel =
      Math.abs(chassisRigidBody.linvel().x) +
      Math.abs(chassisRigidBody.linvel().z);

    // console.log(vel * 0.15);
    soundRef.current.volume(vel * 0.1);

    if (controls.horn) {
      hornSound.volume = 0.075;
      hornSound.currentTime = 0;
      hornSound.play();
    }

    if (!controls.forward && !controls.back) {
      const currentlinvel = new THREE.Vector3();
      currentlinvel.add(chassisRigidBody.linvel());

      if (
        Math.abs(currentlinvel.x) < 0.01 &&
        Math.abs(currentlinvel.y) < 0.01 &&
        Math.abs(currentlinvel.z) < 0.01
      ) {
        chassisRigidBody.setLinvel(new rapier.Vector3(0, 0, 0), true);
      }

      const a = 1.0 - Math.pow(0.01, delta * 0.05);
      const linvel = currentlinvel.lerp(new THREE.Vector3(0, 0, 0), a);
      chassisRigidBody.setLinvel(
        new rapier.Vector3(linvel.x, linvel.y, linvel.z),
        true
      );
    }

    if (controls.reset || chassisRigidBody.translation().y < -1) {
      // console.log(
      //   chassisRigidBody.translation().x,
      //   chassisRigidBody.translation().z
      // )

      if (chassisRigidBody.translation().x < -5) {
        const x = -7.2;
        const z = -2.3;

        const val = Math.sqrt(
          Math.pow(chassisRigidBody.translation().x - x, 2) +
            Math.pow(chassisRigidBody.translation().z - z, 2)
        );

        setResults((prev) => [...prev, val]);
      }

      chassisRigidBody.setTranslation(
        new rapier.Vector3(...spawn.position),
        true
      );
      const spawnRot = new THREE.Euler(...spawn.rotation);
      const spawnQuat = new THREE.Quaternion().setFromEuler(spawnRot);
      chassisRigidBody.setRotation(spawnQuat, true);
      chassisRigidBody.setLinvel(new rapier.Vector3(0, 0, 0), true);
      chassisRigidBody.setAngvel(new rapier.Vector3(0, 0, 0), true);

      chassisRigidBody.setBodyType(rapier.RigidBodyType.KinematicPositionBased);
    }
    if (state.camera.position.x > 15 || state.camera.position.x < -15) {
      chassisRigidBody.setBodyType(rapier.RigidBodyType.Dynamic);
    }

    const playerPosition = new THREE.Vector3();
    playerPosition.x = chassisRigidBody.translation().x;
    playerPosition.y = chassisRigidBody.translation().y + 0.5;
    playerPosition.z = chassisRigidBody.translation().z;

    const rayDirection = { x: 0, y: 1, z: 0 };
    const maxToi = 3;

    const ray = world.castRay(
      new rapier.Ray(playerPosition, rayDirection),
      maxToi,
      true,
      undefined,
      (2 << 16) | 0x02,
      undefined
    );

    if (ray) {
      intercest = true;
    } else {
      intercest = false;
    }

    /* camera */

    // camera position
    const cameraPosition = _cameraPosition;

    shadow.current.position.copy(chassisRigidBody.translation());
    shadow.current.position.add(shadowOffset);

    shadow.current.position.y = 0.025;

    // camera behind chassis
    if (intercest) {
      let cP;

      if (chassisRigidBody.translation().y < 2) {
        if (chassisRigidBody.translation().x > 8.5) {
          cP = new THREE.Vector3(2.5, 2, -2.2);
        } else {
          cP = new THREE.Vector3(1, 6, -5);
        }
      } else {
        cP = new THREE.Vector3(4, 6, 4);
      }

      cameraPosition.copy(cP);
      t = 1.0 - Math.pow(0.01, delta * 0.4);
    } else {
      cameraPosition.copy(cameraOffset);
    }

    if (chassisRigidBody.translation().x < -7.5) {
      shadow.current.visible = false;
    } else {
      shadow.current.visible = true;
    }

    cameraPosition.add(chassisRigidBody.translation());

    smoothedCameraPosition.lerp(cameraPosition, t);

    state.camera.position.copy(smoothedCameraPosition);
    // console.log(chasisMeshRef.current.getWorldPosition(_bodyPosition));

    // camera target
    const bodyPosition = chasisMeshRef.current.getWorldPosition(_bodyPosition);
    const cameraTarget = _cameraTarget;

    cameraTarget.copy(bodyPosition);
    cameraTarget.add(cameraTargetOffset);
    smoothedCameraTarget.lerp(cameraTarget, t);

    state.camera.lookAt(smoothedCameraTarget);
  });

  const { scene } = useGLTF("/models/w.glb");
  const { scene: scene2 } = useGLTF("/models/ch.glb");
  const bakedShadow = useTexture("/textures/simpleShadow.jpg");

  return (
    <>
      <RigidBody
        scale={0.8}
        position={position}
        rotation={rotation}
        canSleep={false}
        ref={chasisBodyRef}
        colliders={false}
        collisionGroups={(1 << 16) | 0x01}
        mass={20}
        type="dynamic"
      >
        <CuboidCollider args={[0.8, 0.2, 0.4]} />

        <group rotation-y={Math.PI} ref={chasisMeshRef} name="chassisBody">
          <primitive object={scene2} position={[0.225, -0.25, -0.275]} />
        </group>

        {/* wheels */}
        {wheels.map((wheel, index) => (
          <group
            key={index}
            ref={(ref) => (wheelsRef.current[index] = ref)}
            position={wheel.position}
          >
            <group
              rotation-x={
                index === 0 || index === 2 ? Math.PI / 2 : -Math.PI / 2
              }
            >
              <primitive object={scene.clone()} />
            </group>
          </group>
        ))}
      </RigidBody>

      <RigidBody
        type="fixed"
        colliders="cuboid"
        ref={collider}
        collisionGroups={(2 << 16) | 0x02}
      >
        <mesh position={[0, 4.5, 0]}>
          <boxGeometry args={[10, 0.2, 10]} />
          <meshBasicMaterial visible={false} color="red" />
        </mesh>
      </RigidBody>

      <RigidBody
        type="fixed"
        colliders="cuboid"
        ref={collider2}
        collisionGroups={(2 << 16) | 0x02}
      >
        <mesh position={[-3, 1.5, -5]}>
          <boxGeometry args={[10, 0.2, 10]} />
          <meshBasicMaterial visible={false} color="red" />
        </mesh>
      </RigidBody>

      <RigidBody
        type="fixed"
        colliders="cuboid"
        ref={collider3}
        collisionGroups={(2 << 16) | 0x02}
      >
        <mesh position={[12.5, 3, -12.5]} rotation-y={Math.PI / 4.5}>
          <boxGeometry args={[5, 0.2, 5]} />
          <meshBasicMaterial visible={false} color="red" />
        </mesh>
      </RigidBody>
      <mesh ref={shadow} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[5, 5]} />
        <meshBasicMaterial
          color={0x000000}
          transparent
          side={THREE.DoubleSide}
          alphaMap={bakedShadow}
        />
      </mesh>
    </>
  );
};

const ScenePhysics = () => {
  const { scene: colliderScene } = useGLTF("/models/colliders.glb");
  const { scene: colliderScene1 } = useGLTF("/models/collider.glb");
  const { scene: colliderScene2 } = useGLTF("/models/collider2.glb");

  const geometry = colliderScene2.children[0].geometry;
  const vertices = geometry.attributes.position.array;
  const indices = geometry.index.array;

  const geometry1 = colliderScene1.children[0].geometry;
  const vertices1 = geometry1.attributes.position.array;
  const indices1 = geometry1.index.array;

  let mainSound = new Audio("/sounds/main.mp3");
  let crashSound = new Audio("/sounds/crashhh.mp3");

  useEffect(() => {
    mainSound.volume = 0.01;
    mainSound.currentTime = 0;
    mainSound.play();
  }, []);

  return (
    <>
      <RigidBody
        type="fixed"
        colliders="trimesh"
        scale={1.2}
        position={[0, 0, 0]}
        collisionGroups={(1 << 16) | 0x01}
      >
        {/* <primitive object={colliderScene} /> */}
        <TrimeshCollider args={[vertices, indices]} />
      </RigidBody>
      <RigidBody
        type="fixed"
        colliders="trimesh"
        scale={1.2}
        position={[0, 0, 0]}
        collisionGroups={(1 << 16) | 0x01}
        onCollisionEnter={(e) => {
          crashSound.volume = 1;
          crashSound.currentTime = 0;
          crashSound.play();
        }}
      >
        <TrimeshCollider args={[vertices1, indices1]} />
      </RigidBody>
    </>
  );
};

const TextPlane = () => {
  const alphaText = useTexture("/textures/alphaText1.webp");
  const alphaText2 = useTexture("/textures/alphaText2.webp");
  const alphaText3 = useTexture("/textures/alphaText3.webp");

  // alphaMap.flipY = false;
  alphaText.colorSpace = THREE.SRGBColorSpace;
  alphaText.anisotropy = 16;

  alphaText2.colorSpace = THREE.SRGBColorSpace;
  alphaText2.anisotropy = 16;

  alphaText3.colorSpace = THREE.SRGBColorSpace;
  alphaText3.anisotropy = 16;

  const position = [2, 3.1, 0];
  const position2 = [14, 1.15, -11.5];
  const position3 = [-2.5, 1.5, -4];

  return (
    <>
      <mesh
        position={position}
        rotation-x={-Math.PI / 2}
        rotation-z={Math.PI / 3.35}
      >
        <planeGeometry args={[5, 4]} />
        <meshStandardMaterial
          // color={"white"}
          emissive={new THREE.Color(0xe3ebac)}
          emissiveIntensity={0.0001}
          alphaMap={alphaText2}
          transparent={true}
        />
      </mesh>
      <mesh position={position2} rotation-y={Math.PI / 1.4}>
        <planeGeometry args={[2, 2]} />
        <meshStandardMaterial
          emissive={new THREE.Color(0xffffff)}
          emissiveIntensity={-0.025}
          alphaMap={alphaText}
          transparent={true}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={position3} rotation-y={Math.PI / 0.915}>
        <planeGeometry args={[4, 3]} />
        <meshStandardMaterial
          emissive={new THREE.Color(0xffffff)}
          emissiveIntensity={0.25}
          alphaMap={alphaText3}
          transparent={true}
          side={THREE.DoubleSide}
        />
      </mesh>
    </>
  );
};

export const Experience = ({ loading, isReady, tl }) => {
  // const { debug, orbitControls } = useControls(
  //   "rapier-dynamic-raycast-vehicle-controller/physics",
  //   {
  //     debug: false,
  //     orbitControls: false,
  //   }
  // );

  const [results, setResults] = useState([]);

  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1024) setIsSmallScreen(false);
      else setIsSmallScreen(true);
    };
    window.addEventListener("resize", handleResize);

    handleResize();
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <>
      <Canvas
        flat
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
        }}
        dpr={[1, 1.5]}
        camera={{
          near: 0.1,
          fov: isSmallScreen ? 75 : 55,
        }}
      >
        <Environment preset="sunset" />
        <Sky
          turbidity={8.2}
          rayleigh={1.099}
          mieCoefficient={0.005}
          mieDirectionalG={0.447}
          sunPosition={[60, 60, 150]}
        />
        {/* <color attach="background" args={["#171720"]} /> */}
        {/* <fog attach="fog" args={["#171720", 10, 20]} /> */}

        {isReady && (
          <Physics debug={false}>
            <KeyboardControls map={controls}>
              <Vehicle
                position={spawn.position}
                rotation={spawn.rotation}
                setResults={setResults}
              />
            </KeyboardControls>

            <ScenePhysics />
          </Physics>
        )}

        <Scene loading={loading} tl={tl} isReady={isReady} />

        {isReady && (
          <>
            <TextPlane />
          </>
        )}

        <Ocean />

        {/* {!isReady && ( */}
        <EffectComposer>
          <Bloom
            intensity={2}
            luminanceThreshold={2.3}
            luminanceSmoothing={0.1}
            mipmapBlur={true}
          />
          <Vignette offset={0.1} darkness={0.85} />
          <BrightnessContrast brightness={-0.1} contrast={-0.15} />
        </EffectComposer>
        {/* )} */}

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

        <ambientLight intensity={5.5} color={0xffffff} />

        {/* <PivotControls scale={50} /> */}

        {/* {orbitControls && <OrbitControls makeDefault />} */}
      </Canvas>

      {isReady && (
        <div className="fixed right-[5vw] top-[5vh] z-[100] h-[25vh] w-[20vw] flex flex-col gap-5 items-center justify-center overflow-hidden select-none">
          <h1 className="text-4xl md:text-5xl font-title text-white">
            Top 3 skoky
          </h1>
          <h1 className="text-4xl md:text-5xl font-title text-white">
            {results
              .sort((a, b) => b - a) // Sort in ascending order
              .slice(0, 3) // Take the 3 smallest values
              .map((res, index) => (
                <p key={index}>{res.toFixed(2)}</p> // Render each result
              ))}
          </h1>
        </div>
      )}
    </>
  );
};
