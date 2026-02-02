import { BlockMath, InlineMath } from "react-katex";

interface Props {
  text: string;
  textClass?: string;
  inlineMathClass?: string;
  blockMathClass?: string;
}

const RenderMixedContent = ({
  text,
  textClass = "text-slate-600",
  inlineMathClass = "",
  blockMathClass = "",
}: Props) => {
  if (!text) return null;

  // [[...]] → BlockMath
  // $...$   → InlineMath
  const parts = text.split(/(\[\[.*?\]\]|\$.*?\$)/g);
const sanitizeInlineMath = (latex: string) => {
  return latex
    .replace(/\\displaylines\s*\{?/g, "") // \displaylines yoki \displaylines{
    .replace(/\}/g, "");                  // yopuvchi } bo‘lsa olib tashlaydi
};
  return (
    <div className="whitespace-normal break-words leading-relaxed">
      {parts.map((part, i) => {
        // BLOCK MATH
        if (part.startsWith("[[") && part.endsWith("]]")) {
          return (
            <div key={i} className={blockMathClass}>
              <BlockMath math={part.slice(2, -2)} />
            </div>
          );
        }

        // INLINE MATH
        if (part.startsWith("$") && part.endsWith("$")) {
          return (
            <span key={i} className={inlineMathClass}>
              <InlineMath math={part.slice(1, -1)} />
            </span>
          );
        }

        // TEXT
        return (
          <span key={i} className={textClass}>
            {part}
          </span>
        );
      })}
    </div>
  );
};

export default RenderMixedContent;