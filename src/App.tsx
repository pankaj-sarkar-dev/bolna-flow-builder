import "@xyflow/react/dist/style.css";

import NodePanel from "./components/NodePanel";
import { useRFContext } from "./context/RFContext";
import PlayGround from "./components/PlayGround";
import JsonViewer from "./components/JsonViewer/JsonViewer";
import EdgePanel from "./components/EdgePanel";

function App() {
  const {} = useRFContext();

  return (
    <>
      <div
        style={{ height: "100vh", width: "100vw" }}
        // className="grid grid-cols-[300px_1fr_350px]"
        className="flex w-screen h-screen bg-zinc-950 overflow-hidden"
      >
        {/* Sidebar */}
        <NodePanel />
        <EdgePanel />

        {/* Canvas */}
        <PlayGround />

        {/* JSON Preview Placeholder */}
        <JsonViewer />
        {/* <div className="border-l bg-white p-4">JSON Preview Coming Soon</div> */}
      </div>
    </>
  );
}

export default App;
