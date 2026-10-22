# slh-manager

A helper for artistic executive dysfunction: slh's paper planner as a web app. Week spread with watercolor margins, release countdowns, 45-minute moves with a focus timer, a skill tree, a Sunday review, and a manager chat powered by Claude.

The same page runs in two places:

- **claude.ai** as a private artifact. Storage and Claude come from claude.ai itself.
- **Vercel** (this repo). Storage is Upstash Redis; the manager chat calls the Anthropic API with your key; a passcode keeps it yours.

## Deploy on Vercel

1. **Import the repo.** vercel.com → Add New → Project → pick `slh-manager` → Deploy. No build settings to change (`vercel.json` serves `public/` and the functions in `api/`).
2. **Add storage.** In the project: Storage → Create Database → **Upstash for Redis** (free tier) → connect it to this project. It adds the `KV_REST_API_URL` and `KV_REST_API_TOKEN` variables.
3. **Add two environment variables** (Settings → Environment Variables):
   - `APP_PASSCODE`: any passphrase. The app asks for it once per device.
   - `ANTHROPIC_API_KEY`: from console.anthropic.com → API Keys. Billed per use, separate from a Claude subscription.
   - Optional `ANTHROPIC_MODEL`: defaults to `claude-sonnet-5-5`.
4. **Redeploy** (Deployments → ⋯ → Redeploy) so the new variables load.
5. Open the URL, enter the passcode, and add it to your home screen (iPad: Share → Add to Home Screen; Android: ⋮ → Add to home screen).

Until the first save, the planner loads the plan in `data/seed.js`.

## Editing the page

`src/app.html` is the single source. After changing it:

```
python3 scripts/build_page.py   # writes public/index.html
```

## API

| Route | Method | Does |
| --- | --- | --- |
| `/api/state` | GET / PUT | The planner (`{ plan }`). `?doc=chat` for the chat history. |
| `/api/manager` | POST | Proxies `{ messages, tools }` to the Anthropic Messages API. The page runs tool calls itself. |

Every call needs the `x-passcode` header.
