import { useGLTF, useTexture, Text } from "@react-three/drei";
import * as THREE from "three";

const TextPlane = () => {
  const alphaText = useTexture("/textures/alphaText1.webp");
  const alphaText2 = useTexture("/textures/alphaText2.webp");
  const alphaText3 = useTexture("/textures/alphaText3.webp");

  alphaText.colorSpace = THREE.SRGBColorSpace;
  alphaText.anisotropy = 16;

  alphaText2.colorSpace = THREE.SRGBColorSpace;
  alphaText2.anisotropy = 16;

  alphaText3.colorSpace = THREE.SRGBColorSpace;
  alphaText3.anisotropy = 16;

  const position = [2, 3.1, 0];
  const position2 = [14, 1.15, -11.5];
  const position3 = [-2, 1.75, -4.75];

  return (
    <>
      <mesh
        position={position}
        rotation-x={-Math.PI / 2}
        rotation-z={Math.PI / 3.35}
      >
        <planeGeometry args={[5, 4]} />
        <meshStandardMaterial
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

const Table = ({ results }) => {
  const { scene: table } = useGLTF("/models/table.glb");

  const targetChild = table.children[2];

  const position = targetChild.position;
  const rotation = targetChild.rotation;
  return (
    <>
      <group scale={1.2}>
        <primitive object={table} dispose={null} />

        <group
          position={[position.x, position.y + 1.25, position.z - 0.05]}
          rotation={[rotation.x, rotation.y - Math.PI / 2, rotation.z]}
        >
          <Text
            fontSize={0.275}
            position={[0, 0.1, 0]}
            font="/BebasNeue-Regular.ttf"
            material={
              new THREE.MeshStandardMaterial({
                emissive: 0xf1cc6c,
                emissiveIntensity: 0.5,
              })
            }
            anchorX="center"
            anchorY="middle"
          >
            Top 3 skoky
          </Text>
          {results
            .sort((a, b) => b - a)
            .slice(0, 3)
            .map((res, index) => (
              <Text
                key={index}
                position={[0, -0.3 * (index + 0.6), 0]}
                fontSize={0.25}
                font="/BebasNeue-Regular.ttf"
                material={
                  new THREE.MeshStandardMaterial({
                    emissive: 0xf1cc6c,
                    emissiveIntensity: 0.5,
                  })
                }
                anchorX="center"
                anchorY="middle"
              >
                {res.toFixed(2)} cm
              </Text>
            ))}
        </group>
      </group>
    </>
  );
};

export const GameProps = ({ results }) => {
  return (
    <>
      <TextPlane />
      <Table results={results} />
    </>
  );
};
