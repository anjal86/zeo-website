@/Users/shrestha/.codex/RTK.md

# Project Workflow

## Token Discipline
- Keep responses concise unless user asks for depth.
- Prefer targeted reads/searches over broad file dumps.
- Use `rg`/`rg --files` first for repo discovery.
- Use `graphify` for architecture/codebase questions when useful, especially if `graphify-out/graph.json` exists.
- Avoid full-file rewrites; make small diffs scoped to request.
- Use `handoff` before long context gets stale or when pausing a multi-step task.

## Tool Output
- Shell commands must use `rtk` per imported RTK rules.
- For unsupported `rtk` commands, use `rtk proxy <cmd>`.
- Write large web/search/scrape results to files, then inspect with targeted reads.
- Do not paste large logs into chat; summarize failures and key lines.

## Useful Skills
- `caveman`: terse replies when token saving matters.
- `compress` / `caveman-compress`: shrink prose-heavy memory/docs.
- `markdown-token-optimizer`: audit Markdown token bloat.
- `token-optimizer`: audit Codex/agent context waste before major cleanup.
- `graphify`: query code relationships before brute-force repo reading.
- `firecrawl`: live web search/scrape/crawl with saved outputs.
- `grill-me` / `grill-with-docs`: clarify fuzzy requests before coding.
- `diagnosing-bugs`, `tdd`, `resolving-merge-conflicts`: use for focused engineering workflows.
- `to-prd` / `to-issues`: convert plans into scoped implementation work.

## Engineering Defaults
- Preserve user changes; do not revert unrelated edits.
- Follow existing project patterns before adding abstractions.
- Run focused verification after edits; broaden tests when shared behavior changes.
- Report changed files and verification result at the end.
