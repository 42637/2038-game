# Bugs and Issues - Merge 2048

**Audit date:** 2026-10-16  
Confirmed findings below are derived from the current source. UI symptoms have not been reproduced in the browser unless explicitly stated.

## Confirmed code-level defects

### BUG-01 - Restricted modes still allow undo and power-ups

- **Severity:** High
- **Area:** Moves Challenge and Daily Challenge gameplay rules
- **Description:** `GAME_MODE_CONFIGS` sets `allowsUndo: false` and `allowsPowerUps: false` for Moves Challenge and Daily Challenge (and other modes). `GameplayScreen` does not consult these flags when it renders `ActionBar`, creates an undo snapshot for every valid move, or allows `handleUndo`/`handleShuffle` to run. Those modes therefore receive functionality their configuration says they forbid.
- **Reproduction from source:** Start either restricted mode; make a valid move; invoke Undo. The action bar is rendered for every mode and the undo stack is populated. Shuffle inventory is initialized to 3 and shuffle does not gate on mode configuration.
- **Expected:** Mode rules should consistently disable unavailable actions and reject the corresponding state changes.
- **Actual:** The controls and handlers are wired without checking the mode flags.
- **Evidence:** `frontend/src/game/modeManager.ts:127-161`; `frontend/src/components/screens/GameplayScreen.tsx:135-137, 236-247, 595-609, 620-637, 790-817`.
- **Likely cause:** Mode capability flags are defined but not consumed by gameplay control/handler logic.
- **Recommended fix:** Gate controls and handlers on `modeConfig.allowsUndo` / `allowsPowerUps`; add tests for both UI availability and handler rejection.
- **Verification status:** Confirmed by source inspection; not run in the UI.

### BUG-02 - Undo restores only a partial state

- **Severity:** High
- **Area:** Gameplay state consistency
- **Description:** Undo snapshots include board, score, moves, and highest tile. Undo restores those values but leaves `totalMerges`, Time Attack remaining time, special-mode counters, power-up inventory, and other state untouched. A move that is undone can therefore still affect merge statistics or retain a time bonus; special interactions may also be difficult to reverse consistently.
- **Reproduction from source:** In Time Attack, make a merge that awards bonus time and then undo. The board/score/moves revert, but `timeRemaining` does not. In any mode, `totalMerges` is not restored by `handleUndo`.
- **Expected:** Undo should restore a complete, documented state snapshot or intentionally preserve only explicitly excluded resources.
- **Actual:** A subset of fields is restored, leaving the game state internally inconsistent.
- **Evidence:** `frontend/src/types/game.ts` (`UndoSnapshot`); snapshot creation at `GameplayScreen.tsx:235-241`; restore at `GameplayScreen.tsx:595-609`.
- **Likely cause:** `UndoSnapshot` models only the original core fields and was not expanded with newer mode state.
- **Recommended fix:** Define undo semantics, snapshot all state affected by an undoable action, and add tests for score, moves, merge totals, time, and special/power-up state.
- **Verification status:** Confirmed by source inspection; not run in the UI.

### BUG-03 - Frozen tile scan uses column zero for every DOWN lane

- **Severity:** Medium
- **Area:** Ice Mode movement
- **Description:** In `moveBoard`, the DOWN branch of frozen-tile index detection sets the row but never sets `c = i`. Each column lane therefore checks column zero for frozen tiles. Frozen tiles in other columns may be treated as movable; if a frozen tile is in column zero, its obstacle indices can incorrectly split every other lane.
- **Reproduction from source:** Create an Ice board with a frozen tile in a nonzero column and request a DOWN move; the scan for that lane reads `board[row][0]`. Repeat with ice in column zero and multiple occupied columns to see false lane splits.
- **Expected:** Each lane checks its own column (`c = i`) while scanning frozen cells.
- **Actual:** DOWN scan reads column zero for every lane.
- **Evidence:** `frontend/src/game/engine.ts:139-152` (compare line-lane mapping at `engine.ts:126-136` and stationary placement at `engine.ts:170-181`).
- **Likely cause:** Missing column assignment in the DOWN switch case.
- **Recommended fix:** Add a regression test for frozen tiles in each column under DOWN movement and assert stationary coordinates and valid merges in neighboring lanes.
- **Verification status:** Confirmed by source inspection; existing tests cover frozen LEFT movement, not DOWN.

### BUG-04 - Daily streaks are not guarded by completion date

- **Severity:** Medium
- **Area:** Daily Challenge progression
- **Description:** Each successful Daily Challenge completion increments `currentStreak` by exactly one. The saved `lastCompletedDate` is written but not checked before incrementing or against yesterday's date. Completing the same date again can increase the streak, and a gap between completed dates does not reset it.
- **Reproduction from source:** Complete today's challenge, return to the menu, start the same deterministic challenge again, and complete it; the code increments the streak again. Alternatively, complete a challenge after a date gap; no gap check occurs.
- **Expected:** A date-based streak should count at most one completion per date and should apply a defined consecutive-day/reset policy.
- **Actual:** The streak is based only on the prior numeric streak.
- **Evidence:** `frontend/src/components/screens/GameplayScreen.tsx:435-460`; `lastCompletedDate` is in `frontend/src/types/game.ts:77`.
- **Likely cause:** `lastCompletedDate` is persisted but not used to compute the next streak.
- **Recommended fix:** Compare challenge date to the last completion date, make same-day completion idempotent, and define behavior for a missed day; add date-controlled tests.
- **Verification status:** Confirmed by source inspection; not tested against browser storage.

