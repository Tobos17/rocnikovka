import { useGLTF, useKeyboardControls, useTexture } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { CuboidCollider, RigidBody, useRapier } from "@react-three/rapier";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { Howl } from "howler";

import { useVehicleController } from "../utils/useController";

const spawn = {
  position: [13, 1.5, -12.75],
  rotation: [0, Math.PI / 4.5, 0],
};

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

export const Vehicle = ({ setResults, hasKeyboard, reset, switched }) => {
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

  const isSwitched = useRef(false);
  useEffect(() => {
    const handleSwitch = (e) => {
      if (e.key === "c") {
        isSwitched.current = !isSwitched.current;
      }
    };
    window.addEventListener("keydown", handleSwitch);

    return () => {
      window.removeEventListener("keydown", handleSwitch);
    };
  }, []);

  useEffect(() => {
    if (switched) {
      isSwitched.current = true;
    } else {
      isSwitched.current = false;
    }
  }, [switched]);

  const soundRef = useRef();

  useEffect(() => {
    soundRef.current = new Howl({
      src: ["./sounds/engine.mp3"],
      loop: true,
    });

    soundRef.current.play();

    return () => soundRef.current.stop();
  }, []);

  let hornSound = new Audio("/sounds/horn.mp3");
  let engineSound = new Audio("/sounds/engine.mp3");

  engineSound.loop = true;
  engineSound.preload = "auto";
  engineSound.volume = 0;

  const accelerateForce = 0.7;
  const brakeForce = 0.05;
  const steerAngle = Math.PI / 8;

  const [smoothedCameraPosition] = useState(new THREE.Vector3(0, 10, 0));
  const [smoothedCameraTarget] = useState(new THREE.Vector3());
  const [smoothedCamera] = useState(new THREE.Vector3(0, 0, 0));

  const collider = useRef(null);
  const collider2 = useRef(null);
  const collider3 = useRef(null);

  const [shadowOffset] = useState(new THREE.Vector3(-0.15, -0.25, 0.15));
  const shadow = useRef(null);

  let intercest = false;

  let joystickX = 0;
  let joystickY = 0;

  let outerCircle, innerCircle;

  let outerRadius = 0;
  let centerX = 0;
  let centerY = 0;

  function setupJoystick() {
    if (!hasKeyboard) {
      outerCircle = document.getElementById("joystick");
      innerCircle = document.getElementById("inner-circle");

      outerRadius = outerCircle.clientWidth / 2;
      centerX = outerCircle.clientWidth / 2;
      centerY = outerCircle.clientHeight / 2;

      outerCircle.addEventListener("touchstart", (e) => startDrag(e));

      window.addEventListener("touchend", () => endDrag());

      window.addEventListener("touchmove", (e) => handleDrag(e));
    }
  }

  setupJoystick();

  function startDrag(event) {
    event.preventDefault();
  }

  function endDrag(event) {
    gsap.to(innerCircle, {
      x: 0,
      y: 0,
      duration: 0.25,
      ease: "power2.out",
    });
    joystickX = 0;
    joystickY = 0;
  }

  function handleDrag(event) {
    let clientX, clientY;

    if (event.type.startsWith("touch")) {
      const touch = event.touches[0];
      if (touch.target.id === "reset") return;
      clientX = touch.clientX;
      clientY = touch.clientY;
    } else {
      clientX = event.clientX;
      clientY = event.clientY;
    }

    const rect = outerCircle.getBoundingClientRect();
    let mouseX = clientX - rect.left - centerX;
    let mouseY = clientY - rect.top - centerY;

    const distance = Math.sqrt(mouseX * mouseX + mouseY * mouseY);

    if (distance > outerRadius) {
      const angle = Math.atan2(mouseY, mouseX);
      mouseX = outerRadius * Math.cos(angle);
      mouseY = outerRadius * Math.sin(angle);
    }

    gsap.to(innerCircle, {
      x: mouseX * 1.15,
      y: mouseY * 1.15,
      duration: 0.1,
      ease: "power2.out",
    });

    joystickX = mouseX / outerRadius;
    joystickY = -mouseY / outerRadius;
  }

  function handleJoystickMovement(x, y, controller, t) {
    let engineForce;
    let steerDirection;

    if (x > 0.25) {
      steerDirection = -x;
    }
    if (x < -0.25) {
      steerDirection = -x;
    }
    if (y > 0.25) {
      engineForce = y;
    }
    if (y < -0.25) {
      engineForce = y;
    }
    if (y > -0.25 && y < 0.25) {
      if (x < -0.25 || x > 0.25) {
        engineForce = Math.abs(x) * 0.25;
      } else {
        engineForce = 0;
      }
    }
    if (x > -0.25 && x < 0.25) {
      steerDirection = 0;
    }

    const currentSteering = controller.wheelSteering(0) || 0;
    const steering = THREE.MathUtils.lerp(
      currentSteering,
      steerAngle * steerDirection,
      0.5
    );

    controller.setWheelEngineForce(0, engineForce * accelerateForce * 0.8);
    controller.setWheelEngineForce(1, engineForce * accelerateForce * 0.8);

    controller.setWheelSteering(0, steering);
    controller.setWheelSteering(1, steering);
  }

  const resetPos = (chassisRigidBody) => {
    if (chassisRigidBody.translation().y < -1) {
      if (chassisRigidBody.translation().x < -5) {
        const x = -7.2;
        const z = -2.3;

        const val = Math.sqrt(
          Math.pow(chassisRigidBody.translation().x - x, 2) +
            Math.pow(chassisRigidBody.translation().z - z, 2)
        );

        setResults((prev) => [...prev, val]);
      }
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
  };

  useEffect(() => {
    if (
      !chasisMeshRef.current ||
      !vehicleController.current ||
      !!threeControls ||
      !camera ||
      !soundRef.current
    )
      return;

    const controller = vehicleController.current;
    const chassisRigidBody = controller.chassis();

    if (reset) {
      resetPos(chassisRigidBody);
    }
  }, [reset]);

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

    const controller = vehicleController.current;
    const chassisRigidBody = controller.chassis();

    const controls = getKeyboardControls();

    const engineForce =
      Number(controls.forward) * accelerateForce - Number(controls.back);

    if (hasKeyboard === false) {
      handleJoystickMovement(joystickX, joystickY, controller, t);
    } else {
      controller.setWheelEngineForce(0, engineForce);
      controller.setWheelEngineForce(1, engineForce);
    }

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

    if (hasKeyboard) {
      controller.setWheelSteering(0, steering);
      controller.setWheelSteering(1, steering);
    }

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
      resetPos(chassisRigidBody);
    }

    if (
      state.camera.position.x > (isSwitched.current ? 14 : 15) ||
      state.camera.position.x < (isSwitched.current ? -14 : -15)
    ) {
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

    // console.log(camera.rotation.x, camera.rotation.y, camera.rotation.z);

    /* camera */

    // camera position
    const cameraPosition = _cameraPosition;

    shadow.current.position.copy(chassisRigidBody.translation());
    shadow.current.position.add(shadowOffset);

    shadow.current.position.y = 0.025;

    if (chassisRigidBody.translation().x < -7.5) {
      shadow.current.visible = false;
    } else {
      shadow.current.visible = true;
    }

    if (isSwitched.current) {
      let rPosition = chassisRigidBody.translation();
      let rQuaternion = chassisRigidBody.rotation();

      let position = new THREE.Vector3(rPosition.x, rPosition.y, rPosition.z);

      let quaternion = new THREE.Quaternion(
        rQuaternion.x,
        rQuaternion.y,
        rQuaternion.z,
        rQuaternion.w
      );

      let wDir = new THREE.Vector3(1, 0, 0);
      wDir.applyQuaternion(quaternion);
      wDir.normalize();
      let cameraPosition = position.clone().add(wDir.clone().multiplyScalar(2));

      cameraPosition.y += 1;

      if (smoothedCamera.length() === 0) {
        smoothedCamera.copy(cameraPosition);
      } else {
        smoothedCamera.lerp(cameraPosition, t);
      }
      state.camera.position.copy(smoothedCamera);

      position.y += 0.5;
      state.camera.lookAt(position);

      return;
    }
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
  const bakedShadow = useTexture("/textures/simpleShadow.jpg");

  useEffect(() => {
    scene2.traverse((child) => {
      if (child.isMesh) {
        const originalColor = child.material.color.clone();

        originalColor.multiplyScalar(2.75);

        child.material = new THREE.MeshBasicMaterial({
          color: originalColor,
        });
      }
    });
  }, []);

  return (
    <>
      <RigidBody
        scale={0.8}
        position={spawn.position}
        rotation={spawn.rotation}
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
        <planeGeometry args={[3, 4]} />
        <meshBasicMaterial
          color={0x000000}
          transparent
          side={THREE.DoubleSide}
          alphaMap={bakedShadow}
          // visible={false}
        />
      </mesh>
    </>
  );
};
