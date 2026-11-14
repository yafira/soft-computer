import "./globals.css";
import Nav from "../components/Nav";
import OsDock from "../components/OsDock";

export const metadata = {
  title: "soft.computer",
  description: "a soft computer thesis log",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Nav />
        <main className="wrap">{children}</main>
        <OsDock />
      </body>
    </html>
  );
}
