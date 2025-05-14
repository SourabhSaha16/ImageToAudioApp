import React from "react";

interface HeaderProps {
  onHelpClick: () => void;
}

export function Header({ onHelpClick }: HeaderProps) {
  return (
    <header className="bg-white px-4 py-3 border-b border-gray-200 flex items-center justify-between">
      <h1 className="text-lg font-semibold">Photo to Audio</h1>
      <button
        type="button"
        onClick={onHelpClick}
        className="p-2 rounded-full hover:bg-gray-100 transition"
        aria-label="Help"
      >
        <i className="ri-question-line text-gray-500"></i>
      </button>
    </header>
  );
}
