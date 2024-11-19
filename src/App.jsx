import { Canvas } from "@react-three/fiber";
import { Experience } from "./components/Experience";
import { KeyboardControls } from "@react-three/drei";
import { Sketch } from "./components/sketch";

const keyboardMap = [
  { name: "forward", keys: ["KeyW", "ArrowUp"] },
  { name: "backward", keys: ["KeyS", "ArrowDown"] },
  { name: "leftward", keys: ["KeyA", "ArrowLeft"] },
  { name: "rightward", keys: ["KeyD", "ArrowRight"] },
  { name: "space", keys: ["Space"] },
];

function App() {
  return (
    <KeyboardControls map={keyboardMap}>
      {/* <Canvas
        dpr={[1, 2]}
        camera={{ position: [3, 3, 3], near: 0.1, far: 20, fov: 35 }}
      > */}
      {/* <color attach="background" args={["#ececec"]} /> */}
      {/* <Experience /> */}
      <Sketch />
      {/* </Canvas> */}
    </KeyboardControls>
  );
}

export default App;
