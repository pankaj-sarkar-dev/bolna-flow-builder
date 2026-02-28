interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
  disabled?: boolean;
  placeholder?: string;
  error?: string;
}

function SelectField({
  label,
  value,
  onChange,
  options,
  disabled = false,
  placeholder,
  error,
}: SelectFieldProps) {
  const base =
    "w-full bg-zinc-900 border border-zinc-700/60 rounded-lg px-2.5 py-1.5 text-[11px] font-mono text-zinc-300 outline-none focus:border-rose-500/60 transition-colors appearance-none";

  return (
    <div className="mt-3">
      <p className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase mb-1">
        {label}
      </p>

      <div className="relative">
        <select
          disabled={disabled}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={base}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}

          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Custom dropdown arrow */}
        <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-zinc-500 text-xs">
          ▾
        </div>
      </div>

      {error && (
        <p className="text-[10px] font-mono tracking-widest text-red-500 mb-1 mt-1">
          {error}
        </p>
      )}
    </div>
  );
}

export default SelectField;
