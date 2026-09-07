"use client";

import { useCallback, useRef, useState } from "react";
import clsx from "clsx";

const ACCEPTED = [".wav", ".mp3", ".flac"];

export default function AudioDropzone({
  onFileSelected,
  disabled,
}: {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
}) {
  const [dragOver, setDragOver] = useState(false);
  const [selected, setSelected] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const file = files[0];
      const ext = "." + file.name.split(".").pop()?.toLowerCase();
      if (!ACCEPTED.includes(ext)) {
        alert(`Unsupported file type ${ext}. Supported: ${ACCEPTED.join(", ")}`);
        return;
      }
      setSelected(file);
      onFileSelected(file);
    },
    [onFileSelected]
  );

  return (
    <div
      className={clsx(
        "glass-panel flex flex-col items-center justify-center gap-3 border-2 border-dashed p-10 text-center transition-colors",
        dragOver ? "border-cyan-accent bg-cyan-accent/5" : "border-white/10",
        disabled && "pointer-events-none opacity-50"
      )}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        handleFiles(e.dataTransfer.files);
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(",")}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <div className="text-4xl">🎙️</div>
      <p className="text-slate-300">
        Drag & drop a WAV, MP3, or FLAC file here, or{" "}
        <button
          type="button"
          className="font-semibold text-cyan-accent underline underline-offset-2"
          onClick={() => inputRef.current?.click()}
        >
          browse
        </button>
      </p>
      {selected && (
        <div className="mt-2 rounded-lg border border-white/10 bg-black/20 px-4 py-2 text-sm text-slate-200">
          <span className="font-mono-vs">{selected.name}</span>{" "}
          <span className="text-slate-500">({(selected.size / (1024 * 1024)).toFixed(2)} MB)</span>
        </div>
      )}
    </div>
  );
}
