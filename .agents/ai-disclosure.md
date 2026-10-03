---
trigger: always_on
---

# AI Use Disclosure — Required for Every Contribution

**Purpura must know when your contribution was produced with AI assistance.**

This applies to every pull request, issue, and discussion on this repository — human-written and AI-assisted contributions are both welcome, but undisclosed AI use is not.

## What you must disclose

In every pull request description, include an **AI disclosure** section that answers:

1. **Was AI used?** — Yes / No. If no, write `AI disclosure: No AI was used.`
2. **If yes, which tool(s)?** — Name the model/service (e.g. Muse, ChatGPT/GPT-4, Cursor, Copilot Chat, Gemini, Claude) and where you ran it.
3. **What was AI-generated?** — List the files or sections written, drafted, or substantially edited with AI. Be specific (e.g. `src/content/feat/cat/pfl.js — price-floor logic drafted with Copilot Chat`).
4. **What did you verify yourself?** — A one-line human verification statement (e.g. `Verified manually on catalog item pages; toggle on/off tested.`).

### Template (copy into your PR description)

```md
## AI disclosure
- AI used: Yes — Muse (VS Code)
- Generated: src/content/feat/cat/pfl.js (price floor injection), assets/_locales/en/messages.json (strings)
- Human verification: Loaded unpacked on catalog + item pages, toggle on/off, no console errors on unaffected pages.
```

Or, if no AI was involved:

```md
## AI disclosure
- No AI was used. All changes were written and verified by me.
```

## Why this exists

- Reviewers need to know how much of a change to trust, how to review it, and where to probe for model hallucinations.
- Undisclosed AI-generated code has a higher risk of subtle bugs, prompt-injected URLs, or license-incompatible text.
- The project tracks AI use across contributions to improve review and tooling — not to punish disclosure. Disclosure never hurts your PR; omission does.

## Enforcement

- Pull requests without an AI disclosure may be asked to add one before review.
- Repeated failure to disclose AI use, or materially false disclosure, may result in the PR being closed.
- Do not attempt to hide AI involvement by re-typing or lightly editing generated code — if AI substantially produced it, disclose it.

## For automated tools

If you are an AI agent filing a contribution on behalf of a user, you **must** include the disclosure above on their behalf and never omit or falsify it. The human author remains responsible for verification (item 4).
