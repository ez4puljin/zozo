"use client";

import { useState, useRef } from "react";
import { Upload, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  onUpload: (url: string) => void;
}

export function ImageUploadDropzone({ onUpload }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  async function uploadFile(file: File) {
    setError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? `Upload алдаа (${res.status})`);
        return;
      }
      onUpload(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Сүлжээний алдаа");
    } finally {
      setUploading(false);
    }
  }

  async function handleFiles(files: FileList | File[]) {
    for (const f of Array.from(files)) {
      await uploadFile(f);
    }
  }

  return (
    <div className="space-y-2">
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
        }}
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed bg-muted/30 p-6 text-center cursor-pointer transition",
          dragOver ? "border-foreground bg-muted/60" : "hover:bg-muted/50",
          uploading && "opacity-60 pointer-events-none"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
        {uploading ? (
          <>
            <Loader2 className="h-6 w-6 animate-spin" />
            <div className="text-sm font-medium">Хуулж байна…</div>
          </>
        ) : (
          <>
            <Upload className="h-6 w-6 text-muted-foreground" />
            <div className="text-sm font-medium">
              Зургийг чирж оруулах эсвэл дарж сонгох
            </div>
            <div className="text-[11px] text-muted-foreground">
              JPG, PNG, WebP, GIF · 5MB-ээс ихгүй · олон зураг зэрэг сонгож болно
            </div>
          </>
        )}
      </label>
      {error ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
          {error.includes("Blob") || error.includes("token") ? (
            <div className="mt-1 text-xs">
              Vercel dashboard → Storage → Blob үүсгээд project-тэй холбоно уу,
              эсвэл доорх URL талбараар зургийн линкийг шууд оруулна уу.
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
