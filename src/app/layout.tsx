import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "maplibre-gl/dist/maplibre-gl.css";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Casa Clara — Mi radar inmobiliario",
  description: "Organiza, compara y visita las propiedades que te interesan.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-MX" className={geistSans.variable}>
      <body>{children}</body>
    </html>
  );
}
