import { Inter } from "next/font/google";
import { ReactNode } from "react";
import { getPublicRuntimeConfigScript } from "@/runtime/public-config";

const inter = Inter({
  subsets: ["latin"],
});

type Props = {
  children: ReactNode;
  locale: string;
  bodyClassName?: string;
};

export default function Document({ children, locale, bodyClassName }: Props) {
  return (
    <html className={inter.className} lang={locale} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico?v=2" />
        <script
          dangerouslySetInnerHTML={{
            __html: getPublicRuntimeConfigScript()
          }}
        />
      </head>
      <body className={bodyClassName}>{children}</body>
    </html>
  );
}
