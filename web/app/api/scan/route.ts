import { execFile } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";

const run = promisify(execFile);

// Le script Python est dans le dossier ocr, à côté du dossier web
const SCRIPT = path.join(process.cwd(), "..", "ocr", "scan.py");

export async function POST(request: Request) {
  const form = await request.formData();
  const image = form.get("image");
  if (!(image instanceof File)) {
    return Response.json({ error: "Aucune image reçue" }, { status: 400 });
  }

  // On enregistre l'image dans un dossier temporaire pour que Python puisse la lire
  const dir = await mkdtemp(path.join(os.tmpdir(), "scan-"));
  const imagePath = path.join(dir, "image" + path.extname(image.name));
  try {
    await writeFile(imagePath, Buffer.from(await image.arrayBuffer()));
    const { stdout } = await run("python", [SCRIPT, imagePath], {
      // Sans ça, Windows envoie les accents dans un autre encodage
      env: { ...process.env, PYTHONIOENCODING: "utf-8" },
    });
    return Response.json({ result: stdout.trim() });
  } catch (error) {
    // Message d'erreur de Python (ou de Node si python est introuvable)
    const detail = (error as { stderr?: string }).stderr?.trim() || String(error);
    console.error(detail);
    return Response.json({ error: `Erreur pendant le scan : ${detail}` }, { status: 500 });
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}
