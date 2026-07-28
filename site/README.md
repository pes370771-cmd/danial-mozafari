# Your digital identity dashboard

No build step, no npm — 4 files, all static. Drop them straight into a GitHub repo.

## Files

- `index.html` — your public profile page
- `admin.html` — password-protected dashboard (visit stats + admin login history). Not linked from anywhere public — only reachable if you type the URL yourself.
- `supabase-config.js` — the only file you must edit before anything works. Paste your Project URL and anon key here (Supabase setup guide was given in chat).
- `track.js` — silently logs anonymous visits (time, referral source, rough country, device/browser). No names, no emails — that isn't available for an anonymous visitor and never will be.

## Before publishing

1. Finish the Supabase setup (project, admin user, the SQL for the two tables, RLS policies) — steps were given earlier in the conversation.
2. Open `supabase-config.js`, replace the two placeholder strings with your real `Project URL` and `anon public key` from Supabase → Project Settings → API.
3. Open `index.html`, find the `CONFIG` object near the top (inside the first `<script>` tag) and replace the placeholder name, tagline, and platform links (Telegram channel, Telegram DM, GitHub, LinkedIn, Instagram) with your real ones.

## Publish on GitHub Pages

Same as before, just with 4 files instead of 1:

1. github.com → new repository
2. `Add file` → `Upload files` → drag in all four files at once
3. `Commit changes`
4. `Settings` → `Pages` → Branch: `main` → `Save`
5. Your site is live at the link GitHub gives you. Your admin dashboard is at the same address + `/admin.html`.

## Using the admin dashboard

Go to `yoursite.com/admin.html`, sign in with the email/password you created in Supabase → Authentication → Users. You'll see:

- Total visits, today's visits, top traffic source, mobile vs desktop split
- A table of the last 200 visits (time, source, country, device, browser)
- A table of every time someone signed into this admin panel (time, device, browser) — so you'll notice if a login happens that wasn't you

## A few honest limits worth remembering

- Visit data is anonymous by nature. There's no name or email attached to a visit, and there's no way to add one without asking every visitor to fill out a form — which almost none would do.
- The `anon` key in `supabase-config.js` is meant to be public (it's how every Supabase frontend app works) — it can only do what your RLS policies from setup allow (insert visits, nothing else, unless authenticated). Never publish your database password or a `service_role` key anywhere in these files.
- If you ever want to reset the admin password, do it from Supabase → Authentication → Users, not from any file.
