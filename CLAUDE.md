# Project rules

Instructions I wrote for Claude Code while building this project.

Next.js 16 and React 19 messaging app, built for leboncoin's frontend technical test (first written in Angular 22, then migrated to Next.js and React). The code and the git history are meant to be read, so keep both consistent. Prefer small, clearly named, well-separated code over cleverness or volume. No unused options, no over-engineering.

## Commands

- `npm run start-app`: Next.js dev server on port 4200, on `localhost` or `127.0.0.1` (`allowedDevOrigins` in `next.config.ts`; Next.js blocks its dev resources for any other origin).
- `npm run start-server`: json-server API on port 3005 (`server/db.json`, documented in `docs/api-swagger.yaml`). `json-server` 0.16.3 must be installed globally; it is not a dependency of the project.
- `npm run test`: unit tests once, with coverage. Thresholds are 100% on statements, branches, functions and lines.
- `npm run lint`: ESLint with `eslint-config-next` (Next.js, React, React Compiler, jsx-a11y rules) and typescript-eslint; fails on any warning.
- `npm run build`: Next.js production build, type check included; `npx next start` serves it.
- Set `NEXT_TELEMETRY_DISABLED=1` when running Next.js commands, or run `npx next telemetry disable` once.
- The pre-commit hook runs Prettier on staged files, then the linter, then the tests.

Run Prettier, the linter, the tests and the build before reporting a change as done.

## Architecture

- `core/`: no UI, used by the whole app (`users`, `errors`, `http`, `query`, `storage`, `connectivity`, `theme`, `config`). Imports nothing from the other folders.
- `shared/`: presentational components and utils driven by props. May import only models from `core`.
- `layout/`: the header and what is always on screen.
- `features/conversations/`: the conversations feature. `layout` and `features` never import each other.
- `app/` at the root holds the Next.js routes only. Each route file stays thin and renders a component from `src/app/`, where every rule and test lives. Next.js ignores `src/app/` as a router folder because `app/` exists.

Each data domain follows the same four pieces. Copy the existing ones when adding a domain.

| Piece                                      | Users            | Conversations                | Messages                              |
| ------------------------------------------ | ---------------- | ---------------------------- | ------------------------------------- |
| Model, as the API returns it               | `User`           | `Conversation`               | `Message`                             |
| API service, one method per endpoint       | `Users`          | `Conversations`              | `Messages`                            |
| State, as a hook built on a query          | `useUserSession` | `useActiveUserConversations` | held by the `ConversationDetail` page |
| Component that chooses which state to show | `UserSelector`   | `ConversationList`           | `ConversationDetail`                  |

- Put state in a shared hook when more than one consumer reads it; keep it in the page when only that page uses it. Server state lives in the TanStack Query cache; the active user id is the only shared client state, in `ActiveUserIdProvider`.
- State members are named after the list: `userList`, `isLoadingUserList`, `userListLoadingError`, `reloadUserList()`.
- Every list has four states on screen: skeleton, error with "Try again", a notice that the list is empty, the list. Only one of the four is on screen at a time, and nothing asks the user for an action that is impossible.
- Errors: the HTTP client (`core/http`) turns every failed request into an `AppError` with a `kind`. Components never read a status code. A request left unanswered for 10 seconds is cut and becomes an `unavailable` error. A 404 documented as "none found" is an empty list, not an error.
- Access rules live in route guards, not in components. A guard is a client component that a route renders around its page: it renders the page, or redirects with `redirect()` from `next/navigation`.

## Folder layout

Domain, then type folder, then one folder per file holding the file, its spec, and its stylesheet when it has one:

```
features/conversations/hooks/use-active-user-conversations/use-active-user-conversations.ts
core/users/models/user/user.ts
shared/utils/day-label/day-label.ts
```

- Never flatten this, and never put type folders at the top level (`core/services/`).
- Components are `.tsx`. A component has a `.css` file only when it has rules of its own, and imports it.
- File names have no type suffix (`users.ts`, `http-client.ts`, `user.ts` for a model). A hook file is named after its hook: `use-user-session.ts` exports `useUserSession`.
- The four files of `core/config/` (`api.config.ts`, `cookies.config.ts`, `query.config.ts`, `routes.config.ts`) sit directly in their folder: they are plain constants with no stylesheet or spec.

## Naming (Clean Code)

