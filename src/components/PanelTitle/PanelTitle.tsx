const PanelTitle = ({ children }: { children: React.ReactNode }) => {
  return (
    <p className="text-[10px] font-bold tracking-[0.2em] text-rose-400 uppercase mb-1">
      {children}
    </p>
  );
};

export default PanelTitle;
