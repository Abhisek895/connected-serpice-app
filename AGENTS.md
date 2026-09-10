<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Strict Project Design Rule: Never Generate Gemini/AI Sparkle Stars
- **NEVER** generate, import, or display Google Gemini / AI sparkle star icons (`Sparkles` from `lucide-react` or similar 4-pointed AI stars).
- Always use brand-appropriate romantic or functional icons instead:
  - Brand mark & User Portal: `<Heart className="... fill-rose-500 text-rose-500" />` or `<Heart />`.
  - Templates & surprises: `<Heart />`, `<Gift />`, `<Star />`, or `<Flame />`.
  - Special offers & speed: `<Zap />` or `<Tag />`.