- Names say what the thing is. No abbreviations (`error`, not `err`), no single letters.
- Booleans read as a question: `isCompact`, `hasConversationToSelect`. This includes component props.
- Use the project's own vocabulary; do not invent words. "inbox" and "interlocutor" were rejected in favour of `ActiveUserConversations` and `contactNickname`.
- Say `userList`, `conversationList`, `messageList` for lists.
- Constants are upper case at module level, never inside a component. No magic numbers or strings: name them (`MILLISECONDS_PER_DAY`, `UNKNOWN_AUTHOR_LABEL`).
- Do not shadow globals (`RESOURCE_URL`, not `URL`).
- Test "has items" with `list.length`, not `list.length > 0`.

## Ordering

- **Imports:** alphabetical by the first imported name, case-insensitive, and the names inside the braces too. In a spec, the file under test is imported last, after a blank line.
- **Component props, and the hooks a component calls for its dependencies** (`useActiveUserConversations`, `useRouter`, `useUserSession`): alphabetical. Local state hooks (`useRef`, `useState`, `useMutation`) follow them.
- **Keys of constant objects, enum-like maps and union members:** alphabetical, not by value (`INTERNAL_SERVER_ERROR, NETWORK_FAILURE, NOT_FOUND, …`), so a new entry has one obvious place and additions do not conflict. Arrays whose position carries meaning are the exception.
- **Other properties:** by logic. State built from the dependencies comes after them, and each derived value after what it derives from.
- **Functions:** in a module, private helpers first, then the exports; inside a component, the handlers the JSX uses first, then the helpers; alphabetical inside each group.

## Components and JSX

- Small functions, one job each. Extract a named function or a named value when a condition needs explaining.
- No logic in JSX: no function calls, arithmetic or conversions. Compute the value in the component body, before `return`, under a name that says what it is. A short condition choosing between two classes is fine when it is simple and written once; move it to a named value when the same check is repeated in several forms. Event handlers are named functions, except an arrow that only passes an item of a list or a failed value to a handler.
- Conditional JSX uses a ternary ending in `null`, never `&&`. A component with several exclusive states uses early returns.
- An `if` / `else if` chain always ends with an `else`. When there is nothing to put in the `else`, write independent `if` blocks or early returns instead.
- One rule is written once. When two places need it, move it to a hook, a service method or a util.
- No comments explaining what code does; make the names do it. The one accepted exception is a JSX comment that explains a styling trick the markup cannot make obvious, such as the custom dropdown arrow in `user-selector.tsx`.

## React

- React 19, function components only. Refs are passed as props (no `forwardRef`), context is written `<Context value>` and read with `use`.
- The React Compiler memoizes components and hooks: no hand-written `useMemo`, `useCallback` or `React.memo`, unless the compiler cannot handle a case, and then say so. Next.js runs it (`reactCompiler: true` in `next.config.ts`, with `babel-plugin-react-compiler` installed). A function a hook uses must be declared before that hook call, or the compiler skips the component.
- No `useEffect` for derived state or data fetching: derive values during render and keep server state in TanStack Query. Effects only sync with the outside world, such as the theme class on `<html>`; browser events go through `useSyncExternalStore`.
- Query defaults (`core/config/query.config.ts`): `staleTime: Infinity` loads a list once per key and reloads it only on "Try again"; `gcTime: 0` drops it when nothing shows it, so reopening a conversation or coming back to a user reloads with its skeleton; `retry: false`. Keep `staleTime: Infinity`: with the default, each component that starts reading a list refetches it, and the provided server does not return a conversation created since it started, so the refetch would remove it.
- Sending a message and creating a conversation use `useMutation`, not `useActionState` or an async `useTransition`: React entangles every transition with a pending async Action, router navigations included, so a pending send would hold back opening another conversation. No `useOptimistic`: the message appears only once the server accepts it.
- The guard renders the page with a key made of the active user and the conversation, so a new conversation or a new active user mounts a fresh page: the message being sent, the sending error and the written text start empty.
- Strict TypeScript and ESLint flat config (`eslint-config-next` core web vitals, typescript-eslint strict and stylistic type-checked). Specs only may use `!` and skip `unbound-method`.

## Next.js

