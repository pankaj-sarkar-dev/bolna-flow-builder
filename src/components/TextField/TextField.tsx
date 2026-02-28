interface LabeledInputProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  textarea?: boolean;
  disabled?: boolean;
  error?: string;
}

function TextField({
  label,
  value,
  disabled = false,
  onChange,
  placeholder,
  textarea,
  error,
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
          disabled={disabled}
          className={`${base} resize-none h-20`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      ) : (
        <input
          disabled={disabled}
          className={base}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      )}
      {error && (
        <p className="text-[10px] font-mono tracking-widest text-red-500 mb-1 mt-1">
          {error}
        </p>
      )}
    </div>
  );
}

export default TextField;
