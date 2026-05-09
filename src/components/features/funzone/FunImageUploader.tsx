"use client";

import { useState } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase/client";
import type { GameType } from "@/types/fun-zone";

interface UploadResult {
  url: string;
  storagePath: string;
  width: number;
  height: number;
}

interface FunImageUploaderProps {
  gameType: GameType;
  userId: string;
  label?: string;
  onUploaded: (result: UploadResult) => void;
  /** Optional sub-key to allow multiple uploaders (e.g. "then" / "now") */
  slot?: string;
}

async function readDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };
    img.src = url;
  });
}

export function FunImageUploader({
  gameType,
  userId,
  label = "Choose image",
  onUploaded,
  slot,
}: FunImageUploaderProps) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    setError(null);
    setStatus("uploading");
    setProgress(0);
    setPreview(URL.createObjectURL(file));

    try {
      const dims = await readDimensions(file);
      const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const folderSlot = slot ? `/${slot}` : "";
      const storagePath = `fun-zone/${gameType}/${userId}${folderSlot}/${Date.now()}_${safe}`;
      const storageRef = ref(storage, storagePath);
      const task = uploadBytesResumable(storageRef, file, { contentType: file.type });

      await new Promise<void>((resolve, reject) => {
        task.on(
          "state_changed",
          (snap) => setProgress((snap.bytesTransferred / snap.totalBytes) * 100),
          (err) => reject(err),
          () => resolve()
        );
      });

      const url = await getDownloadURL(task.snapshot.ref);
      setStatus("done");
      onUploaded({ url, storagePath, width: dims.width, height: dims.height });
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Upload failed");
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium text-gray-700">{label}</label>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
        className="block w-full text-sm text-gray-600 file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
      />
      {preview && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="Preview" className="max-h-48 rounded-lg border border-gray-200" />
      )}
      {status === "uploading" && (
        <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
          <div className="h-full bg-indigo-500" style={{ width: `${progress}%` }} />
        </div>
      )}
      {status === "done" && <p className="text-xs text-green-600">✓ Uploaded</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
