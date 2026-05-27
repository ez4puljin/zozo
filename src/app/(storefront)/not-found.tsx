import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <div className="text-7xl font-bold tracking-tight">404</div>
      <h1 className="mt-4 text-2xl font-bold">Хуудас олдсонгүй</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Таны хайсан хуудас байхгүй эсвэл устгагдсан байна.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex rounded-md bg-foreground px-6 py-3 text-sm font-semibold text-background hover:opacity-90 transition"
      >
        Нүүр хуудас руу буцах
      </Link>
    </div>
  );
}
