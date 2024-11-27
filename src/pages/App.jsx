import { Sketch } from "../components/Sketch";
import { Overlay } from "../components/Overlay";

function App() {
  return (
    <div className="h-full w-full flex flex-col">
      <div className="h-screen w-screen fixed">
        <Sketch />
      </div>

      <Overlay />
    </div>
  );
}

export default App;
