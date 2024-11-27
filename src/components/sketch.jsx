import { Collider } from "@dimforge/rapier3d-compat";
import {
  Environment,
  KeyboardControls,
  OrbitControls,
  PivotControls,
  shaderMaterial,
  useGLTF,
  useKeyboardControls,
  useTexture,
} from "@react-three/drei";
import { Canvas, extend, useFrame, useThree } from "@react-three/fiber";
import {
  CuboidCollider,
  Physics,
  RapierRigidBody,
  RigidBody,
  TrimeshCollider,
  useRapier,
} from "@react-three/rapier";
import { Leva, useControls } from "leva";
import { RefObject, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useVehicleController } from "./use-vehicle-controller";
import { Ocean } from "./Ocean";

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
const cameraTargetOffset = new THREE.Vector3(0, 0, 0);

const _bodyPosition = new THREE.Vector3();
const _airControlAngVel = new THREE.Vector3();
const _cameraPosition = new THREE.Vector3();
const _cameraTarget = new THREE.Vector3();

const Vehicle = ({ position, rotation }) => {
  const { world, rapier } = useRapier();
  const threeControls = useThree((s) => s.controls);
  const [, getKeyboardControls] = useKeyboardControls();

  const chasisMeshRef = useRef();
  const chasisBodyRef = useRef();
  const wheelsRef = useRef([]);

  const { vehicleController } = useVehicleController(
    chasisBodyRef,
    wheelsRef,
    wheels
  );

  const { accelerateForce, brakeForce, steerAngle } = useControls(
    "rapier-dynamic-raycast-vehicle-controller",
    {
      accelerateForce: { value: 0.75, min: 0, max: 10 },
      brakeForce: { value: 0.05, min: 0, max: 0.5, step: 0.01 },
      steerAngle: { value: Math.PI / 8, min: 0, max: Math.PI / 8 },
    }
  );

  const [smoothedCameraPosition] = useState(new THREE.Vector3(0, 10, 0));
  const [smoothedCameraTarget] = useState(new THREE.Vector3());

  const collider = useRef(null);
  const collider2 = useRef(null);
  const collider3 = useRef(null);

  let intercest = false;

  useFrame((state, delta) => {
    if (!chasisMeshRef.current || !vehicleController.current || !!threeControls)
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
      chassisRigidBody.setTranslation(
        new rapier.Vector3(...spawn.position),
        true
      );
      const spawnRot = new THREE.Euler(...spawn.rotation);
      const spawnQuat = new THREE.Quaternion().setFromEuler(spawnRot);
      chassisRigidBody.setRotation(spawnQuat, true);
      chassisRigidBody.setLinvel(new rapier.Vector3(0, 0, 0), true);
      chassisRigidBody.setAngvel(new rapier.Vector3(0, 0, 0), true);
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

    // camera behind chassis
    if (intercest) {
      let cP;

      if (chassisRigidBody.translation().y < 2) {
        if (chassisRigidBody.translation().x > 8.5) {
          cP = new THREE.Vector3(3, 2, -3);
        } else {
          cP = new THREE.Vector3(1, 4, -5);
        }
      } else {
        cP = new THREE.Vector3(4, 6, 5);
      }

      cameraPosition.copy(cP);
      t = 1.0 - Math.pow(0.01, delta * 0.35);
    } else {
      cameraPosition.copy(cameraOffset);
    }

    cameraPosition.add(chassisRigidBody.translation());

    smoothedCameraPosition.lerp(cameraPosition, t);

    state.camera.position.copy(smoothedCameraPosition);

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
        <mesh position={[13, 3, -13]} rotation-y={Math.PI / 4.5}>
          <boxGeometry args={[5, 0.2, 5]} />
          <meshBasicMaterial visible={false} color="red" />
        </mesh>
      </RigidBody>
    </>
  );
};

const Scene = () => {
  const { scene } = useGLTF("/models/Env.glb");
  const baked = useTexture("/textures/baked-2.jpg");
  const bakedRocks = useTexture("/textures/baked-rocks.jpg");
  const bakedFloors = useTexture("/textures/baked-floors.jpg");

  const { scene: colliderScene } = useGLTF("/models/colliders.glb");
  const geometry = colliderScene.children[0].geometry;
  const vertices = geometry.attributes.position.array;
  const indices = geometry.index.array;

  baked.flipY = false;
  baked.colorSpace = THREE.SRGBColorSpace;

  bakedRocks.flipY = false;
  bakedRocks.colorSpace = THREE.SRGBColorSpace;

  bakedFloors.flipY = false;
  bakedFloors.colorSpace = THREE.SRGBColorSpace;

  useEffect(() => {
    scene.traverse((child) => {
      if (
        (child.isMesh && child.name === "b") ||
        (child.isMesh && child.name === "b001") ||
        (child.isMesh && child.name === "b002") ||
        (child.isMesh && child.name === "b003")
      ) {
        child.material = new THREE.MeshBasicMaterial({
          map: bakedFloors,
        });
      } else if (child.isMesh && child.name === "bounds") {
        child.material = new THREE.MeshBasicMaterial({
          visible: false,
        });
      } else if (child.isMesh && child.name === "m") {
        child.material = new THREE.MeshBasicMaterial({
          map: bakedRocks,
        });
      }
    });
  }, [scene]);

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
      <primitive object={scene} scale={1.2} position={[0, 0, 0]} />
    </>
  );
};

const TextPlane = () => {
  const alphaMap = useTexture("/textures/floorTexture.png");

  const position = [8, 0.01, -8];

  return (
    <>
      <mesh
        position={position}
        rotation-x={-Math.PI / 2}
        rotation-z={Math.PI / 1.5}
      >
        <planeGeometry args={[3.5, 3.5]} />
        <meshBasicMaterial
          color={"red"}
          alphaMap={alphaMap}
          transparent={true}
        />
      </mesh>
    </>
  );
};

const Model = () => {
  const position = [9, 5, -8];
  return (
    <RigidBody
      scale={0.2}
      colliders="trimesh"
      position={position}
      type="dynamic"
    >
      <mesh castShadow>
        <boxGeometry />
        <meshStandardMaterial color="orange" />
      </mesh>
    </RigidBody>
  );
};

export function Sketch() {
  const { debug, orbitControls } = useControls(
    "rapier-dynamic-raycast-vehicle-controller/physics",
    {
      debug: false,
      orbitControls: false,
    }
  );

  return (
    <>
      <Canvas
        gl={{
          antialias: true,
          alpha: false,
          stencil: false,
          powerPreference: "high-performance",
        }}
        dpr={[1, 1.5]}
        camera={{ near: 2, fov: 55 }}
      >
        <Environment preset="sunset" />
        <Physics debug={debug}>
          <KeyboardControls map={controls}>
            <Vehicle position={spawn.position} rotation={spawn.rotation} />
          </KeyboardControls>
          <Model />
          <Scene />
        </Physics>

        <TextPlane />

        <Ocean />

        <PivotControls scale={50} />

        {/* <ambientLight intensity={1} /> */}
        {/* <hemisphereLight intensity={0.5} /> */}
        {orbitControls && <OrbitControls makeDefault />}
      </Canvas>
    </>
  );
}
