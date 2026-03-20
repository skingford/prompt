import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

interface SplitPaneProps {
  ratio: number;
  onRatioChange: (ratio: number) => void;
  left: ReactNode;
  right: ReactNode;
  minLeft?: number;
  minRight?: number;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function SplitPane({
  ratio,
  onRatioChange,
  left,
  right,
  minLeft = 320,
  minRight = 420,
}: SplitPaneProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (!dragging) {
      return undefined;
    }

    function handleMove(event: MouseEvent) {
      const container = containerRef.current;
      if (!container) {
        return;
      }

      const bounds = container.getBoundingClientRect();
      const minRatio = minLeft / bounds.width;
      const maxRatio = 1 - minRight / bounds.width;
      const nextRatio = clamp((event.clientX - bounds.left) / bounds.width, minRatio, maxRatio);
      onRatioChange(nextRatio);
    }

    function handleUp() {
      setDragging(false);
      document.body.classList.remove("is-resizing");
    }

    document.body.classList.add("is-resizing");
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);

    return () => {
      document.body.classList.remove("is-resizing");
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [dragging, minLeft, minRight, onRatioChange]);

  const columns = useMemo(
    () => ({
      gridTemplateColumns: `${ratio}fr 8px ${1 - ratio}fr`,
    }),
    [ratio],
  );

  return (
    <div ref={containerRef} className="split-pane" style={columns}>
      <div className="split-pane__panel">{left}</div>
      <button
        type="button"
        className={`split-pane__handle ${dragging ? "is-active" : ""}`}
        onMouseDown={() => setDragging(true)}
        aria-label="Resize panels"
      >
        <span className="split-pane__handle-line" />
      </button>
      <div className="split-pane__panel">{right}</div>
    </div>
  );
}
