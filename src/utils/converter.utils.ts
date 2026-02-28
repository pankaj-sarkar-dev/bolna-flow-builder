import { type Node as RFNode, type Edge as RFEdge } from "@xyflow/react";
import { type EdgeData, type FlowNode, type NodeData } from "../types";

export function toRFNodes(flowNodes: FlowNode[]): RFNode<NodeData>[] {
  return flowNodes.map((n) => ({
    id: n.id,
    position: n._metadata?.position ?? {
      x: Math.random() * 400,
      y: Math.random() * 300,
    },
    data: {
      label: n?.prompt ?? "",
      description: n.description ?? "",
    },
    type: n?._metadata?.type ?? "default",
  }));
}

export function toRFEdges(flowNodes: FlowNode[]): RFEdge<EdgeData>[] {
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

export function toCanonical(
  rfNodes: RFNode<NodeData>[],
  rfEdges: RFEdge<EdgeData>[],
): FlowNode[] {
  return rfNodes.map((rn) => ({
    id: rn.id,
    ...(rn.data.description ? { description: rn.data.description } : {}),
    prompt: rn?.data?.label ?? "",
    edges: rfEdges
      .filter((e) => e.source === rn.id)
      .map((e) => ({
        to_node_id: e.target,
        condition: (e.label as string) ?? "",
        ...(Object.keys(e.data?.parameters ?? {}).length > 0 && {
          parameters: e.data!.parameters,
        }),
      })),
    _metadata: { position: rn.position, type: rn?.type ?? "default" },
  }));
}
