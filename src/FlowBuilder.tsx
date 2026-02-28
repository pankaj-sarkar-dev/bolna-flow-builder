import { useState, useCallback, useMemo, useRef, memo } from "react";
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  Panel,
  type NodeProps,
  type EdgeProps,
  type Connection,
  type Node as RFNode,
  type Edge as RFEdge,
  type OnConnect,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

// ─── Domain Types ─────────────────────────────────────────────────────────────

interface FlowEdge {
  to_node_id: string;
  condition: string;
  parameters?: Record<string, string>;
}

interface FlowNode {
  id: string;
  description?: string;
  prompt: string;
  edges: FlowEdge[];
  _metadata?: {
    position: { x: number; y: number };
  };
}

// ─── RF Node Data ─────────────────────────────────────────────────────────────

interface NodeData extends Record<string, unknown> {
  label: string;
  prompt: string;
  description?: string;
}

interface EdgeData extends Record<string, unknown> {
  condition: string;
  parameters: Record<string, string>;
}

// ─── Transforms ───────────────────────────────────────────────────────────────

function toRFNodes(flowNodes: FlowNode[]): RFNode<NodeData>[] {
  return flowNodes.map((n) => ({
    id: n.id,
    position: n._metadata?.position ?? {
      x: Math.random() * 400,
      y: Math.random() * 300,
    },
    data: { label: n.id, prompt: n.prompt, description: n.description ?? "" },
    type: "flowNode",
  }));
}

function toRFEdges(flowNodes: FlowNode[]): RFEdge<EdgeData>[] {
  return flowNodes.flatMap((n) =>
    n.edges.map((e) => ({
      id: `${n.id}→${e.to_node_id}`,
      source: n.id,
      target: e.to_node_id,
      label: e.condition || undefined,
      data: { condition: e.condition, parameters: e.parameters ?? {} },
      animated: true,
    })),
  );
}

function toCanonical(
  rfNodes: RFNode<NodeData>[],
  rfEdges: RFEdge<EdgeData>[],
): FlowNode[] {
  return rfNodes.map((rn) => ({
    id: rn.id,
    ...(rn.data.description ? { description: rn.data.description } : {}),
    prompt: rn.data.prompt,
    edges: rfEdges
      .filter((e) => e.source === rn.id)
      .map((e) => ({
        to_node_id: e.target,
        condition: e.data?.condition ?? "",
        ...(Object.keys(e.data?.parameters ?? {}).length > 0 && {
          parameters: e.data!.parameters,
        }),
      })),
    _metadata: { position: rn.position },
  }));
}

// ─── Seed Data ────────────────────────────────────────────────────────────────

const INITIAL_NODES: FlowNode[] = [
  {
    id: "start",
    prompt: "You are a helpful assistant. Greet the user warmly.",
    description: "Entry point",
    edges: [{ to_node_id: "classify", condition: "always" }],
    _metadata: { position: { x: 80, y: 100 } },
  },
  {
    id: "classify",
    prompt: "Classify user intent as: question, task, or chitchat.",
    edges: [
      { to_node_id: "answer", condition: "intent == question" },
      { to_node_id: "execute", condition: "intent == task" },
    ],
    _metadata: { position: { x: 360, y: 100 } },
  },
  {
    id: "answer",
    prompt: "Answer the user's question clearly and concisely.",
    edges: [],
    _metadata: { position: { x: 200, y: 310 } },
  },
  {
    id: "execute",
    prompt: "Execute the requested task step by step.",
    edges: [],
    _metadata: { position: { x: 540, y: 310 } },
  },
];

// ─── Custom Node Component ────────────────────────────────────────────────────
const FlowNodeComponent = memo(
  ({ data, selected }: { data: NodeData; selected: boolean }) => (
    <div
      className={`
      min-w-[160px] max-w-[220px] rounded-xl px-3.5 py-3 transition-all duration-150
      font-mono text-xs select-none
      ${
        selected
          ? "bg-zinc-900 border border-rose-500 shadow-[0_0_0_2px_rgba(244,63,94,0.2),0_8px_32px_rgba(0,0,0,0.5)]"
          : "bg-zinc-900/80 border border-zinc-700/60 shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
      }
    `}
    >
      <p className="text-[10px] font-bold tracking-widest text-rose-400 uppercase mb-1">
        {data.label}
      </p>
      {data.description && (
        <p className="text-[10px] text-zinc-500 mb-1.5">{data.description}</p>
      )}
      <p className="text-[10px] text-zinc-400 leading-relaxed line-clamp-2 opacity-80">
        {data.prompt}
      </p>
    </div>
  ),
);

FlowNodeComponent.displayName = "FlowNodeComponent";

