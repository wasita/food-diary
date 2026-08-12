# HANDOFF — food-diary

_Snapshot taken 2026-08-12, before returning the lab laptop._

## What this is
A SvelteKit + Firebase food and symptom logging web app, described in the README as a
"food logging web app for NGL <3" — a personal side project, not research. Firestore for
storage, Google sign-in for auth, dark theme, browser notification reminders, and a small
analytics view. Firebase project is `ngl-food-diary`.

## Where it stands
Branch `main`, in sync with `origin` (`github.com/wasita/food-diary`), no unpushed commits.
Seven commits, all on 2025-12-10 to 2025-12-12; the last is `feat: google login`. Dormant
for eight months. Complete enough to be usable but never touched again.

## Uncommitted work on the old laptop
Three modified files and two untracked paths. **The source changes are a real bug fix and
are worth carrying over.**

- `src/lib/firebase.ts` — replaces the Google `signInWithRedirect` / `getRedirectResult`
  flow with `signInWithPopup`, and changes `signInWithGoogle()` to return
  `Promise<User | null>` instead of `Promise<void>`. The inline comment gives the reason:
  the redirect flow is unreliable in browsers that partition third-party storage when
  `authDomain` differs from the app domain. **Note that committed `main` is broken without
  this**: `src/lib/stores/user.ts` (unmodified, at HEAD) does
  `const result = await signInWithGoogle(); return !!result;` against a function that
  returns `void` at HEAD, so sign-in always reports failure. The working tree is the
  correct state; HEAD is not.
- `src/lib/stores/reminders.ts` — one-line fix casting the notification options object
  `as NotificationOptions` because TypeScript's lib type omits the valid `renotify` field.
- `package-lock.json` — 1 insertion, 14 deletions. Incidental, no dependency change.
- `.env.example` (untracked) — the Firebase env var names with `ngl-food-diary` domain,
  project id, and bucket filled in and the secret-ish values left blank. Worth committing.
- `.claude/` (untracked) — only `settings.local.json`. Machine-local, not worth keeping.

## Worth re-cloning?
Only if you actually intend to resume using or shipping this. If so, do it in this order:
copy the two source diffs and `.env.example` off this laptop before returning it, then
re-clone on the new machine and apply them — otherwise you will re-clone a `main` whose
login is broken and rediscover the same bug from scratch. If you are not resuming it, the
repo is already on GitHub and you lose only these three small fixes.

## Landmines
- No hardcoded credentials. `src/lib/firebase.ts` reads everything from
  `$env/static/public` (`PUBLIC_FIREBASE_*`), and a grep for `AIza`, literal `apiKey:`
  strings, and `private_key` across `src/` finds nothing. Clean.
- There is no `.env` on disk, only `.env.example`. You will need to re-supply
  `PUBLIC_FIREBASE_API_KEY`, `PUBLIC_FIREBASE_MESSAGING_SENDER_ID`, and
  `PUBLIC_FIREBASE_APP_ID` from the Firebase console to run it again.
- `.gitignore` correctly excludes `.env` and `.env.*` while allowing `.env.example`.
- The `ngl-food-diary` Firebase project holds personal health data (food and symptom
  logs). If you abandon the app, delete the Firebase project rather than leaving it live.