### BUG-05 - Time Attack expiry does not finalize game statistics

- **Severity:** Medium
- **Area:** Time Attack results/statistics
- **Description:** The timer effect marks the game over when time reaches zero. The aggregate statistics update is instead performed inside the move handler only when the resulting board has no valid moves. Timer expiry does not call that path, so a Time Attack session ending on the timer can be omitted from `gamesPlayed`, `totalScore`, and related aggregate statistics.
- **Reproduction from source:** Start Time Attack, allow the 60-second timer to reach zero while valid board moves remain, then inspect aggregate statistics. The timer callback only updates `timeRemaining` and `isGameOver`.
- **Expected:** Every completed Time Attack session should update its completion statistics once, regardless of whether it ends by timer or full board.
- **Actual:** The timer expiry callback does not update stats.
- **Evidence:** Timer completion at `frontend/src/components/screens/GameplayScreen.tsx:187-202`; stats update gated by `isOver` at `GameplayScreen.tsx:531-557`.
- **Likely cause:** Completion accounting is coupled to board-lock detection in the move handler.
- **Recommended fix:** Centralize idempotent game-finalization handling and invoke it for timer and no-moves endings; add a fake-timer test.
- **Verification status:** Confirmed by source inspection; timer path not executed in browser.

### BUG-06 - Gameplay unload/pagehide listeners accumulate across state updates

- **Severity:** Medium
- **Area:** Lifecycle and long-session memory
- **Description:** On every `gameState` change, the effect registers new anonymous `beforeunload` and `pagehide` callbacks. Cleanup creates different anonymous functions, so it cannot remove the registered callbacks. A typical move therefore leaves two additional handlers holding older state closures for the lifetime of the page.
- **Reproduction from source:** Make repeated state changes and observe that each effect cleanup passes a new function identity to `removeEventListener` instead of the callback passed to `addEventListener`.
- **Expected:** Each registered listener is removed on effect cleanup, or the listeners are installed once and read the latest state through a ref.
- **Actual:** Listener identity differs, so removal is ineffective.
- **Evidence:** `frontend/src/components/screens/GameplayScreen.tsx:208-226`.
- **Likely cause:** Inline callbacks are recreated separately in add/remove calls.
- **Recommended fix:** Use stable named callbacks or a ref-backed single listener; add a lifecycle test or instrument listener counts during repeated state updates.
- **Verification status:** Confirmed by source inspection; no memory profile performed.

### BUG-07 - Settings checkboxes lack an accessible text label

- **Severity:** Medium
- **Area:** Accessibility / settings
- **Description:** Each checkbox is nested in a `<label>`, but the label contains only the input and visual slider. The visible setting name is a separate sibling block, so it does not provide the checkbox's programmatic label.
- **Reproduction from source:** Inspect the Sound Effects, Ambient Music, Vibration, or Animations checkbox in the accessibility tree. The visible name is not associated by `htmlFor`/`id` and is not inside the label.
- **Expected:** Assistive technology announces a meaningful name and checked state for each setting.
- **Actual:** The source does not associate the visible text with the checkbox.
- **Evidence:** `frontend/src/components/screens/SettingsScreen.tsx:91-153`.
- **Likely cause:** Label text and custom switch markup were separated during layout styling.
- **Recommended fix:** Wrap the visible text and checkbox in one label or connect them with unique `id`/`htmlFor`; verify with a screen reader.
- **Verification status:** Confirmed by source inspection; no screen reader test performed.

## Suspected or unverified concerns

| ID | Severity | Concern | Evidence / why unconfirmed | Recommended verification |
|---|---|---|---|---|
| SUS-01 | Medium | Development server may be exposed beyond localhost | `frontend/vite.config.ts` sets `host: '0.0.0.0'` and `allowedHosts: true`. No remote access or exploit was tested. | Confirm intended development workflow; restrict interface binding and host allowlist for local-only use. |
| SUS-02 | Low | Small text and touch targets may be difficult at narrow sizes | Action-bar labels use 0.55-0.68rem and CSS compresses controls under 360px. No actual viewport was rendered. | Inspect at 360x800 with physical/device scale and measure target sizes. |
| SUS-03 | Low | Some text or tiles may be difficult to announce to assistive technology | Board uses div/span structures; no grid semantics or live score announcements were found. | Run an accessibility tree and screen-reader review. |

## Subjective design recommendations (not defects)

- Provide a visible Continue affordance if active games auto-resume only after a mode is selected.
- Offer a wider desktop layout or explicitly present the centered 520px mobile-app frame as intentional.
- Check all theme contrast pairs and provide a high-contrast option if needed.
- Ensure offline visual identity does not depend on Google Fonts being available.
