"use client";

import { useEffect, useState } from "react";
import KailashMansarovarClient, {
  type KailashGalleryPhoto,
} from "./KailashMansarovarClient";
import type { Tour } from "@/services/api";

type DestinationOption = {
  id: number;
  name: string;
  country?: string;
};

type ContactInfo = {
  contact?: {
    phone?: { primary?: string };
    email?: { primary?: string };
  };
  business?: {
    support?: { availability?: string };
  };
};

type KailashMansarovarLoaderProps = {
  fallbackGallery: KailashGalleryPhoto[];
};

const REQUEST_TIMEOUT_MS = 6_000;
const MAX_HERO_IMAGES = 8;

async function readJson<T>(url: string, signal: AbortSignal): Promise<T> {
  const response = await fetch(url, {
    signal,
    cache: "no-store",
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`${url} returned ${response.status}`);
  }

  return (await response.json()) as T;
}

function unwrapItems<T>(value: T[] | { items?: T[] } | undefined): T[] {
  if (Array.isArray(value)) return value;
  return value?.items ?? [];
}

export default function KailashMansarovarLoader({
  fallbackGallery,
}: KailashMansarovarLoaderProps) {
  const [galleryPhotos, setGalleryPhotos] =
    useState<KailashGalleryPhoto[]>(fallbackGallery);
  const [tours, setTours] = useState<Tour[]>([]);
  const [destinations, setDestinations] = useState<DestinationOption[]>([]);
  const [contactInfo, setContactInfo] = useState<ContactInfo | undefined>();

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(
      () => controller.abort(),
      REQUEST_TIMEOUT_MS,
    );
    let cancelled = false;

    async function hydratePageData() {
      const [galleryResult, toursResult, destinationsResult, contactResult] =
        await Promise.allSettled([
          readJson<{ gallery?: KailashGalleryPhoto[] }>(
            "/api/kailash-gallery",
            controller.signal,
          ),
          readJson<Tour[] | { items?: Tour[] }>(
            "/api/tours?search=kailash&limit=12",
            controller.signal,
          ),
          readJson<DestinationOption[] | { items?: DestinationOption[] }>(
            "/api/destinations?limit=100",
            controller.signal,
          ),
          readJson<ContactInfo>("/api/contact", controller.signal),
        ]);

      if (cancelled) return;

      if (galleryResult.status === "fulfilled") {
        const gallery = (galleryResult.value.gallery ?? [])
          .filter((photo) => Boolean(photo.image))
          .slice(0, MAX_HERO_IMAGES);
        if (gallery.length > 0) setGalleryPhotos(gallery);
      }

      if (toursResult.status === "fulfilled") {
        setTours(unwrapItems(toursResult.value));
      }

      if (destinationsResult.status === "fulfilled") {
        setDestinations(unwrapItems(destinationsResult.value));
      }

      if (contactResult.status === "fulfilled") {
        setContactInfo(contactResult.value);
      }
    }

    void hydratePageData().finally(() => window.clearTimeout(timeoutId));

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, []);

  return (
    <KailashMansarovarClient
      galleryPhotos={galleryPhotos}
      tours={tours}
      destinations={destinations}
      contactInfo={contactInfo}
    />
  );
}
