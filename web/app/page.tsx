"use client";

import { useState } from "react";

type ResultLine = {
  label: string | null;
  value: string;
};

const LINE_PATTERN = /^(QR code|Code-barres(?:\s*\([^)]*\))?)\s*:\s*(.*)$/;
const URL_PATTERN = /^https?:\/\/\S+$/i;

function parseResult(result: string): ResultLine[] {
  return result
    .split("\n")
    .filter((line) => line.trim().length > 0)
    .map((line) => {
      const match = line.match(LINE_PATTERN);
      if (match) {
        return { label: match[1], value: match[2].trim() };
      }
      return { label: null, value: line.trim() };
    });
}

export default function Home() {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [result, setResult] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  function chooseImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    if (preview) URL.revokeObjectURL(preview);
    setImage(file);
    setPreview(file ? URL.createObjectURL(file) : "");
    setResult("");
    setIsError(false);
  }

  async function scan(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!image) return;

    setLoading(true);
    setResult("");
    setIsError(false);
    const form = new FormData();
    form.append("image", image);
    try {
      const response = await fetch("/api/scan", { method: "POST", body: form });
      const data = await response.json();
      if (response.ok) {
        setResult(data.result ?? "");
      } else {
        setIsError(true);
        setResult(data.error ?? "Erreur inconnue");
      }
    } catch {
      setIsError(true);
      setResult("Impossible de contacter le serveur");
    } finally {
      setLoading(false);
    }
  }

  const lines = result ? parseResult(result) : [];

  return (
    <main className="page">
      <div className="card">
        <h1 className="title">Scanner QR code / code-barres</h1>
        <p className="subtitle">Dépose une image, on lit le code et on t’affiche le résultat.</p>

        <form onSubmit={scan}>
          <label className="dropzone">
            <span className="dropzone-icon">📷</span>
            <span className="dropzone-text">
              {image ? (
                <span className="file-name">{image.name}</span>
              ) : (
                <>Clique pour choisir une image</>
              )}
            </span>
            <input type="file" accept="image/*" onChange={chooseImage} />
          </label>

          <button type="submit" className="submit-button" disabled={!image || loading}>
            {loading && <span className="spinner" />}
            {loading ? "Scan en cours..." : "Scanner"}
          </button>
        </form>

        {preview && (
          <div className="preview-wrap">
            <img src={preview} alt="Image choisie" className="preview-img" />
          </div>
        )}

        {result && (
          <div className={`result-box${isError ? " is-error" : ""}`}>
            <p className="result-title">{isError ? "Erreur" : "Résultat"}</p>
            {lines.map((line, index) => {
              const isUrl = URL_PATTERN.test(line.value);
              return (
                <div className="result-line" key={index}>
                  {line.label && (
                    <span
                      className={`result-badge${
                        line.label.startsWith("Code-barres") ? " is-barcode" : ""
                      }`}
                    >
                      {line.label}
                    </span>
                  )}
                  {isUrl ? (
                    <a
                      href={line.value}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="result-link"
                    >
                      {line.value}
                    </a>
                  ) : (
                    <span className={line.label ? "result-value" : "result-message"}>
                      {line.value}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
