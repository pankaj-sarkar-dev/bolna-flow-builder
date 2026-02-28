interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "danger";
}

function Button({
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

export default Button;