const NODE_TYPES = { flowNode: FlowNodeComponent };

// ─── Reusable UI Primitives ───────────────────────────────────────────────────

interface LabeledInputProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  textarea?: boolean;
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  textarea,
}: LabeledInputProps) {
  const base =
    "w-full bg-zinc-900 border border-zinc-700/60 rounded-lg px-2.5 py-1.5 text-[11px] font-mono text-zinc-300 placeholder:text-zinc-600 outline-none focus:border-rose-500/60 transition-colors";
  return (
    <div className="mt-3">
      <p className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase mb-1">
        {label}
      </p>
      {textarea ? (
        <textarea
          className={`${base} resize-none h-20`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      ) : (
        <input
          className={base}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      )}
    </div>
  );
}

function PanelTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-bold tracking-[0.2em] text-rose-400 uppercase mb-1">
      {children}
    </p>
  );
}

interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "danger";
}

function Btn({
  variant = "ghost",
  className = "",
  children,
  ...props
}: BtnProps) {
  const styles = {
    primary: "bg-rose-500 hover:bg-rose-400 text-white border-transparent",
    ghost:
      "bg-transparent hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border-zinc-700/60",
    danger:
      "bg-transparent hover:bg-rose-500/10 text-rose-400 border-rose-500/40 hover:border-rose-500",
  };
  return (
    <button
      className={`border rounded-lg px-3 py-1.5 text-[11px] font-mono transition-all duration-150 cursor-pointer ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

// ─── Panels ───────────────────────────────────────────────────────────────────

interface NodePanelProps {
  node: RFNode<NodeData>;
  onUpdate: (id: string, data: Partial<NodeData>) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

function NodePanel({ node, onUpdate, onDelete, onClose }: NodePanelProps) {
  const [label, setLabel] = useState(node.data.label);
  const [prompt, setPrompt] = useState(node.data.prompt);
  const [description, setDescription] = useState(node.data.description ?? "");

  const save = () => {
    onUpdate(node.id, { label, prompt, description });
    onClose();
  };

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 w-72 shadow-2xl">
      <PanelTitle>Edit Node — {node.id}</PanelTitle>
      <Field label="ID / Label" value={label} onChange={setLabel} />
      <Field
        label="Description"
        value={description}
        onChange={setDescription}
        placeholder="optional"
      />
      <Field label="Prompt" value={prompt} onChange={setPrompt} textarea />
      <div className="flex gap-2 mt-4">
        <Btn variant="primary" onClick={save}>
          Save
        </Btn>
        <Btn
          variant="danger"
          onClick={() => {
            onDelete(node.id);
            onClose();
          }}
        >
          Delete
        </Btn>
        <Btn onClick={onClose}>Cancel</Btn>
      </div>
    </div>
  );
}

interface EdgePanelProps {
  edge: RFEdge<EdgeData>;
  onUpdate: (id: string, data: Partial<EdgeData>) => void;
  onClose: () => void;
}

type ParamPair = { k: string; v: string };

function EdgePanel({ edge, onUpdate, onClose }: EdgePanelProps) {
  const [condition, setCondition] = useState(edge.data?.condition ?? "");
  const [params, setParams] = useState<ParamPair[]>(
    Object.entries(edge.data?.parameters ?? {}).map(([k, v]) => ({ k, v })),
  );

  const save = () => {
    const parameters = Object.fromEntries(
      params.filter((p) => p.k.trim()).map((p) => [p.k, p.v]),
    );
    onUpdate(edge.id, {
      condition,
      parameters: Object.keys(parameters).length ? parameters : {},
    });
    onClose();
  };

  const updateParam = (i: number, field: "k" | "v", val: string) =>
    setParams((ps) => ps.map((p, j) => (j === i ? { ...p, [field]: val } : p)));

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 w-72 shadow-2xl">
      <PanelTitle>
        Edge: {edge.source} → {edge.target}
      </PanelTitle>
      <Field
        label="Condition"
        value={condition}
        onChange={setCondition}
        placeholder="e.g. intent == question"
      />
      <div className="mt-3">
        <p className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase mb-2">
          Parameters
        </p>
        {params.map((p, i) => (
          <div key={i} className="flex gap-1.5 mb-1.5">
            <input
              className="flex-1 bg-zinc-900 border border-zinc-700/60 rounded-lg px-2 py-1.5 text-[11px] font-mono text-zinc-300 placeholder:text-zinc-600 outline-none focus:border-rose-500/60"
              placeholder="key"
              value={p.k}
              onChange={(e) => updateParam(i, "k", e.target.value)}
            />
            <input
              className="flex-1 bg-zinc-900 border border-zinc-700/60 rounded-lg px-2 py-1.5 text-[11px] font-mono text-zinc-300 placeholder:text-zinc-600 outline-none focus:border-rose-500/60"
              placeholder="value"
              value={p.v}
              onChange={(e) => updateParam(i, "v", e.target.value)}
            />
            <button
              onClick={() => setParams((ps) => ps.filter((_, j) => j !== i))}
              className="text-zinc-600 hover:text-rose-400 text-xs px-1 transition-colors"
            >
              ✕
            </button>
          </div>
        ))}
        <button
          onClick={() => setParams((ps) => [...ps, { k: "", v: "" }])}
          className="text-[10px] font-mono text-zinc-500 hover:text-zinc-300 mt-1 transition-colors"
        >
          + add param
        </button>
      </div>
      <div className="flex gap-2 mt-4">
        <Btn variant="primary" onClick={save}>
          Save
        </Btn>
        <Btn onClick={onClose}>Cancel</Btn>
      </div>
    </div>
  );
}

// ─── Add Node Modal ───────────────────────────────────────────────────────────

interface AddNodeModalProps {
  onAdd: (node: Pick<FlowNode, "id" | "prompt" | "description">) => void;
  onClose: () => void;
}

function AddNodeModal({ onAdd, onClose }: AddNodeModalProps) {
  const [id, setId] = useState("");
  const [prompt, setPrompt] = useState("");
  const [description, setDescription] = useState("");

  const submit = () => {
    if (!id.trim() || !prompt.trim()) return;
    onAdd({ id: id.trim(), prompt, description });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 w-80 shadow-2xl">
        <PanelTitle>New Node</PanelTitle>
        <Field
          label="Node ID *"
          value={id}
          onChange={setId}
          placeholder="e.g. validate"
        />
        <Field
          label="Description"
          value={description}
          onChange={setDescription}
          placeholder="optional"
        />
        <Field label="Prompt *" value={prompt} onChange={setPrompt} textarea />
        <div className="flex gap-2 mt-4">
          <Btn variant="primary" onClick={submit}>
            Add Node
          </Btn>
          <Btn onClick={onClose}>Cancel</Btn>
        </div>
      </div>
    </div>
  );
}

// ─── JSON Syntax Highlight ────────────────────────────────────────────────────

function JsonHighlight({ json }: { json: string }) {
  const highlighted = useMemo(() => {
    return json
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(
        /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
        (match) => {
          if (/^"/.test(match)) {
            if (/:$/.test(match))
              return `<span style="color:#e2856e">${match}</span>`; // key
            return `<span style="color:#a3be8c">${match}</span>`; // string
          }
          if (/true|false/.test(match))
            return `<span style="color:#81a1c1">${match}</span>`;
          if (/null/.test(match))
            return `<span style="color:#bf616a">${match}</span>`;
          return `<span style="color:#b48ead">${match}</span>`; // number
        },
      );
  }, [json]);

  return (
    <pre
      className="text-[10.5px] leading-[1.75] font-mono text-zinc-500 whitespace-pre-wrap break-all p-4 flex-1 overflow-auto"
      dangerouslySetInnerHTML={{ __html: highlighted }}
    />
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [rfNodes, setRfNodes, onNodesChange] = useNodesState(
    toRFNodes(INITIAL_NODES),
  );
  const [rfEdges, setRfEdges, onEdgesChange] = useEdgesState(
    toRFEdges(INITIAL_NODES),
  );

  const [selectedNode, setSelectedNode] = useState<RFNode<NodeData> | null>(
    null,
  );
  const [selectedEdge, setSelectedEdge] = useState<RFEdge<EdgeData> | null>(
    null,
  );
  const [showAddNode, setShowAddNode] = useState(false);
  const [showJson, setShowJson] = useState(true);

  const importRef = useRef<HTMLInputElement>(null);

  // ── Canonical JSON: recomputed only when RF state changes
  const canonicalJson = useMemo(() => {
    const data = toCanonical(rfNodes, rfEdges);
    const exportData = data.map(({ _metadata, ...n }) => n);
    return JSON.stringify(exportData, null, 2);
  }, [rfNodes, rfEdges]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const onConnect: OnConnect = useCallback(
    (params: Connection) =>
      setRfEdges((eds) =>
        addEdge(
          {
            ...params,
            animated: true,
            data: { condition: "", parameters: {} },
          },
          eds,
        ),
      ),
    [setRfEdges],
  );

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

  const updateNode = useCallback(
    (id: string, data: Partial<NodeData>) => {
      setRfNodes((ns) =>
        ns.map((n) =>
          n.id === id ? { ...n, data: { ...n.data, ...data } } : n,
        ),
      );
    },
    [setRfNodes],
  );

  const deleteNode = useCallback(
    (id: string) => {
      setRfNodes((ns) => ns.filter((n) => n.id !== id));
      setRfEdges((es) => es.filter((e) => e.source !== id && e.target !== id));
    },
    [setRfNodes, setRfEdges],
  );

  const updateEdge = useCallback(
    (id: string, data: Partial<EdgeData>) => {
      setRfEdges((es) =>
        es.map((e) =>
          e.id === id
            ? {
                ...e,
                label: data.condition || undefined,
                data: {
                  condition: data.condition ?? "",
                  parameters: data.parameters ?? {},
                },
              }
            : e,
        ),
      );
    },
    [setRfEdges],
  );

  const addNode = useCallback(
    ({
      id,
      prompt,
      description,
    }: Pick<FlowNode, "id" | "prompt" | "description">) => {
      setRfNodes((ns) => [
        ...ns,
        {
          id,
          position: {
            x: 80 + Math.random() * 300,
            y: 80 + Math.random() * 300,
          },
          data: { label: id, prompt, description: description ?? "" },
          type: "flowNode",
        },
      ]);
    },
    [setRfNodes],
  );

  const handleExport = () => {
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
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap');
        * { font-family: 'JetBrains Mono', monospace; }
        .react-flow__edge-path { stroke: rgba(244,63,94,0.5) !important; stroke-width: 1.5 !important; }
        .react-flow__edge.selected .react-flow__edge-path { stroke: rgb(244,63,94) !important; }
        .react-flow__edge-label { font-family: 'JetBrains Mono', monospace !important; font-size: 10px !important; }
        .react-flow__edge-textbg { fill: #09090b !important; }
        .react-flow__edge-text { fill: #f43f5e !important; }
        .react-flow__controls { background: #09090b !important; border: 1px solid #27272a !important; border-radius: 10px !important; overflow: hidden; }
        .react-flow__controls-button { background: #09090b !important; border-color: #27272a !important; fill: #71717a !important; }
        .react-flow__controls-button:hover { background: #18181b !important; fill: #e4e4e7 !important; }
        .react-flow__minimap { background: #09090b !important; border: 1px solid #27272a !important; border-radius: 10px !important; }
        .react-flow__minimap-mask { fill: rgba(9,9,11,0.7) !important; }
        .react-flow__attribution { display: none; }
        ::-webkit-scrollbar { width: 3px; height: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #27272a; border-radius: 2px; }
      `}</style>

      <div className="flex w-screen h-screen bg-zinc-950 overflow-hidden">
        {/* ── Canvas ── */}
        <div className="flex-1 relative">
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
            // nodeTypes={NODE_TYPES}
            fitView
            style={{ background: "#09090b" }}
          >
            <Background
              variant={BackgroundVariant.Dots}
              color="#27272a"
              gap={22}
              size={1}
            />
            <Controls />
            <MiniMap nodeColor="#f43f5e" maskColor="rgba(9,9,11,0.75)" />

            {/* ── Toolbar ── */}
            <Panel position="top-left">
              <div className="flex items-center gap-2.5">
                <span className="text-[11px] font-bold tracking-[0.25em] text-rose-400 uppercase mr-2">
                  Flow Builder
                </span>
                <Btn variant="primary" onClick={() => setShowAddNode(true)}>
                  + Node
                </Btn>
                <Btn onClick={handleExport}>↓ Export</Btn>
                <label className="border border-zinc-700/60 rounded-lg px-3 py-1.5 text-[11px] font-mono text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-all cursor-pointer">
                  ↑ Import
                  <input
                    ref={importRef}
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

            {/* ── Node panel ── */}
            {selectedNode && (
              <Panel position="top-right">
                <NodePanel
                  node={selectedNode}
                  onUpdate={updateNode}
                  onDelete={deleteNode}
                  onClose={() => setSelectedNode(null)}
                />
              </Panel>
            )}

            {/* ── Edge panel ── */}
            {selectedEdge && !selectedNode && (
              <Panel position="top-right">
                <EdgePanel
                  edge={selectedEdge}
                  onUpdate={updateEdge}
                  onClose={() => setSelectedEdge(null)}
                />
              </Panel>
            )}
          </ReactFlow>
        </div>

        {/* ── Live JSON ── */}
        {showJson && (
          <div className="w-[340px] bg-zinc-950 border-l border-zinc-800/60 flex flex-col overflow-hidden">
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
        )}
      </div>

      {showAddNode && (
        <AddNodeModal onAdd={addNode} onClose={() => setShowAddNode(false)} />
      )}
    </>
  );
}