- App Router, hybrid: every page is rendered on the server, which reads two cookies, the active user id and the theme (`core/config/cookies.config.ts`). The server puts the `dark` class on `<html>` from the theme cookie, so a saved dark theme never flashes light. The lists still load in the browser with their four states; there is no server prefetch.
- `'use client'` goes only on components that use hooks, context or event handlers. Shared components and hooks get no directive; they become client code when a client component imports them.
- Code that the server also renders must give the same first render on both sides. Loading flags come from `isLoadingQuery` (`core/query`): a list is loading while it has no answer yet (and its query is enabled) or while it is retried after an error, never while data on screen is refreshed. The server, which does not fetch, thus renders the skeleton the browser starts with, and a refresh never unmounts what the list shows. Browser-only values read through `useSyncExternalStore` with a server snapshot: online on the server, light system preference on the server.
- The conversation guard stays a client component, rendered by `app/conversations/[conversationId]/page.tsx` around `ConversationDetail`. The provided server cannot tell the Next.js server about a conversation created since it started, so a server-side guard would send the user away from every new conversation. The guard gives the page the active user through `useConversationParticipant()` and keys it with the active user and the conversation.
- `app/error.tsx` shows any render error under the header with `ErrorMessage` and "Try again". `/` and unknown paths redirect to `/conversations`.
- `devIndicators: false` in `next.config.ts` hides the Next.js logo that `next dev` shows in a corner of the page; compile and runtime errors still show.
- `agentRules: false` in `next.config.ts` stops `next dev` from writing an `AGENTS.md`; CLAUDE.md is this project's instruction file. Next.js documents its current APIs in `node_modules/next/dist/docs/`: read the relevant page before using an API, since Next.js 16 changed several.
- The Next.js dev server does not reload the page when `json-server` rewrites `db.json`.

## Tests

- Minimal: one test per behaviour, the fewest tests that keep coverage at 100%. No test of static attributes, no test repeating what another proves.
- A test that performs an action asserts the state before and after it.
- `it('should create', …)` exists only in specs of static components with no behaviour. Remove it when the first behaviour test is added.
- Group with `describe('When …')`. In titles write "user list", "conversation list", "message list" without "the", and use "when" or "since" rather than "once". More generally, do not write "the" before something the suite has not introduced ("between sender and recipient", not "between the two users").
- Name the instance after the component (`skeleton`, not `component`). Give every date, id and number a meaningful name; date variables end in `Date`.
- Mock the current date in any test that depends on it, and keep dates timezone-safe.
- `src/test-setup.ts` provides browser functions the test environment lacks (`window.matchMedia`, `<dialog>` `showModal` and `close`) and makes TanStack Query notify through microtasks. Add a missing one there rather than guarding for its absence in application code.
- `src/test-navigation.ts` replaces `next/navigation` in every test (mocked in `src/test-setup.ts`): `openUrl(pathname, params)` sets the current URL, `getCurrentPathname()` reads it, and `redirect` and `router` are spies.
- `src/test-providers.tsx` holds the shared helpers: `createTestProviders` (a fresh query client, the active user provider and the theme provider, optionally with saved cookie values), `renderWithProviders`, `readCookie` and `clearCookies`, `waitForPendingWork` (lets pending answers settle), `buildUserSession`, and `createMockedHookState`, which backs a mocked hook with `useSyncExternalStore` so changing it re-renders like a real hook. Mock a hook with `vi.mock` and that helper; never re-render by hand to show a change.
- Tests run without the React Compiler, so coverage measures the code as written. Answer server calls with `Promise.withResolvers()` from a `vi.spyOn` on the API service object.
- **Suite structure for hooks and modules with several behaviours:** one root `describe` per real use case: one for what happens when it starts, if it does something then (the initial state it applies, e.g. "Start with a theme"), and one per action or function, named after what it does ("Toggle theme", "Reload user list", "Set active user"). Inside each, nest "When …" levels, one level per dimension: first the starting state ("When light theme is active"), then the condition that changes the outcome ("When the browser supports view transitions"). Order the cases as a user lives them: the default first, then each action in sequence, then what survives a reload. Each test asserts the whole relevant state before the action and after it. `core/theme/components/theme-provider/theme-provider.spec.tsx` and `core/users/hooks/use-user-session/use-user-session.spec.ts` are the references.
- **Order of the root suites:** alphabetical by title, which for action suites follows the alphabetical order of the actions ("Create conversation" before "Get conversations"). The exception is anything tied to starting or mounting (what the hook or component does when it starts, such as "Load user list…" or "Start with a theme"): those suites always come first. This applies to components as well as hooks. The nested "When …" cases inside a suite keep the order of real use, not the alphabet.
- **Components and pages too:** every action a component offers its user has its own root suite (`ConversationDetail`: "Load message list of the conversation", "Reload message list", "Send message"), even when another suite already triggers it in passing. Check the component's handlers against the root suites before reporting done.
- **Suite titles are written for a tester, not a developer:** never title a suite with a boolean question ("Is online", "Is active user participant of a conversation"). Say what the user or the app does, starting with a verb ("Detect connection changes", "Check access of active user to a conversation"), so someone from QA can read the spec without the code. A title that mirrors an action method is correct as it is ("Update message body", "Set active user", "Reload user list").
- **Small component specs stay flat:** a component with one or two behaviours keeps plain `it(...)` tests under its top `describe`, as in `layout/theme-toggle/theme-toggle.spec.tsx`. Do not wrap them in extra suites or flag them as breaking the rule above.
- **API service specs** copy `core/users/services/users/users.spec.ts` line for line with the names changed: a "Get …" group, the URL set in `beforeEach`, a success test and an error test, on a `fetch` spy. Never edit `users.spec.ts` to make them match, and do not add `expect.assertions`.
- **State hook specs** copy `use-user-session.spec.ts`: `initMocks`, `serverFails`, `serverRespondsWith`, `waitForLoading`, feature groups with nested "When …" cases.
- Component specs check what the user sees in the DOM, not internal state.
- **Spec variables:** the rendered element, the component and the hook or service under test are declared first; the other variables follow, preferably in the order the tests use them. They are not sorted alphabetically.

