"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  Camera,
  Film,
  Save,
  Upload,
  X,
} from "lucide-react";
import { adminFetch, adminFetchRaw } from "@/lib/adminFetch";
import LoadingSpinner from "@/components/UI/LoadingSpinner";

const api = "/api";
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const MAX_VIDEO_BYTES = 80 * 1024 * 1024;
const ALLOWED_VIDEO_TYPES = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
]);
const ALLOWED_VIDEO_EXTENSIONS = [".mp4", ".webm", ".mov"];

type ButtonStyle = "primary" | "secondary" | "outline";
type UploadKind = "image" | "video";

type SliderForm = {
  title: string;
  subtitle: string;
  location: string;
  image_url: string;
  video_url: string;
  video_start_time: number;
  button_text: string;
  button_url: string;
  button_style: ButtonStyle;
  order_index: number;
  is_active: boolean;
  show_button: boolean;
};

type SliderResponse = Partial<SliderForm> & {
  image?: string | null;
  video?: string | null;
};

type UploadResponse = {
  url: string;
};

const emptyForm: SliderForm = {
  title: "",
  subtitle: "",
  location: "",
  image_url: "",
  video_url: "",
  video_start_time: 0,
  button_text: "",
  button_url: "",
  button_style: "primary",
  order_index: 0,
  is_active: true,
  show_button: false,
};

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong";
}

function isAllowedVideo(file: File) {
  const lowerName = file.name.toLowerCase();
  return (
    ALLOWED_VIDEO_TYPES.has(file.type) ||
    ALLOWED_VIDEO_EXTENSIONS.some((extension) => lowerName.endsWith(extension))
  );
}

