











import React, { useState, useRef, useEffect, useCallback } from "react";
import { Search, X, Square, Circle, Type, Minus, ArrowUpRight, Image, Frame } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CanvasSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectElement: (elementId: string) => void;
  elements: any[];
}

const getElementIcon = (type: string) => {
  switch (type) {
    case "rectangle":
      return <Square size={16} />;
    case "ellipse":
    case "diamond":
      return <Circle size={16} />;
    case "text":
      return <Type size={16} />;
    case "line":
      return <Minus size={16} />;
    case "arrow":
      return <ArrowUpRight size={16} />;
    case "image":
      return <Image size={16} />;
    case "frame":
      return <Frame size={16} />;
    default:
      return <Square size={16} />;
  }
};

export const CanvasSearch: React.FC<CanvasSearchProps> = ({
  isOpen,
  onClose,
  onSelectElement,
  elements,
}) => {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const filteredElements = query.trim()
    ? elements.filter((el) => {
        const searchQuery = query.toLowerCase();
        const name = (el.name || "").toLowerCase();
        const text = (el.text || "").toLowerCase();
        const type = (el.type || "").toLowerCase();
        return (
          name.includes(searchQuery) ||
          text.includes(searchQuery) ||
          type.includes(searchQuery)
        );
      })
    : [];

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setQuery("");
      setActiveIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setActiveIndex((prev) =>
            prev < filteredElements.length - 1 ? prev + 1 : 0
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setActiveIndex((prev) =>
            prev > 0 ? prev - 1 : filteredElements.length - 1
          );
          break;
        case "Enter":
          e.preventDefault();
          if (filteredElements[activeIndex]) {
            onSelectElement(filteredElements[activeIndex].id);
            onClose();
          }
          break;
        case "Escape":
          e.preventDefault();
          onClose();
          break;
      }
    },
    [filteredElements, activeIndex, onSelectElement, onClose]
  );

  if (!isOpen) return null;

  return (
    <>
      {}
      <div
        className="vd-dialog-backdrop"
        onClick={onClose}
        style={{ zIndex: 1040 }}
      />

      {}
      <div className="vd-search-panel" style={{ zIndex: 1050 }}>
        <div className="vd-search-panel__input">
          <Search size={16} style={{ color: "var(--vd-text-tertiary)" }} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search elements by name or text..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 20,
                height: 20,
                borderRadius: 4,
                color: "var(--vd-text-tertiary)",
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="vd-search-panel__results" ref={resultsRef}>
          {query.trim() && filteredElements.length === 0 && (
            <div className="vd-search-panel__empty">
              No elements found for "{query}"
            </div>
          )}

          {filteredElements.map((element, index) => (
            <div
              key={element.id}
              className={`vd-search-panel__result ${
                index === activeIndex ? "vd-search-panel__result--active" : ""
              }`}
              onClick={() => {
                onSelectElement(element.id);
                onClose();
              }}
              onMouseEnter={() => setActiveIndex(index)}
            >
              <div className="vd-search-panel__result-icon">
                {getElementIcon(element.type)}
              </div>
              <div className="vd-search-panel__result-info">
                <div className="vd-search-panel__result-name">
                  {element.name || element.text || element.type}
                </div>
                <div className="vd-search-panel__result-type">
                  {element.type}
                  {element.name && ` • ${element.type}`}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
