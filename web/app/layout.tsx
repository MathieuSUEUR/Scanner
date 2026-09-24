import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Scanner",
  description: "Lecture de QR codes et de codes-barres",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
