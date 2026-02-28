export interface FlowEdge {
  to_node_id: string;
  condition: string;
  parameters?: Record<string, string>;
}

export interface FlowNode {
  id: string;
  prompt: string;
  description?: string;
  edges: FlowEdge[];
  _metadata?: {
    type: string;
    position: { x: number; y: number };
  };
}

export interface NodeData extends Record<string, unknown> {
  label: string;
  description?: string;
}

export interface EdgeData extends Record<string, unknown> {
  condition: string;
  parameters: Record<string, string>;
}
