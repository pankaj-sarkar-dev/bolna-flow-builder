import { useMemo } from "react";
import { useRFContext } from "../../context/RFContext";
import JsonHighlight from "./JsonHilight";
import { toCanonical } from "../../utils/converter.utils";

const JsonViewer = () => {
  const { showJson, rfNodes, rfEdges } = useRFContext();

  const canonicalJson = useMemo(() => {
    const data = toCanonical(rfNodes, rfEdges);
    const exportData = data.map(({ _metadata, ...n }) => n);
    return JSON.stringify(exportData, null, 2);
  }, [rfNodes, rfEdges]);

  if (!showJson) return;
  return (
    <div className="w-85 bg-zinc-800 border-l border-zinc-800/60 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-800/60 shrink-0">
        <span className="text-[10px] font-bold tracking-[0.2em] text-rose-400 uppercase">
          Live JSON
        </span>
        <span className="text-[10px] font-mono text-zinc-600">
          {rfNodes.length} nodes · {rfEdges.length} edges
        </span>
      </div>
      <div className="flex-1 overflow-auto">
        <JsonHighlight json={canonicalJson} />
      </div>
    </div>
  );
};

export default JsonViewer;
