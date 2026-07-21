import fs from "node:fs/promises";
import path from "node:path";
import { testConnection } from "@/server/db/mysql";

export const dynamic = "force-dynamic";

async function deployedRelease() {
  try {
    const content = await fs.readFile(path.join(process.cwd(), "release.json"), "utf8");
    const release = JSON.parse(content) as { commit?: unknown };
    return typeof release.commit === "string" ? release.commit : null;
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    await testConnection();
    return Response.json({ status: "ok", release: await deployedRelease() });
  } catch {
    return Response.json({ status: "unavailable", release: await deployedRelease() }, { status: 503 });
  }
}
