import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const readSource = (path: string) =>
  readFile(new URL(path, import.meta.url), "utf8");

test("slider editor loads and saves video fields", async () => {
  const editor = await readSource(
    "../app/admin/(dashboard)/sliders/[id]/page.tsx",
  );

  assert.match(editor, /video_url: string/);
  assert.match(editor, /video_start_time: number/);
  assert.match(editor, /data\.video_url \|\| data\.video/);
  assert.match(editor, /name="video_start_time"/);
  assert.match(editor, /JSON\.stringify\(form\)/);
});

test("slider editor accepts supported video formats and uses the slider upload route", async () => {
  const editor = await readSource(
    "../app/admin/(dashboard)/sliders/[id]/page.tsx",
  );

  assert.match(editor, /video\/mp4/);
  assert.match(editor, /video\/webm/);
  assert.match(editor, /video\/quicktime/);
  assert.match(editor, /MAX_VIDEO_BYTES = 80 \* 1024 \* 1024/);
  assert.match(editor, /\/api\/admin\/upload\/sliders/);
  assert.match(editor, /fieldName", kind === "video" \? "video_url" : "image_url"/);
  assert.match(editor, /<video/);
  assert.match(editor, /preload="metadata"/);
});

test("dedicated slider upload route stores media under the sliders folder", async () => {
  const route = await readSource(
    "../app/api/admin/upload/sliders/route.ts",
  );

  assert.match(route, /uploadHandler/);
  assert.match(route, /folder: "sliders"/);
  assert.match(route, /entityType: "slider"/);
});

test("storage service supports the slider video formats and 80 MB limit", async () => {
  const storage = await readSource(
    "../src/server/storage/storage-service.ts",
  );

  assert.match(storage, /\["video\/mp4", \["\.mp4"\]\]/);
  assert.match(storage, /\["video\/webm", \["\.webm"\]\]/);
  assert.match(storage, /\["video\/quicktime", \["\.mov"\]\]/);
  assert.match(storage, /videoMaxBytes = 80 \* 1024 \* 1024/);
});
