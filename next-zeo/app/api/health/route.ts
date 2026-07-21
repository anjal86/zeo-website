import fs from "node:fs/promises";
import path from "node:path";
import { testConnection } from "@/server/db/mysql";

export const dynamic = "force-dynamic";

async function deployedRelease() {
  const candidates = [
    path.join(process.cwd(), "release.json"),
    process.argv[1] ? path.join(path.dirname(process.argv[1]), "release.json") : "",
    "/home/brandspi/apps/zeo/release.json",
  ].filter(Boolean);

  for (const candidate of candidates) {
    try {
      const content = await fs.readFile(candidate, "utf8");
      const release = JSON.parse(content) as { commit?: unknown };
      if (typeof release.commit === "string" && release.commit.trim().length > 0) {
        return release.commit.trim();
      }
    } catch {
      // try next candidate
    }
  }
  return null;
}

export async function GET() {
  try {
    await testConnection();
    return Response.json({ status: "ok", release: await deployedRelease() });
  } catch {
    return Response.json({ status: "unavailable", release: await deployedRelease() }, { status: 503 });
  }
}
