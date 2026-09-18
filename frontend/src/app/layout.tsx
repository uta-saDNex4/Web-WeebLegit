import type { Metadata } from "next";
import "../index.css";

export const metadata: Metadata = {
  title: "WeebLegit – Trợ lý hợp đồng thông minh cho sinh viên",
  description:
    "Kiểm tra hợp đồng, tìm hiểu pháp lý và bảo vệ quyền lợi của bạn với trợ lý AI được đào tạo theo luật Việt Nam.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
