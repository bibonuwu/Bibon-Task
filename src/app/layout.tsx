import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import "./globals.css";

export const metadata: Metadata = {
  title: "BibonTask — Premium Task Planner",
  description:
    "A beautiful, minimal task planner built with Next.js, Firebase, and Tailwind CSS.",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased text-zinc-900 dark:text-zinc-100 bg-zinc-50 dark:bg-zinc-950 transition-colors">
        <AuthProvider>
          <ThemeProvider>
            {children}
            <Toaster
              position="bottom-center"
              toastOptions={{
                duration: 3000,
                style: {
                  borderRadius: "14px",
                  padding: "12px 18px",
                  fontSize: "14px",
                  fontWeight: "500",
                },
                success: {
                  iconTheme: { primary: "#22c55e", secondary: "#fff" },
                },
                error: {
                  iconTheme: { primary: "#ef4444", secondary: "#fff" },
                },
              }}
            />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
