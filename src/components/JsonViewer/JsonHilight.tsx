import { useMemo } from "react";

const JsonHighlight = ({ json }: { json: string }) => {
  const highlighted = useMemo(() => {
    return json
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(
        /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
        (match) => {
          if (/^"/.test(match)) {
            if (/:$/.test(match))
              return `<span style="color:#e2856e">${match}</span>`; // key
            return `<span style="color:#a3be8c">${match}</span>`; // string
          }
          if (/true|false/.test(match))
            return `<span style="color:#81a1c1">${match}</span>`;
          if (/null/.test(match))
            return `<span style="color:#bf616a">${match}</span>`;
          return `<span style="color:#b48ead">${match}</span>`; // number
        },
      );
  }, [json]);

  return (
    <pre
      className="text-[10.5px] leading-[1.75] font-mono text-zinc-500 whitespace-pre-wrap break-all p-4 flex-1 overflow-auto"
      dangerouslySetInnerHTML={{ __html: highlighted }}
    />
  );
};

export default JsonHighlight;
