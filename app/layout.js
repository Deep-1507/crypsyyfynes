import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ShopSyncChatbot from "../components/chatbot/ShopSyncChatbot";
import GoogleProvider from "./GoogleProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "ShopSync",
  description: "Connecting Businesses to Customers",
};

export default function RootLayout(
  { children }
) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <GoogleProvider>
          {children}
          <ShopSyncChatbot />
        </GoogleProvider>
      </body>
    </html>
  );
}
