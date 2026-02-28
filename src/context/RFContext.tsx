import React, {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";
import {
  useEdgesState,
  useNodesState,
  type Node as RFNode,
  type Edge as RFEdge,
  type OnNodesChange,
  type OnEdgesChange,
  type Connection,
  addEdge,
} from "@xyflow/react";

import { toRFEdges, toRFNodes } from "../utils/converter.utils";
import type { EdgeData, NodeData } from "../types";
import { nanoid } from "nanoid";

// Define the shape of the context
interface RFContextType {
  rfNodes: RFNode<NodeData>[];
  rfEdges: RFEdge<EdgeData>[];
  selectedNode: RFNode<NodeData> | null;
  selectedEdge: RFEdge<EdgeData> | null;
  showAddNode: boolean;
  showJson: boolean;

  onConnect: (params: Connection) => void;
  setRfNodes: React.Dispatch<React.SetStateAction<RFNode<NodeData>[]>>;
  setRfEdges: React.Dispatch<React.SetStateAction<RFEdge<EdgeData>[]>>;
  onNodesChange: OnNodesChange<RFNode<NodeData>>;
  onEdgesChange: OnEdgesChange<RFEdge<EdgeData>>;
  setSelectedNode: React.Dispatch<
    React.SetStateAction<RFNode<NodeData> | null>
  >;
  setSelectedEdge: React.Dispatch<
    React.SetStateAction<RFEdge<EdgeData> | null>
  >;
  setShowAddNode: React.Dispatch<React.SetStateAction<boolean>>;
  setShowJson: React.Dispatch<React.SetStateAction<boolean>>;
}

const initialRFData: RFContextType = {
  rfNodes: [],
  rfEdges: [],
  selectedNode: null,
  selectedEdge: null,
  showAddNode: false,
  showJson: true,

  onConnect: () => {},
  setRfNodes: () => {},
  setRfEdges: () => {},
  onNodesChange: () => {},
  onEdgesChange: () => {},
  setSelectedNode: () => {},
  setSelectedEdge: () => {},
  setShowAddNode: () => {},
  setShowJson: () => {},
};

// Create the context
const RFContext = createContext<RFContextType>(initialRFData);

// Provider component to wrap the application
export const RFProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [rfNodes, setRfNodes, onNodesChange] = useNodesState(
    toRFNodes([
      {
        id: nanoid(),
        prompt: "start",
        edges: [],
        _metadata: {
          type: "input",
          position: { x: Math.random() * 400, y: Math.random() * 300 },
        },
        description: "",
      },
    ]),
  );
  const [rfEdges, setRfEdges, onEdgesChange] = useEdgesState(toRFEdges([])); //INITIAL_NODES

  const [selectedNode, setSelectedNode] = useState<RFNode<NodeData> | null>(
    null,
  );
  const [selectedEdge, setSelectedEdge] = useState<RFEdge<EdgeData> | null>(
    null,
  );
  const [showAddNode, setShowAddNode] = useState(false);
  const [showJson, setShowJson] = useState(true);

  const onConnect = useCallback(
    (params: Connection) =>
      setRfEdges((eds) =>
        addEdge(
          {
            ...params,
            animated: true,
          },
          eds,
        ),
      ),
    [setRfEdges],
  );

  return (
    <RFContext.Provider
      value={{
        rfNodes,
        rfEdges,
        selectedNode,
        selectedEdge,
        showAddNode,
        showJson,

        setRfNodes,
        setRfEdges,
        onNodesChange,
        onEdgesChange,
        setSelectedNode,
        setSelectedEdge,
        setShowAddNode,
        onConnect,
        setShowJson,
      }}
    >
      {children}
    </RFContext.Provider>
  );
};

// Custom hook to consume the context
export const useRFContext = () => {
  const context = useContext(RFContext);
  if (!context) {
    throw new Error("useRFContext must be used within a RFProvider");
  }
  return context;
};
