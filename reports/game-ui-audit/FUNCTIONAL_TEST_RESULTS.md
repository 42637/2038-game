# Functional Test Results - Merge 2048

**Audit date:** 2026-10-16  
**Scope:** Existing automated tests, already-observed build/startup evidence, and a source-level interaction review. Browser-level checks were blocked, so no interaction is represented as executed when it was not.

## Summary

- **Automated:** 20 passed, 0 failed, 0 skipped, across 3 Vitest files.
- **Build:** Production build passed in the preceding launch troubleshooting run: Vite transformed 1,632 modules and completed successfully.
- **Server response:** Local preview request returned HTTP 200 with title `Merge 2048`.
- **Manual UI acceptance:** 2 technical checks passed; 10 blocked because the available browser automation denied local-page access.
- **No destructive actions:** The audit did not reset progress, clear storage, or delete files.

## Test matrix

| Feature | Test performed | Result | Evidence | Notes |
|---|---|---|---|---|
| Application startup | Request `http://localhost:3005/` from the running preview | Pass - response only | HTTP 200; document title `Merge 2048` | This confirms the server response, not that the browser rendered the app. |
| Main menu | Inspect available controls and navigate | Blocked | Source: `frontend/src/components/screens/MainMenu.tsx` | No live browser interaction. |
| Core gameplay | Start a game and make representative moves | Blocked | Engine unit tests only | No end-to-end gameplay sequence. |
| Scoring and merging | Run existing engine unit tests | Pass - unit scope | `engine.test.ts`, 7 tests | Includes ordinary merge scoring, invalid moves, no triple merge, stuck-board detection, and highest tile. |
| Special game logic | Run existing special-tile/daily tests | Pass - partial unit scope | `phase3.test.ts`, 7 tests | Bomb/ice helper behavior and deterministic date-seed generation pass; React flows remain untested. |
| Pause and resume | Open pause, resume, and confirm timer behavior | Blocked | Source: `GameplayScreen.tsx`, `Modals.tsx` | No live interaction. |
| Restart | Confirm and cancel restart | Blocked | Source flow located | No live interaction; no progress was reset. |
| Win/loss and progression | Reach target, fail challenge, exhaust board | Blocked | Source logic located | State transitions not exercised end-to-end. |
| Save/load utility | Run existing storage tests | Pass - unit scope | `gameStorage.test.ts`, 6 tests | Default, save/load, schema fallback, active state, clear, reset utility. Tests run in isolated Vitest context. |
| Actual browser persistence | Reload after changing settings/game state | Blocked | No browser access | Local storage persistence was not touched. |
| Responsive UI | Inspect 360x800, 390x844, 768x1024, 1366x768, 1920x1080 | Blocked | CSS breakpoints reviewed only | No screenshots or overflow measurements. |
| Production build | Run existing build command | Pass | Vite output: 1,632 modules transformed | Run during prior launch troubleshooting; not repeated during this read-only audit to avoid replacing `dist`. |
| Keyboard/pointer/touch | Exercise arrows, WASD, swipes, D-pad, hammer | Blocked | `frontend/src/hooks/useSwipe.ts` and controls reviewed | Event wiring exists; actual input behavior not tested. |
| Settings and theme persistence | Toggle a setting/theme, reload, inspect | Blocked | Source and storage tests only | No setting was changed. |
| Console, network, missing assets | Inspect browser devtools | Blocked | HTML references Google Fonts; logo exists in `frontend/public/` | Browser console/network panel unavailable. |

## Automated test detail

Command: `npm test --prefix frontend`

| Test file | Tests | Result |
|---|---:|---|
| `frontend/src/game/__tests__/engine.test.ts` | 7 | Passed |
| `frontend/src/game/__tests__/phase3.test.ts` | 7 | Passed |
| `frontend/src/utils/__tests__/gameStorage.test.ts` | 6 | Passed |
| **Total** | **20** | **20 passed, 0 failed** |

The tests are unit tests. They do not cover React screen flows, keyboard event propagation, responsive rendering, modal accessibility, local-storage behavior in the actual browser, or the specific defects in `BUGS_AND_ISSUES.md`.
