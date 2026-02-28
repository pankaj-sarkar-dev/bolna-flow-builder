import { useCallback, useEffect, useMemo } from "react";
import { useRFContext } from "../../context/RFContext";
import TextField from "../TextField";
import Button from "../Button";
import SelectField from "../SelectField";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import {
  type EdgeFormValues,
  edgeSchema,
} from "../../validator/editEdge.validator";

const EdgePanel = () => {
  const {
    selectedEdge: edge,
    rfNodes,
    rfEdges,
    setRfEdges,
    setSelectedEdge,
  } = useRFContext();

  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<EdgeFormValues>({
    resolver: zodResolver(edgeSchema),
    defaultValues: {
      id: edge?.id || "",
      label: (edge?.label as string) || "",
      source: edge?.source || "",
      target: edge?.target || "",
    },
  });

  const availableSources = useMemo(
    () =>
      rfNodes
        .filter((item) => edge?.target !== item.id)
        .map((item) => ({
          label: `${item.data.label} - ${item.id}`,
          value: item.id,
        })),
    [rfEdges, edge],
  );

  const availableTargets = useMemo(
    () =>
      rfNodes
        .filter((item) => edge?.source !== item.id)
        .map((item) => ({
          label: `${item.data.label} - ${item.id}`,
          value: item.id,
        })),
    [rfEdges, edge],
  );

  const onClose = () => {
    setSelectedEdge(null);
  };

  const updateEdge = useCallback(
    ({ id, label, source, target }: EdgeFormValues) => {
      setRfEdges((es) => {
        const edge = es.find((e) => e.id === id);
        if (!edge) return es;

        const updatedEdge = {
          ...edge,
          source: source || edge.source,
          target: target || edge.target,
          label: label || edge.label || "",
        };

        setSelectedEdge(updatedEdge);

        onClose();
        return es.map((e) => (e.id === id ? updatedEdge : e));
      });
    },
    [setRfEdges, edge],
  );

  const save = ({ id, label, source, target }: EdgeFormValues) => {
    if (!edge) return;
    updateEdge({ id, label, source, target });
  };

  const deleteEdge = useCallback(() => {
    if (!edge) return;
    setRfEdges((es) => es.filter((e) => e.id !== edge.id));
    onClose();
  }, [setRfEdges, edge]);

  useEffect(() => {
    if (!edge) return;
    setValue("id", edge.id);
    setValue("label", (edge.label as string) || "");
    setValue("source", edge.source);
    setValue("target", edge.target);
  }, [edge]);

  if (!edge) return;

  return (
    <div className="w-85 bg-zinc-800 border-l border-zinc-800/60 flex flex-col overflow-hidden p-4">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-800/60 shrink-0">
        <span className="text-[10px] font-bold tracking-[0.2em] text-rose-400 uppercase">
          Edit Edge : <br />
        </span>
      </div>
      <div className="flex-1 overflow-auto">
        <Controller
          control={control}
          name="id"
          render={({ field }) => (
            <TextField
              label="ID *"
              disabled
              value={field.value}
              onChange={(val) => field.onChange(val)}
              error={errors?.id?.message || ""}
            />
          )}
        />
        <Controller
          control={control}
          name="label"
          render={({ field }) => (
            <TextField
              label="Condition *"
              placeholder="condition"
              value={field.value}
              onChange={(val) => field.onChange(val)}
              error={errors?.label?.message || ""}
            />
          )}
        />
        <Controller
          control={control}
          name="source"
          render={({ field }) => (
            <SelectField
              label="Source *"
              options={availableSources}
              placeholder="select source"
              value={field.value}
              onChange={(val) => field.onChange(val)}
              error={errors?.source?.message || ""}
            />
          )}
        />
        <Controller
          control={control}
          name="target"
          render={({ field }) => (
            <SelectField
              label="Target *"
              options={availableTargets}
              placeholder="select target"
              value={field.value}
              onChange={(val) => field.onChange(val)}
              error={errors?.target?.message || ""}
            />
          )}
        />

        <div className="flex gap-2 mt-4">
          <Button variant="primary" onClick={handleSubmit(save)}>
            Save
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              deleteEdge();
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

export default EdgePanel;
