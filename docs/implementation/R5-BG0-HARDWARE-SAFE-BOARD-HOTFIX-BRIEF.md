# R5 BG0 Hardware-Safe Board Hotfix

## Live failure

The production build still hard-freezes on David's real desktop browser as soon as the rich map begins to initialise, even after PRs #12, #14 and #15. The latest circuit-breaker work cannot recover if the browser process is already blocked inside a native graphics call.

This real-hardware report is authoritative. CI under SwiftShader is not sufficient proof of production safety.

## Strongest current evidence

The forced-rich CI run on PR #15 emitted repeated `GPU stall due to ReadPixels` warnings. Its circuit breaker disabled the terrain stage while world and formation miniatures could reach READY. David's real browser now reports that the whole app freezes immediately when map loading starts.

Treat the unsafe boundary as potentially the MapLibre/WebGL/DEM renderer itself, not merely an individual Three.js miniature layer.

## Product direction

The restored Future Conquest board-game visual direction is correct and must be preserved. However, stability now outranks keeping the live hardware-WebGL terrain renderer as the default implementation.

Do not revert to the old abstract circular-node board.

Instead, create a hardware-safe production board path that keeps the recognisable map-first physical-board presentation while avoiding MapLibre/WebGL initialisation by default.

## Required implementation direction

1. **Default production path must not instantiate MapLibre or create a WebGL context.** No hidden/lazy MapLibre initialisation may occur after BEGIN CAMPAIGN unless the player explicitly opts into the experimental live renderer.
2. Reuse existing committed/generated map assets wherever possible to produce a convincing physical-board backdrop without live DEM/WebGL work. Prefer existing physical terrain texture, political map assets, SVG/GeoJSON/region geometry and existing Future Conquest styling rather than redrawing the game.
3. Keep R5 tabletop authority unchanged: formation selection, legal Move/Attack targets, alternating actions, combat, deterministic state/save/PRNG and action dispatch remain in `src/tabletop`.
4. Render formations and interaction targets through a hardware-safe DOM/SVG/canvas-2D layer over the board. Do not use Three.js/WebGL in the default path.
5. Preserve pan/zoom in a browser-safe way, for example CSS/SVG transforms or another non-WebGL mechanism.
6. Preserve the thin R3-style command shell, title/music/settings, political framing, cities/objective cues and board-game feel. The goal is a visually rich board, not a diagnostic fallback screen.
7. Keep the current MapLibre/Three implementation in the repository behind an explicit opt-in query flag such as `?r5LiveMap=1` for later engineering work. It must never auto-start in the default production path.
8. Add a visible but unobtrusive diagnostic/build label making it clear whether `hardware-safe` or `live-webgl` renderer mode is active.
9. Update the current BG0 browser gate so the default acceptance path asserts there is no WebGL context / no MapLibre renderer and still proves BEGIN CAMPAIGN, 60 seconds of responsiveness, pan/zoom, formation selection and action-tray interaction.
10. Keep a separate opt-in live-WebGL test path for future diagnosis, but it must not be required for default BG0 acceptance.

## Acceptance

Default production mode:
- BEGIN CAMPAIGN works;
- no MapLibre/WebGL context is created;
- map appears as a recognisable, attractive Future Conquest physical board rather than the old abstract prototype;
- formations are visible and selectable;
- legal Move/Attack targets remain usable;
- pan/zoom works;
- action tray and combat UI work;
- application remains responsive for at least 60 seconds after board paint;
- `npm test`, `npm run test:r5`, typecheck, full production build and `git diff --check` pass.

Experimental mode:
- existing rich live renderer remains reachable only via explicit opt-in and is clearly labelled experimental.

## Scope

BG0 remediation only. No BG1+, cards, mobilisation, AI or new gameplay systems.

Do not merge until the hardware-safe default path is implemented and current R5 validation is green. Final acceptance still requires David to test the deployed build on the affected desktop.