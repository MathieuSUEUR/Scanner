# Scanner — interface web

Page Next.js pour envoyer une image et lire son QR code ou son code-barres.
L'image est envoyée à `app/api/scan/route.ts`, qui lance le script Python `../ocr/scan.py`.

## Prérequis

- Node.js
- Python accessible avec la commande `python`, avec OpenCV installé (`pip install opencv-python`)

## Lancer

```bash
npm install
npm run dev
```

Puis ouvrir http://localhost:3000.
