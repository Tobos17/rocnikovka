import { useAfterPhysicsStep, useRapier } from "@react-three/rapier";
import { useEffect, useRef } from "react";
import * as THREE from "three";

const up = new THREE.Vector3(0, 1, 0);

const _wheelSteeringQuat = new THREE.Quaternion();
const _wheelRotationQuat = new THREE.Quaternion();

export const useVehicleController = (chassisRef, wheelsRef, wheelsInfo) => {
  const { world } = useRapier();

  const vehicleController = useRef();

  useEffect(() => {
    const { current: chassis } = chassisRef;
    const { current: wheels } = wheelsRef;

    if (!chassis || !wheels) return;

    const vehicle = world.createVehicleController(chassis);

    const suspensionDirection = new THREE.Vector3(0, -1, 0);

    wheelsInfo.forEach((wheel) => {
      vehicle.addWheel(
        wheel.position,
        suspensionDirection,
        wheel.axleCs,
        wheel.suspensionRestLength,
        wheel.radius
      );
    });

    wheelsInfo.forEach((wheel, index) => {
      vehicle.setWheelSuspensionStiffness(index, wheel.suspensionStiffness);
      vehicle.setWheelMaxSuspensionTravel(index, wheel.maxSuspensionTravel);
    });

    vehicleController.current = vehicle;

    return () => {
      vehicleController.current = undefined;
      world.removeVehicleController(vehicle);
    };
  }, []);

  useAfterPhysicsStep((world) => {
    if (!vehicleController.current) return;

    const controller = vehicleController.current;

    controller.updateVehicle(world.timestep);

    const { current: wheels } = wheelsRef;

    wheels?.forEach((wheel, index) => {
      const wheelAxleCs = controller.wheelAxleCs(index);
      const connection = controller.wheelChassisConnectionPointCs(index).y;
      const suspension = controller.wheelSuspensionLength(index);
      const steering = controller.wheelSteering(index);
      const rotationRad = controller.wheelRotation(index);

      wheel.position.y = connection - suspension;

      _wheelSteeringQuat.setFromAxisAngle(up, steering);
      _wheelRotationQuat.setFromAxisAngle(wheelAxleCs, rotationRad);

      wheel.quaternion.multiplyQuaternions(
        _wheelSteeringQuat,
        _wheelRotationQuat
      );
    });
  });

  return {
    vehicleController,
  };
};