export default function SliderEditor() {
  const params = useParams<{ id?: string }>();
  const router = useRouter();
  const id = params.id || "new";
  const isEditing = id !== "new";

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<UploadKind | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<SliderForm>(emptyForm);

  useEffect(() => {
    if (!isEditing) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadSlider() {
      try {
        const data = await adminFetch<SliderResponse>(
          `${api}/admin/sliders/${id}`,
        );
        if (cancelled) return;

        setForm({
          title: data.title || "",
          subtitle: data.subtitle || "",
          location: data.location || "",
          image_url: data.image_url || data.image || "",
          video_url: data.video_url || data.video || "",
          video_start_time: Number(data.video_start_time || 0),
          button_text: data.button_text || "",
          button_url: data.button_url || "",
          button_style: data.button_style || "primary",
          order_index: Number(data.order_index || 0),
          is_active: data.is_active !== false,
          show_button: Boolean(data.show_button),
        });
      } catch (loadError) {
        if (!cancelled) setError(getErrorMessage(loadError));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadSlider();
    return () => {
      cancelled = true;
    };
  }, [id, isEditing]);

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = event.target;
    setForm((current) => ({
      ...current,
      [name]:
        type === "checkbox"
          ? (event.target as HTMLInputElement).checked
          : type === "number"
            ? Number(value)
            : value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await adminFetch(
        isEditing ? `${api}/admin/sliders/${id}` : `${api}/admin/sliders`,
        {
          method: isEditing ? "PUT" : "POST",
          body: JSON.stringify(form),
        },
      );
      router.push("/admin/sliders");
    } catch (saveError) {
      setError(getErrorMessage(saveError));
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async (file: File, kind: UploadKind) => {
    setError(null);

    if (kind === "image" && !file.type.startsWith("image/")) {
      setError("Choose a JPG, PNG, WebP or GIF image.");
      return;
    }
    if (kind === "video" && !isAllowedVideo(file)) {
      setError("Choose an MP4, WebM or MOV video.");
      return;
    }

    const maxBytes = kind === "video" ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
    if (file.size > maxBytes) {
      setError(
        `${kind === "video" ? "Video" : "Image"} must be smaller than ${
          maxBytes / 1024 / 1024
        } MB.`,
      );
      return;
    }

    setUploading(kind);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("entityType", "slider");
      formData.append("slug", `slider-${id}-${Date.now()}`);
      formData.append("fieldName", kind === "video" ? "video_url" : "image_url");

      const response = await adminFetchRaw(`${api}/admin/upload/sliders`, {
        method: "POST",
        body: formData,
      });
      const result = (await response.json()) as UploadResponse;

      setForm((current) => ({
        ...current,
        [kind === "video" ? "video_url" : "image_url"]: result.url,
      }));
    } catch (uploadError) {
      setError(`Upload failed: ${getErrorMessage(uploadError)}`);
    } finally {
      setUploading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/sliders"
            className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-gray-100"
            aria-label="Back to hero sliders"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h2 className="text-xl font-semibold">
              {isEditing ? "Edit Hero Slider" : "New Hero Slider"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Use an image as the mobile fallback and optionally add a desktop video.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving || uploading !== null}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-green-600 px-6 py-2 text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save Slider"}
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800"
        >
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-7 rounded-xl border bg-white p-5 shadow-sm md:p-7"
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <label className="block text-sm font-medium text-gray-700">
            Title *
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              className="mt-2 w-full rounded-lg border px-3 py-2"
            />
          </label>
          <label className="block text-sm font-medium text-gray-700">
            Location label
            <input
              type="text"
              name="location"
              value={form.location}
              onChange={handleChange}
              className="mt-2 w-full rounded-lg border px-3 py-2"
              placeholder="Nepal, Kailash, Tibet..."
            />
          </label>
          <label className="block text-sm font-medium text-gray-700 md:col-span-2">
            Subtitle
            <textarea
              name="subtitle"
              value={form.subtitle}
              onChange={handleChange}
              rows={3}
              className="mt-2 w-full rounded-lg border px-3 py-2"
            />
          </label>
          <label className="block text-sm font-medium text-gray-700">
            Display order
            <input
              type="number"
              min="0"
              name="order_index"
              value={form.order_index}
              onChange={handleChange}
              className="mt-2 w-full rounded-lg border px-3 py-2"
            />
          </label>
          <label className="block text-sm font-medium text-gray-700">
            Video start time (seconds)
            <input
              type="number"
              min="0"
              max="86400"
              step="0.1"
              name="video_start_time"
              value={form.video_start_time}
              onChange={handleChange}
              className="mt-2 w-full rounded-lg border px-3 py-2"
            />
          </label>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <label className="block text-sm font-medium text-gray-700">
            Button text
            <input
              type="text"
              name="button_text"
              value={form.button_text}
              onChange={handleChange}
              className="mt-2 w-full rounded-lg border px-3 py-2"
            />
          </label>
          <label className="block text-sm font-medium text-gray-700">
            Button URL
            <input
              type="text"
              name="button_url"
              value={form.button_url}
              onChange={handleChange}
              className="mt-2 w-full rounded-lg border px-3 py-2"
              placeholder="/tours"
            />
          </label>
          <label className="block text-sm font-medium text-gray-700">
            Button style
            <select
              name="button_style"
              value={form.button_style}
              onChange={handleChange}
              className="mt-2 w-full rounded-lg border bg-white px-3 py-2"
            >
              <option value="primary">Primary</option>
              <option value="secondary">Secondary</option>
              <option value="outline">Outline</option>
            </select>
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-6 border-y py-5">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="is_active"
              checked={form.is_active}
              onChange={handleChange}
              className="h-5 w-5 rounded border-gray-300 text-green-600"
            />
            <span>Active</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="show_button"
              checked={form.show_button}
              onChange={handleChange}
              className="h-5 w-5 rounded border-gray-300 text-yellow-600"
            />
            <span>Show button</span>
          </label>
        </div>

        <div className="grid gap-8 xl:grid-cols-2">
          <MediaUploadPanel
            kind="image"
            title="Fallback image"
            description="Shown on mobile, reduced-motion mode, data saver and while video loads. Maximum 8 MB."
            value={form.image_url}
            uploading={uploading === "image"}
            accept="image/jpeg,image/png,image/webp,image/gif"
            icon={<Camera className="h-5 w-5" />}
            onUpload={(file) => handleUpload(file, "image")}
            onClear={() => setForm((current) => ({ ...current, image_url: "" }))}
            onUrlChange={(value) =>
              setForm((current) => ({ ...current, image_url: value }))
            }
          />

          <MediaUploadPanel
            kind="video"
            title="Hero video"
            description="Optional desktop video. MP4, WebM or MOV, maximum 80 MB."
            value={form.video_url}
            uploading={uploading === "video"}
            accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
            icon={<Film className="h-5 w-5" />}
            onUpload={(file) => handleUpload(file, "video")}
            onClear={() => setForm((current) => ({ ...current, video_url: "" }))}
            onUrlChange={(value) =>
              setForm((current) => ({ ...current, video_url: value }))
            }
          />
        </div>
      </form>
    </div>
  );
}

type MediaUploadPanelProps = {
  kind: UploadKind;
  title: string;
  description: string;
  value: string;
  uploading: boolean;
  accept: string;
  icon: React.ReactNode;
  onUpload: (file: File) => void;
  onClear: () => void;
  onUrlChange: (value: string) => void;
};

function MediaUploadPanel({
  kind,
  title,
  description,
  value,
  uploading,
  accept,
  icon,
  onUpload,
  onClear,
  onUrlChange,
}: MediaUploadPanelProps) {
  const inputId = `slider-${kind}-upload`;

  return (
    <section className="space-y-4 rounded-xl border border-slate-200 p-5">
      <div>
        <div className="flex items-center gap-2 font-semibold text-slate-900">
          {icon}
          <h3>{title}</h3>
        </div>
        <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
      </div>

      <div
        className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center transition-colors hover:border-green-500"
        onDrop={(event) => {
          event.preventDefault();
          const file = event.dataTransfer.files[0];
          if (file) onUpload(file);
        }}
        onDragOver={(event) => event.preventDefault()}
      >
        <Upload className="mx-auto h-8 w-8 text-slate-400" />
        <p className="mt-3 text-sm text-slate-600">
          Drag and drop a {kind}, or choose a file.
        </p>
        <input
          type="file"
          accept={accept}
          className="sr-only"
          id={inputId}
          disabled={uploading}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onUpload(file);
            event.currentTarget.value = "";
          }}
        />
        <label
          htmlFor={inputId}
          className={`mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white ${
            uploading
              ? "pointer-events-none cursor-not-allowed opacity-50"
              : "cursor-pointer hover:bg-green-700"
          }`}
        >
          {uploading ? "Uploading..." : `Choose ${kind}`}
        </label>
      </div>

      {value ? (
        <div className="relative overflow-hidden rounded-xl border bg-slate-950">
          {kind === "video" ? (
            <video
              src={value}
              controls
              muted
              preload="metadata"
              className="aspect-video w-full object-cover"
            />
          ) : (
            <img
              src={value}
              alt="Hero slider preview"
              className="aspect-video w-full object-cover"
            />
          )}
          <button
            type="button"
            onClick={onClear}
            className="absolute right-2 top-2 flex h-10 w-10 items-center justify-center rounded-lg bg-red-600/90 text-white hover:bg-red-700"
            aria-label={`Remove ${kind}`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="flex aspect-video items-center justify-center rounded-xl border border-dashed bg-slate-50 text-sm text-slate-500">
          No {kind} selected
        </div>
      )}

      <label className="block text-xs font-medium text-slate-600">
        Or enter {kind} URL
        <input
          type="url"
          value={value}
          onChange={(event) => onUrlChange(event.target.value)}
          className="mt-2 w-full rounded-lg border px-3 py-2 text-sm"
          placeholder={`https://example.com/hero.${kind === "video" ? "mp4" : "jpg"}`}
        />
      </label>
    </section>
  );
}
