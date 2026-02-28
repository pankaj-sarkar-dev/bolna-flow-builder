import React, { useCallback } from "react";
import {
  type Node as RFNode,
  type Edge as RFEdge,
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  Panel,
} from "@xyflow/react";
import { useRFContext } from "../../context/RFContext";
import type { NodeData, EdgeData, FlowNode } from "../../types";
import Button from "../Button";
import AddNodeModal from "../AddNodeModal";
import StyledEdge from "../StyledEdge";
import { toCanonical, toRFEdges, toRFNodes } from "../../utils/converter.utils";

const edgeTypes = {
  styled: StyledEdge,
};

const PlayGround = () => {
  const {
    rfNodes,
    rfEdges,
    selectedNode,
    showAddNode,
    showJson,
    onEdgesChange,
    onNodesChange,
    onConnect,
    setRfNodes,
    setRfEdges,
    setSelectedEdge,
    setSelectedNode,
    setShowAddNode,
    setShowJson,
  } = useRFContext();

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: RFNode<NodeData>) => {
      setSelectedEdge(null);
      setSelectedNode(node);
    },
    [],
  );

  const onEdgeClick = useCallback(
    (_: React.MouseEvent, edge: RFEdge<EdgeData>) => {
      setSelectedNode(null);
      setSelectedEdge(edge);
    },
    [],
  );

  const addNode = useCallback(
    ({
      id,
      type,
      prompt,
      description,
    }: Pick<FlowNode, "id" | "prompt" | "description"> & {
      type: NonNullable<FlowNode["_metadata"]>["type"];
    }) => {
      setRfNodes((ns) => [
        ...ns,
        {
          id,
          position: {
            x: 80 + Math.random() * 300,
            y: 80 + Math.random() * 300,
          },
          data: { label: prompt, description: description ?? "", type },
          type,
        },
      ]);
    },
    [setRfNodes],
  );

  const handleExport = () => {
    const data = toCanonical(rfNodes, rfEdges);
    const exportData = data.map(({ _metadata, ...n }) => n);
    const canonicalJson = JSON.stringify(exportData, null, 2);

    const blob = new Blob([canonicalJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "flow.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed: FlowNode[] = JSON.parse(ev.target?.result as string);
        setRfNodes(toRFNodes(parsed));
        setRfEdges(toRFEdges(parsed));
        setSelectedNode(null);
        setSelectedEdge(null);
      } catch {
        alert("Invalid JSON file");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="flex-1 relative bg-gray-100">
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onPaneClick={() => {
          setSelectedNode(null);
          setSelectedEdge(null);
        }}
        fitView
        edgeTypes={edgeTypes}
        defaultEdgeOptions={{ type: "styled" }}
      >
        <Background />
        <Controls />
        <MiniMap
          nodeColor={(n) => (n.id === selectedNode?.id ? "#F24A3A" : "")}
          nodeStrokeWidth={3}
          zoomable
          pannable
        />
      </ReactFlow>
      <Panel position="top-left">
        <div className="flex items-center gap-2.5">
          <span className="text-[11px] font-bold tracking-[0.25em] text-rose-400 uppercase mr-2">
            Flow Builder
          </span>
          <Button variant="primary" onClick={() => setShowAddNode(true)}>
            + Node
          </Button>
          <Button onClick={handleExport}>↓ Export</Button>
          <label className="border border-zinc-700/60 rounded-lg px-3 py-1.5 text-[11px] font-mono text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-all cursor-pointer">
            ↑ Import
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImport}
            />
          </label>
          <button
            onClick={() => setShowJson((v) => !v)}
            className={`border rounded-lg px-3 py-1.5 text-[11px] font-mono transition-all cursor-pointer ${
              showJson
                ? "border-rose-500/50 text-rose-400 bg-rose-500/5"
                : "border-zinc-700/60 text-zinc-500 hover:bg-zinc-800"
            }`}
          >
            {"{ }"} JSON
          </button>
        </div>
      </Panel>
      {showAddNode && (
        <AddNodeModal onAdd={addNode} onClose={() => setShowAddNode(false)} />
      )}
    </div>
  );
};

export default PlayGround;
