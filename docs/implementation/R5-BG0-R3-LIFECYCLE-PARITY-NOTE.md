# R5 BG0 renderer lifecycle parity note

Golden baseline: `tametheboardgame/future-conquest` `main` at `e6440635e7d85924fe2920979a6facb14e6993ef`.

## Startup differences capable of causing the freeze

| Path | Known-good production | Superseded R5 path | Restored path |
| --- | --- | --- | --- |
| Host timing | Terrain host mounts under the launcher on initial render. | Host rendered a placeholder until `R5_GAME_REVEALED_EVENT`. | Terrain host again mounts under the launcher. |
| Prewarm | `prewarmTerrainMapModule()` starts module, MapLibre worker, and terrain manifest work before reveal. | Dynamic import began only after reveal. | R5 backdrop prewarms on mount, before BEGIN CAMPAIGN. |
| Boundary | `r3-terrain-loader.ts` loads `TerrainMapPrototype`, which owns profile selection and runtime prewarm. | R5 directly imported `TerrainMapPrototypeImpl`. | R5 uses the unchanged loader/wrapper boundary. |
| Reveal gate | Launcher only covers already-mounted children. | Reveal event, two RAFs, and a 1-second timer delayed the renderer. | No reveal event or post-reveal delay controls terrain mounting. |
| Context order | MapLibre creates the renderer context once. | A throwaway canvas context was queried and explicitly lost immediately before MapLibre startup. | The probe/context-loss cycle is removed. |
| Renderer and DEM | Production style enables DEM terrain at map construction and attaches both miniature layers together on map load. | PR #12/#14/#15 staged DEM and miniature layers, added watchdog/circuit-breaker state, and changed antialiasing/hillshade thresholds. | `TerrainMapPrototypeImpl` is transplanted exactly from production. |
| Three ownership | Each production custom layer owns its Three renderer and original elevation sampling behavior. | R5 added a shared-renderer lease and throttled model/elevation setup. | World and formation layer files are transplanted exactly; the R5 shared helper is removed. |

The retained differences are deliberately narrow: `R5StartupExperience` supplies the existing global-settings context while preserving the R5 launcher/audio presentation, and `RichMapBackdrop` adapts R5 authoritative state and selection callbacks into the legacy presentation props. R5 action dispatch, combat, saves, and PRNG remain outside the renderer and authoritative.

## Current BG0 settlement instrumentation

The exact-head gate keeps the production acceptance contract: plain Chromium and real pointer actions must reach `ready`, physical formations must render, MapLibre must report its map/style/tiles loaded, and the canvas must have usable geometry before the 60-second interaction window passes. The probe records pre-launch, post-launch, and ready host geometry plus time-series renderer/map counts and miniature/source activity; warning or fallback output is diagnostic only.

Elevation sampling is the sole intentional renderer-level safety bound. Formation and world layers defer DEM reads until terrain reports loaded, admit at most one query per frame, and retain null-attempt timing so the R5 scene cannot turn unavailable DEM data into a synchronous readback storm. Renderer ownership, startup, and R5 gameplay authority remain unchanged.

The production and R5 implementations compute identical viewport padding from the
toolbar height and profile. The remaining integration hazard was that production's
`ResizeObserver` callback unconditionally called `Map#setPadding`, even when a shell
layout notification produced the same four values. R5 now compares all four edges
with MapLibre's current padding before mutating the camera. Diagnostics retain every
request (initial or toolbar observer), the old and proposed values, whether it was
applied or skipped, and the toolbar/container dimensions. Camera-preset mutations
are recorded separately. This keeps production geometry and camera behavior while
preventing an equivalent late observer notification from retiling `campaign-fronts`.

Exact-head run `32741813999` falsified that final causal hypothesis: the late
observer request was skipped, the effective padding and container geometry stayed
unchanged, and `campaign-fronts` still reloaded by itself. The toolbar contraction
is the existing production responsive rule for the React `initialising` → `ready`
transition (the status copy is hidden and only controls remain); the R5 stylesheet
only relocates that absolutely positioned overlay. The MapLibre style construction
for `campaign-fronts` also matches production: one default GeoJSON source, with no
R5-only clustering, buffering, tolerance, line metrics, or zoom options.

The follow-up diagnostics therefore observe rather than mutate the renderer. Every
public camera/transform entry point records arguments, caller, and complete camera
state before/after; MapLibre movement and resize events record internal transform
activity; and the `campaign-fronts` source cache records reload/update/load calls.
The first loaded-to-reloading transition immediately captures dirty flags, camera,
layout/DPR/canvas geometry, toolbar lifecycle, and the preceding camera/source-cache
histories. This distinguishes covering-tile camera changes, source/style mutation,
and browser geometry updates without weakening the strict production gate.
