"use client";
import React, { useState } from "react";
import { X } from "lucide-react";

const SelectTags = ({ selectedTags, setSelectedTags }) => {
  const [inputValue, setInputValue] = useState("");

  const addTag = (tag) => {
    const trimmed = tag.trim();
    if (trimmed !== "" && !selectedTags.includes(trimmed)) {
      setSelectedTags([...selectedTags, trimmed]);
    }
    setInputValue("");
  };

  const removeTag = (index) => {
    const newTags = [...selectedTags];
    newTags.splice(index, 1);
    setSelectedTags(newTags);
  };

  return (
    <div>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            addTag(inputValue);
          }
        }}
        placeholder="Type a tag and press Enter"
        className="input-field"
      />
      {selectedTags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {selectedTags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(index)}
                className="text-indigo-400 transition-colors hover:text-rose-600"
                aria-label={`Remove ${tag}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default SelectTags;
