"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface Img {
  id: string;
  url: string;
  alt: string | null;
}

export function ProductGallery({ images, name }: { images: Img[]; name: string }) {
  const [active, setActive] = useState(0);
  const main = images[active] ?? images[0];

  if (!images.length) {
    return <div className="aspect-square w-full rounded-lg bg-muted" />;
  }

  return (
    <div>
      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted">
        <Image
          src={main.url}
          alt={main.alt ?? name}
          fill
          sizes="(min-width:1024px) 50vw, 100vw"
          className="object-cover"
          priority
        />
      </div>
      {images.length > 1 ? (
        <div className="mt-4 grid grid-cols-5 gap-2">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActive(i)}
              className={cn(
                "relative aspect-square overflow-hidden rounded-md bg-muted ring-offset-2 transition",
                i === active ? "ring-2 ring-foreground" : "hover:opacity-80"
              )}
            >
              <Image
                src={img.url}
                alt={img.alt ?? `${name} ${i + 1}`}
                fill
                sizes="100px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
