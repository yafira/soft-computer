import Link from "next/link";

export const metadata = {
  title: "404 • soft.computer",
};

// a plain screen that covers everything, like the homepage does
export default function NotFound() {
  return (
    <main className="notFound">
      <h1 className="notFoundCode">
        <span className="notFoundBlink">404</span>
      </h1>
      <p className="notFoundText">page not found</p>
      <Link href="/" className="notFoundHome">
        back to soft os
      </Link>
    </main>
  );
}
