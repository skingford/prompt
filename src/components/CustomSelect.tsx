import { useEffect, useId, useRef, useState } from "react";
import { CheckIcon, ChevronDownIcon } from "./Icons";

export interface CustomSelectOption {
  label: string;
  value: string;
  disabled?: boolean;
  meta?: string;
}

interface CustomSelectProps {
  ariaLabel: string;
  className?: string;
  options: CustomSelectOption[];
  value: string;
  onChange: (value: string) => void;
}

export function CustomSelect({
  ariaLabel,
  className,
  options,
  value,
  onChange,
}: CustomSelectProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const closeTimerRef = useRef<number | null>(null);
  const listboxId = useId();
  const [open, setOpen] = useState(false);
  const [renderMenu, setRenderMenu] = useState(false);
  const [closing, setClosing] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const selectedOption = options.find((option) => option.value === value) ?? options[0];

  function findNextEnabledIndex(startIndex: number, direction: 1 | -1) {
    let index = startIndex;
    for (let step = 0; step < options.length; step += 1) {
      index = (index + direction + options.length) % options.length;
      if (!options[index]?.disabled) {
        return index;
      }
    }
    return -1;
  }

  function findBoundaryEnabledIndex(direction: 1 | -1) {
    const indices = direction === 1
      ? options.map((_, index) => index)
      : options.map((_, index) => options.length - 1 - index);

    return indices.find((index) => !options[index]?.disabled) ?? -1;
  }

  function clearCloseTimer() {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }

  function openMenu(nextActiveIndex?: number) {
    clearCloseTimer();
    setClosing(false);
    setRenderMenu(true);
    setOpen(true);
    if (typeof nextActiveIndex === "number") {
      setActiveIndex(nextActiveIndex);
    }
  }

  function closeMenu(options?: { focusTrigger?: boolean }) {
    if (!renderMenu) {
      setOpen(false);
      return;
    }

    setOpen(false);
    setClosing(true);
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(() => {
      setClosing(false);
      setRenderMenu(false);
      closeTimerRef.current = null;
      if (options?.focusTrigger) {
        triggerRef.current?.focus();
      }
    }, 160);
  }

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        closeMenu();
      }
    }

    function handleWindowBlur() {
      closeMenu();
    }

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("blur", handleWindowBlur);
    return () => {
      clearCloseTimer();
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, [renderMenu]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const selectedIndex = options.findIndex(
      (option) => option.value === value && !option.disabled,
    );
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : findBoundaryEnabledIndex(1));
  }, [open, options, value]);

  useEffect(() => {
    if (!renderMenu || activeIndex < 0) {
      return;
    }

    const optionId = `${listboxId}-option-${activeIndex}`;
    const element = document.getElementById(optionId);
    element?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, listboxId, renderMenu]);

  function handleSelect(option: CustomSelectOption) {
    if (option.disabled) {
      return;
    }
    onChange(option.value);
    closeMenu({ focusTrigger: true });
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "Tab") {
      closeMenu();
      return;
    }

    if (event.key === "Escape") {
      closeMenu();
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!open) {
        const selectedIndex = options.findIndex(
          (option) => option.value === value && !option.disabled,
        );
        openMenu(selectedIndex >= 0 ? selectedIndex : findBoundaryEnabledIndex(1));
        return;
      }

      setActiveIndex((current) =>
        findNextEnabledIndex(current < 0 ? options.length - 1 : current, 1),
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) {
        const selectedIndex = options.findIndex(
          (option) => option.value === value && !option.disabled,
        );
        openMenu(selectedIndex >= 0 ? selectedIndex : findBoundaryEnabledIndex(-1));
        return;
      }

      setActiveIndex((current) =>
        findNextEnabledIndex(current < 0 ? 0 : current, -1),
      );
      return;
    }

    if (event.key === "Home" && open) {
      event.preventDefault();
      setActiveIndex(findBoundaryEnabledIndex(1));
      return;
    }

    if (event.key === "End" && open) {
      event.preventDefault();
      setActiveIndex(findBoundaryEnabledIndex(-1));
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (!open) {
        openMenu();
        return;
      }

      const option = options[activeIndex];
      if (option && !option.disabled) {
        handleSelect(option);
      }
    }
  }

  return (
    <div
      className={["custom-select", open ? "is-open" : "", closing ? "is-closing" : "", className ?? ""]
        .filter(Boolean)
        .join(" ")}
      ref={rootRef}
    >
      <button
        ref={triggerRef}
        type="button"
        className="custom-select__trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-activedescendant={open && activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined}
        aria-label={ariaLabel}
        onClick={() => {
          if (open) {
            closeMenu();
          } else {
            openMenu();
          }
        }}
        onKeyDown={handleKeyDown}
      >
        <span className="custom-select__value">{selectedOption?.label ?? value}</span>
        <ChevronDownIcon className="custom-select__chevron" />
      </button>

      {renderMenu ? (
        <div
          className={`custom-select__menu ${open && !closing ? "is-entering" : ""} ${closing ? "is-closing" : ""}`}
          role="listbox"
          id={listboxId}
          aria-label={ariaLabel}
        >
          {options.map((option, index) => {
            const selected = option.value === value;
            const disabled = Boolean(option.disabled);
            const active = index === activeIndex;

            return (
              <button
                key={option.value}
                id={`${listboxId}-option-${index}`}
                type="button"
                role="option"
                aria-selected={selected}
                disabled={disabled}
                className={[
                  "custom-select__option",
                  selected ? "is-selected" : "",
                  active ? "is-active" : "",
                  disabled ? "is-disabled" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => handleSelect(option)}
              >
                <span className="custom-select__option-copy">
                  <span className="custom-select__option-label">{option.label}</span>
                  {option.meta ? (
                    <span className="custom-select__option-meta">{option.meta}</span>
                  ) : null}
                </span>
                {selected ? <CheckIcon className="custom-select__option-icon" /> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
