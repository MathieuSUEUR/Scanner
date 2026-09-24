"use client";

import { useState } from "react";

export default function Home() {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  function chooseImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    if (preview) URL.revokeObjectURL(preview);
    setImage(file);
    setPreview(file ? URL.createObjectURL(file) : "");
    setResult("");
  }

  async function scan(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!image) return;

    setLoading(true);
    setResult("");
    const form = new FormData();
    form.append("image", image);
    try {
      const response = await fetch("/api/scan", { method: "POST", body: form });
      const data = await response.json();
      setResult(data.result ?? data.error);
    } catch {
      setResult("Impossible de contacter le serveur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 600, margin: "40px auto", padding: "0 16px", fontFamily: "sans-serif" }}>
      <h1>Scanner QR code / code-barres</h1>

      <form onSubmit={scan}>
        <input type="file" accept="image/*" onChange={chooseImage} />
        <button type="submit" disabled={!image || loading}>
          {loading ? "Scan en cours..." : "Scanner"}
        </button>
      </form>

      {result && (
        <p style={{ whiteSpace: "pre-line" }}>
          <strong>Résultat :</strong> {result}
        </p>
      )}

      {preview && <img src={preview} alt="Image choisie" style={{ maxWidth: "100%", marginTop: 16 }} />}
    </main>
  );
}
