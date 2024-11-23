import { Collider } from "@dimforge/rapier3d-compat";
import {
  Environment,
  KeyboardControls,
  OrbitControls,
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
  useRapier,
} from "@react-three/rapier";
import { useControls } from "leva";
import { RefObject, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useVehicleController } from "./use-vehicle-controller";

import oceanVertexShader from "../shaders/ocean/vertex.glsl";
import oceanFragmentShader from "../shaders/ocean/fragment.glsl";

const OceanMaterial = shaderMaterial(
  {
    uTime: 0,
    uColor: new THREE.Color(0x0077ff),
    uMap: null,
  },
  oceanVertexShader,
  oceanFragmentShader
);

extend({ OceanMaterial });

const spawn = {
  position: [7, 2, -8],
  rotation: [0, Math.PI / 5, 0],
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
      accelerateForce: { value: 1, min: 0, max: 10 },
      brakeForce: { value: 0.05, min: 0, max: 0.5, step: 0.01 },
      steerAngle: { value: Math.PI / 12, min: 0, max: Math.PI / 12 },
    }
  );

  const [smoothedCameraPosition] = useState(new THREE.Vector3(0, 10, 0));
  const [smoothedCameraTarget] = useState(new THREE.Vector3());

  useFrame((state, delta) => {
    if (!chasisMeshRef.current || !vehicleController.current || !!threeControls)
      return;

    const t = 1.0 - Math.pow(0.01, delta);

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
      // console.log(chassisRigidBody.linvel().x);

      const a = 1.0 - Math.pow(0.01, delta * 0.05);
      const linvel = currentlinvel.lerp(new THREE.Vector3(0, 0, 0), a);
      chassisRigidBody.setLinvel(
        new rapier.Vector3(linvel.x, linvel.y, linvel.z),
        true
      );
    }

    if (controls.reset || chassisRigidBody.translation().y < -1) {
      const chassis = controller.chassis();
      chassis.setTranslation(new rapier.Vector3(...spawn.position), true);
      const spawnRot = new THREE.Euler(...spawn.rotation);
      const spawnQuat = new THREE.Quaternion().setFromEuler(spawnRot);
      chassis.setRotation(spawnQuat, true);
      chassis.setLinvel(new rapier.Vector3(0, 0, 0), true);
      chassis.setAngvel(new rapier.Vector3(0, 0, 0), true);
    }

    /* camera */

    // camera position
    const cameraPosition = _cameraPosition;

    // camera behind chassis
    cameraPosition.copy(cameraOffset);

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
    </>
  );
};

const Scene = () => {
  const { scene } = useGLTF("/models/Env.glb");
  const baked = useTexture("/textures/baked-2.jpg");
  const bakedRocks = useTexture("/textures/baked-rocks.jpg");

  baked.flipY = false;
  baked.colorSpace = THREE.SRGBColorSpace;

  bakedRocks.flipY = false;
  bakedRocks.colorSpace = THREE.SRGBColorSpace;

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh && child.name === "b002") {
        child.material = new THREE.MeshBasicMaterial({
          map: baked,
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

  const { nodes } = useGLTF("/models/grass.glb");
  const { nodes: nodes2 } = useGLTF("/models/ground.glb");

  const matcap = useTexture("./textures/grass.png");
  const matcap2 = useTexture("./textures/ground.png");

  return (
    <>
      <RigidBody
        type="fixed"
        colliders="trimesh"
        scale={1.2}
        position={[0, 0, 0]}
      >
        <primitive object={scene} />
        {/* <mesh
          geometry={nodes.Vert021.geometry}
          position={nodes.Vert021.position}
        >
          <meshMatcapMaterial matcap={matcap} />
        </mesh>
        <mesh geometry={nodes.b002.geometry} position={nodes.b002.position}>
          <meshMatcapMaterial matcap={matcap} />
        </mesh>
        <mesh geometry={nodes2.b001.geometry} position={nodes2.b001.position}>
          <meshMatcapMaterial matcap={matcap2} />
        </mesh>
        <mesh
          geometry={nodes2.Vert015.geometry}
          position={nodes2.Vert015.position}
        >
          <meshMatcapMaterial matcap={matcap2} />
        </mesh> */}
      </RigidBody>
    </>
  );
};

const Model = () => {
  const { nodes } = useGLTF("/models/g.glb");
  const matcap = useTexture("./textures/green.png");
  // matcap.minFilter = THREE.NearestFilter;
  matcap.magFilter = THREE.LinearMipmapLinearFilter;

  // console.log(nodes.Plane003.position);

  return (
    <>
      <mesh geometry={nodes.b002.geometry} position={nodes.b002.position}>
        <meshMatcapMaterial matcap={matcap} />
      </mesh>
    </>
  );
};

const Water = () => {
  // console.log(nodes.Plane003.position);

  const oceanMaterial = useRef();
  const uMap = useTexture("./textures/uMap.png");

  uMap.wrapS = THREE.RepeatWrapping;
  uMap.wrapT = THREE.RepeatWrapping;

  useFrame((state) => {
    oceanMaterial.current.uniforms.uTime.value += 0.1;
    oceanMaterial.current.uniforms.uMap.value = uMap;
  });

  return (
    <>
      <mesh position={[0, -2, 0]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[50, 50, 50, 50]} />
        <oceanMaterial ref={oceanMaterial} />
        {/* <meshBasicMaterial color={"red"} /> */}
      </mesh>
    </>
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
        camera={{ near: 2, far: 20, fov: 55 }}
      >
        {/* <Model /> */}

        <Water />
        <Environment preset="sunset" />
        <Physics debug={debug}>
          <KeyboardControls map={controls}>
            <Vehicle position={spawn.position} rotation={spawn.rotation} />
          </KeyboardControls>

          <Scene />
        </Physics>

        {/* <ambientLight intensity={1} /> */}
        {/* <hemisphereLight intensity={0.5} /> */}

        {orbitControls && <OrbitControls makeDefault />}
      </Canvas>
    </>
  );
}
