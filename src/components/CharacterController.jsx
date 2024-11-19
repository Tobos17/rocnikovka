import { CapsuleCollider, RigidBody } from "@react-three/rapier";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useControls } from "leva";
import { OrbitControls, useKeyboardControls } from "@react-three/drei";
import { degToRad } from "three/src/math/MathUtils.js";
import Character from "./Character";

const normalizeAngle = (angle) => {
  while (angle > Math.PI) angle -= Math.PI * 2;
  while (angle < -Math.PI) angle += Math.PI * 2;

  return angle;
};

const lerpAngle = (start, end, t) => {
  start = normalizeAngle(start);
  end = normalizeAngle(end);

  if (Math.abs(end - start) > Math.PI) {
    if (end > start) {
      start += Math.PI * 2;
    } else {
      end += Math.PI * 2;
    }
  }

  return normalizeAngle(start + (end - start) * t);
};

export const CharacterController = () => {
  const { WALK_SPEED, RUN_SPEED, ROTATION_SPEED } = useControls(
    "Character Control",
    {
      WALK_SPEED: { value: 2, min: 0.1, max: 4, step: 0.1 },
      RUN_SPEED: { value: 3, min: 0.2, max: 12, step: 0.1 },
      ROTATION_SPEED: {
        value: degToRad(1),
        min: degToRad(0.1),
        max: degToRad(5),
        step: degToRad(0.1),
      },
    }
  );

  const rb = useRef();
  const container = useRef();
  const character = useRef();

  const [animation, setAnimation] = useState("idle");

  const rotationTarget = useRef(0);
  const characterRotationTarget = useRef(0);
  const cameraTarget = useRef();
  const cameraPosition = useRef();
  const cameraWorldPosition = useRef(new THREE.Vector3());
  const cameraLookAtWorldPosition = useRef(new THREE.Vector3());
  const cameraLookAt = useRef(new THREE.Vector3());
  const [_, get] = useKeyboardControls();
  const isClicking = useRef(false);

  useEffect(() => {
    const onMouseDown = (e) => {
      isClicking.current = true;
    };

    const onMouseUp = (e) => {
      isClicking.current = false;
    };

    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mouseup", onMouseUp);

    document.addEventListener("touchstart", onMouseDown);
    document.addEventListener("touchend", onMouseUp);

    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("mouseup", onMouseUp);
      document.addEventListener("touchstart", onMouseDown);
      document.addEventListener("touchend", onMouseUp);
    };
  }, []);

  const [smoothCameraPosition] = useState(() => new THREE.Vector3(0, 0, 0));
  const [smoothCameraTarget] = useState(() => new THREE.Vector3());

  useFrame((state, delta) => {
    if (rb.current) {
      const vel = rb.current.linvel();

      const movement = {
        x: 0,
        z: 0,
      };

      if (get().forward) {
        movement.z = 1;
      }

      if (get().backward) {
        movement.z = -1;
      }

      if (get().leftward) {
        movement.x = 1;
      }

      if (get().rightward) {
        movement.x = -1;
      }

      let speed = get().run ? RUN_SPEED : WALK_SPEED;

      // if (movement.x !== 0) {
      //   rotationTarget.current += ROTATION_SPEED * movement.x;
      // }

      if (movement.z !== 0) {
        // Adjust the rotation target based on steering input (movement.x)
        rotationTarget.current += ROTATION_SPEED * movement.x;

        // Calculate the forward direction based on the rotation target
        const forwardDirection = new THREE.Vector3(
          Math.sin(rotationTarget.current),
          0,
          Math.cos(rotationTarget.current)
        );

        // Set velocity in the forward direction
        vel.x = forwardDirection.x * movement.z * speed;
        vel.z = forwardDirection.z * movement.z * speed;

        container.current.rotation.y = THREE.MathUtils.lerp(
          rotationTarget.current,
          rotationTarget.current + ROTATION_SPEED * movement.x,
          0.1 // Smoothing factor
        );
      }

      rb.current.setLinvel(vel, true);
    }

    const camera = state.camera;

    // cameraPosition.current.getWorldPosition(cameraWorldPosition.current);
    // camera.position.lerp(cameraWorldPosition.current, 0.1);

    // if (cameraTarget.current) {
    //   cameraTarget.current.getWorldPosition(cameraLookAtWorldPosition.current);
    //   cameraLookAt.current.lerp(cameraLookAtWorldPosition.current, 0.1);

    //   camera.lookAt(cameraLookAt.current);
    // }

    const cameraPosition = new THREE.Vector3();
    cameraPosition.copy(rb.current.translation());
    cameraPosition.z += 10;
    cameraPosition.y += 10;
    cameraPosition.x += 10;

    const cameraTarget = new THREE.Vector3();
    cameraTarget.copy(rb.current.translation());
    cameraTarget.y += 0.25;

    smoothCameraPosition.lerp(cameraPosition, 5 * delta); //10% to the camera pos
    smoothCameraTarget.lerp(cameraTarget, 5 * delta);

    // state.camera.position.copy(smoothCameraPosition);
    // state.camera.lookAt(smoothCameraTarget);
  });

  const fow = useRef();

  return (
    <RigidBody colliders={false} lockRotations ref={rb}>
      <group ref={container}>
        <group ref={cameraTarget} position-z={1.5} />

        <group ref={cameraPosition} position-y={4} position-z={-4} />

        <group ref={character}>
          <Character
            scale={1}
            ref={fow}
            position={[0, -1, 0]}
            model={`models/Buggy.glb`}
          />
        </group>
      </group>
      <CapsuleCollider args={[0.01, 1]} />
    </RigidBody>
  );
};
