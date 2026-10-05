# Project rules

Instructions I wrote for Claude Code while building this project.

Angular 22 messaging app, built for leboncoin's frontend technical test. The code and the git history are meant to be read, so keep both consistent. Prefer small, clearly named, well-separated code over cleverness or volume. No unused options, no over-engineering.

## Commands

- `npm run start-app`: dev server on port 4200.
- `npm run start-server`: json-server API on port 3005 (`server/db.json`, documented in `docs/api-swagger.yaml`). `json-server` 0.16.3 must be installed globally; it is not a dependency of the project.
- `npm run test`: unit tests once, with coverage. Thresholds are 100% on statements, branches, functions and lines.
- `npm run build`: production build.
- The pre-commit hook runs Prettier on staged files, then the tests.

Run Prettier, the tests and the build before reporting a change as done.

## Architecture

- `core/`: no UI, used by the whole app (`users`, `errors`, `connectivity`, `theme`, `config`). Imports nothing from the other folders.
- `shared/`: presentational components, pipes and utils driven by inputs and outputs. May import only models from `core`.
- `layout/`: the header and what is always on screen.
- `features/conversations/`: lazy-loaded feature. `layout` and `features` never import each other.

Each data domain follows the same four pieces. Copy the existing ones when adding a domain.

| Piece                                      | Users          | Conversations             | Messages                              |
| ------------------------------------------ | -------------- | ------------------------- | ------------------------------------- |
| Model, as the API returns it               | `User`         | `Conversation`            | `Message`                             |
| API service, one method per endpoint       | `Users`        | `Conversations`           | `Messages`                            |
| State, as signals built on a `resource`    | `UserSession`  | `ActiveUserConversations` | held by the `ConversationDetail` page |
| Component that chooses which state to show | `UserSelector` | `ConversationList`        | `ConversationDetail`                  |

- Put state in a service when more than one consumer reads it; keep it in the page when only that page uses it.
- State members are named after the list: `userList`, `isLoadingUserList`, `userListLoadingError`, `reloadUserList()`.
- Every list has four states on screen: skeleton, error with "Try again", a notice that the list is empty, the list. Only one of the four is on screen at a time, and nothing asks the user for an action that is impossible.
- Errors: the HTTP interceptor turns every failed request into an `AppError` with a `kind`. Components never read a status code. A request left unanswered for 10 seconds is cut and becomes an `unavailable` error. A 404 documented as "none found" is an empty list, not an error.
- Access rules live in route guards, not in components.

## Folder layout

Domain, then type folder, then one folder per file holding the file, its template, its stylesheet and its spec:

```
features/conversations/services/active-user-conversations/active-user-conversations.ts
core/users/models/user/user.interface.ts
shared/pipes/day-label/day-label.ts
```

- Never flatten this, and never put type folders at the top level (`core/services/`).
- Every component has a `.css` file referenced with `styleUrl`, even when empty.
- File names have no type suffix (`users.ts`, `http-error.ts`); models end in `.interface.ts`.
- The two files of `core/config/` (`api.config.ts`, `routes.config.ts`) sit directly in their folder: they are plain constants with no template, stylesheet or spec.

## Naming (Clean Code)

- Names say what the thing is. No abbreviations (`error`, not `err`), no single letters. The one exception is `m` in lazy route imports: `.then((m) => m.ConversationsLayout)`.
- Booleans read as a question: `isCompact`, `hasConversationToSelect`. This includes component inputs.
- Use the project's own vocabulary; do not invent words. "inbox" and "interlocutor" were rejected in favour of `ActiveUserConversations` and `contactNickname`.
- Say `userList`, `conversationList`, `messageList` for lists.
- Constants are upper case at module level, never instance fields. No magic numbers or strings: name them (`MILLISECONDS_PER_DAY`, `UNKNOWN_AUTHOR_LABEL`). The one exception is a property that only hands a constant to the template (`maxMessageLength`, `conversationListUrl`), since a template can only read class members.
- Do not shadow globals (`RESOURCE_URL`, not `URL`).
- Test "has items" with `list.length`, not `list.length > 0`.

## Ordering

- **Imports:** alphabetical by the first imported name, case-insensitive, and the names inside the braces too. In a spec, the file under test is imported last, after a blank line.
- **Component inputs, outputs and injected services:** alphabetical.
- **Keys of constant objects, enum-like maps and union members:** alphabetical, not by value (`INTERNAL_SERVER_ERROR, NETWORK_FAILURE, NOT_FOUND, …`), so a new entry has one obvious place and additions do not conflict. Arrays whose position carries meaning are the exception.
- **Other properties:** by logic. State built from the dependencies comes after them, and each derived value after what it derives from.
- **Methods:** constructor first, then public, protected, private; alphabetical inside each group.

## Components and templates

- Small functions, one job each. Extract a named private method or computed value when a condition needs explaining.
- No logic in templates: no method calls, arithmetic or conversions. Compute the value in the class or use a pipe. A short condition choosing between two classes is fine when it is simple and written once; move it to the class when the same check is repeated in several forms.
- A helper value used only inside the class is a private method (`getTrimmedMessageBody()`, `isMessageBodyFilled()`), not another `computed`. Keep `computed` for what the template reads.
- An `if` / `else if` chain always ends with an `else`, in templates and in code. When there is nothing to put in the `else`, write independent `if` blocks instead.
- One rule is written once. When two places need it, move it to a service method, a pipe or a util.
- No comments explaining what code does; make the names do it. The one accepted exception is a template comment that explains a styling trick the markup cannot make obvious, such as the custom dropdown arrow in `user-selector.html`.