## UI

- Modern chat app in leboncoin's style: brand orange, avatars, bold contact name with a small muted date, soft-tinted selected state.
- Colours are semantic tokens defined in `src/styles.css` and named by role: `surface`, `surface-muted`, `surface-subtle`, `content`, `content-secondary`, `content-muted`, `line`, `line-subtle`, `brand`, `brand-soft`, `brand-tint`, `brand-strong`, `on-brand`, `danger`, `danger-soft`, `danger-subtle`, `online`, `offline`, `backdrop`. Never use Tailwind palette colours (`bg-white`, `text-gray-500`) in components. A new colour is a new token with a light value in `@theme` and a dark value under `html.dark`.
- Light and dark themes: `ThemeProvider` starts from the saved cookie, otherwise the system preference read at start-up (it does not follow later system changes, by choice, to keep it simple), and toggles the `dark` class on `<html>` through a view transition; `useTheme` reads it. Check both themes when changing UI.
- Every change must work at phone width; header space is tight. Check desktop and phone in the browser before saying it works.
- Loading skeletons mirror the layout they replace, so nothing jumps when data arrives.
- Respect reduced motion (`motion-safe:`).

## Git

- History must stay clean: a fix to something from an earlier commit goes into that commit (fixup and rebase), not into a new one. Keep unrelated changes out of a commit.
- I write the commit messages and usually make the commits. Messages are one descriptive sentence starting with a verb: "Implement …", "Establish …", "Redesign …".
- Commit messages carry no trailer. The use of Claude Code is stated in the README.
- `server/db.json` is rewritten by the API server on every POST. Do not commit test data created while trying the app.

## Working here

- Change only what was asked. When a request is ambiguous, say how you read it, and do not touch already-committed files for a side improvement without saying so.
- When asked for an opinion ("what do you think", "just answer"), answer without changing code.
- The `vercel-react-best-practices` skill is installed in `.claude/skills/` with `npx skills add vercel-labs/agent-skills` and pinned in `skills-lock.json`. Read its rules before writing a component and check finished code against them. Do not edit its files; they are excluded from Prettier.
- Leave the files leboncoin provided (`server/`, `docs/api-swagger.yaml`) in their format; `server/` and `docs/` are excluded from Prettier. The mock data in `server/db.json` may be edited, but never change the server's code (`server/middleware/`, `server/routes.json`): its behaviour is part of the exercise. The app adapts to it and the README explains the differences.
- Conversation creation: the `NewConversation` button in the list header, shown only once the conversation list has loaded, opens a dialog of the other users; picking one opens the existing conversation with that user or creates it. The provided server stores the request body as sent, so the request carries the whole conversation, and its conversations middleware reads `db.json` only at start-up, so a created conversation is added to the local list instead of being refetched.
- Sending a message: the `MessageForm` at the bottom of `ConversationDetail` submits the written text; the page sends it for the active user, shows "Sending…" until the server answers, and adds it to its local message list. When sending fails it shows a compact error with "Try again", and no other message can be sent until the retry succeeds. A response arriving after another conversation was opened is ignored. As for conversations, the request carries the whole message because the server stores the body as sent.
