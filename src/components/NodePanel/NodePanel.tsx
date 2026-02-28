import { useCallback, useEffect, useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import type { NodeData } from "../../types";
import TextField from "../TextField";
import Button from "../Button";
import { useRFContext } from "../../context/RFContext";
import SelectField from "../SelectField";
import {
  type NodeFormValues,
  nodeSchema,
} from "../../validator/addNode.validator";

const NodePanel = () => {
  const {
    selectedNode: node,
    rfNodes,
    rfEdges,
    onConnect,
    setRfNodes,
    setRfEdges,
    setSelectedNode,
  } = useRFContext();

  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<NodeFormValues>({
    resolver: zodResolver(nodeSchema),
    defaultValues: {
      id: node?.id || "",
      type: node?.type || "default",
      prompt: node?.data?.label || "",
      description: node?.data?.description || "",
    },
  });

  const nodeMap = useMemo(
    () => new Map(rfNodes.map((n) => [n.id, n])),
    [rfNodes],
  );

  const edges = useMemo(() => {
    if (!node) return [];
    const filteredEdges = rfEdges.filter((item) => item.source === node.id);
    const enrichedEdges = filteredEdges.map((edge) => {
      const targetNode = nodeMap.get(edge.target);

      return {
        ...edge,
        targetNodeData: targetNode?.data ?? null,
      };
    });
    return enrichedEdges;
  }, [node, rfEdges]);

  const targetIds = useMemo(() => {
    return new Set(edges.map((e) => e.target));
  }, [edges]);

  const availableNodes = useMemo(
    () =>
      rfNodes
        .filter((item) => node?.id !== item.id && !targetIds.has(item.id))
        .map((item) => ({
          label: `${item.data.label} - ${item.id}`,
          value: item.id,
        })),
    [targetIds],
  );

  const updateNode = useCallback(
    (id: string, data: Partial<NodeData>) => {
      setRfNodes((ns) =>
        ns.map((n) =>
          n.id === id ? { ...n, data: { ...n.data, ...data } } : n,
        ),
      );
      onClose();
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

  const addEdge = (id: string) => {
    if (!node) return;
    onConnect({
      source: node.id,
      target: id,
      sourceHandle: null,
      targetHandle: null,
    });
  };

  const deleteEdge = useCallback(
    (id: string) => {
      setRfEdges((es) => es.filter((e) => e.id !== id));
    },
    [setRfNodes, setRfEdges],
  );

  const onClose = () => {
    setSelectedNode(null);
  };

  const save = ({ id, prompt, type, description }: NodeFormValues) => {
    if (!id) return;
    updateNode(id, { label: prompt, type, description });
  };

  useEffect(() => {
    if (node) {
      setValue("id", node?.id ?? "");
      setValue("prompt", node?.data?.label ?? "");
      setValue("description", node?.data?.description ?? "");
      setValue("type", node.type ?? "default");
    }
  }, [node]);

  if (!node) return;

  return (
    <div className="w-85 bg-zinc-800 border-l border-zinc-800/60 flex flex-col overflow-hidden p-4">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-800/60 shrink-0">
        <span className="text-[10px] font-bold tracking-[0.2em] text-rose-400 uppercase">
          Edit Node : <br />
          {node.id}
        </span>
      </div>
      <div className="flex-1 overflow-auto">
        <Controller
          control={control}
          name="id"
          render={({ field }) => (
            <TextField
              label="ID *"
              placeholder="id"
              disabled
              value={field.value}
              onChange={(val) => field.onChange(val)}
              error={errors?.id?.message || ""}
            />
          )}
        />
        <Controller
          control={control}
          name="type"
          render={({ field }) => (
            <SelectField
              label="Node Type *"
              options={[
                { label: "Default", value: "default" },
                { label: "Input", value: "input" },
                { label: "Output", value: "output" },
              ]}
              placeholder="select node type"
              value={field.value}
              onChange={(val) => field.onChange(val)}
              error={errors?.type?.message || ""}
            />
          )}
        />
        <Controller
          control={control}
          name="prompt"
          render={({ field }) => (
            <TextField
              label="Prompt *"
              placeholder="promt"
              value={field.value}
              onChange={(val) => field.onChange(val)}
              error={errors?.prompt?.message || ""}
            />
          )}
        />

        <Controller
          control={control}
          name="description"
          render={({ field }) => (
            <TextField
              label="Description"
              placeholder="description (optional)"
              value={field?.value || ""}
              onChange={(val) => field.onChange(val)}
              error={errors?.description?.message || ""}
            />
          )}
        />

        {/* Add new edge */}
        <SelectField
          label="Add new edge"
          options={availableNodes}
          placeholder="select edge"
          value={""}
          onChange={addEdge}
        />

        {/* Connected edges */}
        <p className="mt-3 text-[10px] font-mono tracking-widest text-zinc-500 uppercase mb-1">
          Edges - {edges.length}
        </p>
        {edges.map((edge) => (
          <div
            key={edge.id}
            className="w-full flex justify-between items-center bg-zinc-900 border border-zinc-700/60 rounded-lg px-2.5 py-1.5 text-[11px] font-mono text-zinc-300 my-2"
          >
            {edge?.targetNodeData?.label || ""} - {edge.target}
            <Button variant="danger" onClick={() => deleteEdge(edge.id)}>
              Delete
            </Button>
          </div>
        ))}

        <div className="flex gap-2 mt-4">
          <Button variant="primary" onClick={handleSubmit(save)}>
            Save
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              deleteNode(node.id);
              onClose();
            }}
          >
            Delete
          </Button>
          <Button onClick={onClose}>Cancel</Button>
        </div>
      </div>
    </div>
  );
};

export default NodePanel;
