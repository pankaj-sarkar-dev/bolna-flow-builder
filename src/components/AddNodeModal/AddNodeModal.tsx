import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import type { FlowNode } from "../../types";
import TextField from "../TextField";
import Button from "../Button";
import { nanoid } from "nanoid";
import SelectField from "../SelectField";
import PanelTitle from "../PanelTitle";
import {
  nodeSchema,
  type NodeFormValues,
} from "../../validator/addNode.validator";

interface AddNodeModalProps {
  onAdd: (
    node: Pick<FlowNode, "id" | "prompt" | "description"> & {
      type: NonNullable<FlowNode["_metadata"]>["type"];
    },
  ) => void;
  onClose: () => void;
}

function AddNodeModal({ onAdd, onClose }: AddNodeModalProps) {
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<NodeFormValues>({
    resolver: zodResolver(nodeSchema),
    defaultValues: {
      id: nanoid(),
      type: "default",
      prompt: "",
      description: "",
    },
  });

  const submit = ({ id, type, prompt, description }: NodeFormValues) => {
    if (!id.trim() || !prompt.trim()) return;
    onAdd({ id: id.trim(), type, prompt: prompt.trim(), description });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 w-80 shadow-2xl">
        <PanelTitle>New Node</PanelTitle>
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

        <div className="flex gap-2 mt-4">
          <Button variant="primary" onClick={handleSubmit(submit)}>
            Add Node
          </Button>
          <Button onClick={onClose}>Cancel</Button>
        </div>
      </div>
    </div>
  );
}

export default AddNodeModal;