## Tests

- Minimal: one test per behaviour, the fewest tests that keep coverage at 100%. No test of static attributes, no test repeating what another proves.
- A test that performs an action asserts the state before and after it.
- `it('should create', …)` exists only in specs of static components with no behaviour. Remove it when the first behaviour test is added.
- Group with `describe('When …')`. In titles write "user list", "conversation list", "message list" without "the", and use "when" or "since" rather than "once". More generally, do not write "the" before something the suite has not introduced ("between sender and recipient", not "between the two users").
- Name the instance after the component (`skeleton`, not `component`). Give every date, id and number a meaningful name; date variables end in `Date`.
- Mock the current date in any test that depends on it, and keep dates timezone-safe.
- `src/test-setup.ts` provides browser functions the test environment lacks (`window.matchMedia`, `<dialog>` `showModal` and `close`). Add a missing one there rather than guarding for its absence in application code.
- **Suite structure for services and classes with several behaviours:** one root `describe` per real use case: one for what happens at construction when the class does something there (the initial state it applies, e.g. "Start with a theme"), and one per public method or function, named after what it does ("Toggle theme", "Reload user list", "Set active user"). Inside each, nest "When …" levels, one level per dimension: first the starting state ("When light theme is active"), then the condition that changes the outcome ("When the browser supports view transitions"). Order the cases as a user lives them: the default first, then each action in sequence, then what survives a reload. Each test asserts the whole relevant state before the action and after it. `core/theme/services/theme/theme.spec.ts` and `core/users/services/user-session/user-session.spec.ts` are the references.
- **Order of the root suites:** alphabetical by title, which for method suites follows the alphabetical order of the methods in the class ("Create conversation" before "Get conversations"). The exception is anything tied to construction or a lifecycle hook (what the class does when it starts, such as "Load user list…" or "Start with a theme"): those suites always come first. This applies to components as well as services. The nested "When …" cases inside a suite keep the order of real use, not the alphabet.
- **Components and pages too:** every public method of a component has its own root suite (`ConversationDetail`: "Load message list of the conversation", "Reload message list", "Send message"), even when another suite already triggers it in passing. Check the class's public methods against the root suites before reporting done.
- **Suite titles are written for a tester, not a developer:** never title a suite with a boolean question ("Is online", "Is active user participant of a conversation"). Say what the user or the app does, starting with a verb ("Detect connection changes", "Check access of active user to a conversation"), so someone from QA can read the spec without the code. A title that mirrors an action method is correct as it is ("Update message body", "Set active user", "Reload user list").
- **Small component specs stay flat:** a component with one or two behaviours keeps plain `it(...)` tests under its top `describe`, as in `layout/theme-toggle/theme-toggle.spec.ts`. Do not wrap them in extra suites or flag them as breaking the rule above.
- **API service specs** copy `core/users/services/users/users.spec.ts` line for line with the names changed: a "Get …" group, the URL set in `beforeEach`, a success test and an error test. Never edit `users.spec.ts` to make them match, and do not add `expect.assertions`.
- **State service specs** copy `user-session.spec.ts`: `initMocks`, `serverFails`, `serverRespondsWith`, `waitForLoading`, feature groups with nested "When …" cases.
- Component specs check what the user sees in the DOM, not protected fields.
- **Spec variables:** the fixture, the component and the service under test are declared first; the other variables follow, preferably in the order the tests use them. They are not sorted alphabetically.

## UI

- Modern chat app in leboncoin's style: brand orange, avatars, bold contact name with a small muted date, soft-tinted selected state.
- Colours are semantic tokens defined in `src/styles.css` and named by role: `surface`, `surface-muted`, `surface-subtle`, `content`, `content-secondary`, `content-muted`, `line`, `line-subtle`, `brand`, `brand-soft`, `brand-tint`, `brand-strong`, `on-brand`, `danger`, `danger-soft`, `danger-subtle`, `online`, `offline`, `backdrop`. Never use Tailwind palette colours (`bg-white`, `text-gray-500`) in templates. A new colour is a new token with a light value in `@theme` and a dark value under `html.dark`.
- Light and dark themes: the `Theme` service starts from the saved choice, otherwise the system preference read once at start-up (it does not follow later system changes, by choice, to keep it simple), and toggles the `dark` class on `<html>` through a view transition. Check both themes when changing UI.
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
- Leave the files leboncoin provided (`server/`, `docs/api-swagger.yaml`) in their format; `server/` and `docs/` are excluded from Prettier. The mock data in `server/db.json` may be edited, but never change the server's code (`server/middleware/`, `server/routes.json`): its behaviour is part of the exercise. The app adapts to it and the README explains the differences.
- Conversation creation: the `NewConversation` button in the list header, shown only once the conversation list has loaded, opens a dialog of the other users; picking one opens the existing conversation with that user or creates it. The provided server stores the request body as sent, so the request carries the whole conversation, and its conversations middleware reads `db.json` only at start-up, so a created conversation is added to the local list instead of being refetched.
- Sending a message: the `MessageForm` at the bottom of `ConversationDetail` submits the written text; the page sends it for the active user, shows "Sending…" until the server answers, and adds it to its local message list. When sending fails it shows a compact error with "Try again", and no other message can be sent until the retry succeeds. A response arriving after another conversation was opened is ignored. As for conversations, the request carries the whole message because the server stores the body as sent.
