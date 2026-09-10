# Fieldwork crop-burn collection: 140 scenes

8,242 provisional regions from 140 native 1024 × 1024 satellite scenes in Fatehabad, Haryana, India. This is a tenfold scene expansion from the original 14 when all 140 jobs are complete. Direction: Nipun Batra. Annotation: GPT-6 Astra, high reasoning, through the user's Codex subscription. Imagery: Esri World Imagery Wayback and its source providers.

## Open and explore

- Online: https://nipunbatra.github.io/fieldwork-scene/crop-burn-review/
- Open `review.html` directly for the portable browser. It embeds compressed JPEG display previews and all model records. Inference used the original PNGs, not these previews.
- Choose Burnt, Partially burnt, Unburnt, Uncertain or Non-field to browse matching regions across every image. Search tags/evidence/IDs, filter acquisition month and source checks, or open More filters for sampling group, visible area and overlapping masks.
- Open a card for native imagery online, masks, oriented boxes, pan/zoom, tags, evidence, coordinates and per-region GeoJSON or binary PNG export. Arrow keys move between matching results. A tag opens the cross-image search for that appearance.
- Export matches includes all matching pages. GeoJSON retains pixel polygons, WGS84 polygons, boxes, holes, image hashes, source dates, model IDs, quality flags and AI-proposed status.
- Prompts, tokens & model output loads exact per-scene records only when opened online. The portable file embeds them.

## Contents

| Proposed appearance | Regions |
| --- | ---: |
| burned-looking field | 37 |
| partially burned-looking field | 21 |
| unburned-looking field | 6,796 |
| uncertain field | 1,237 |
| non-field confounder | 151 |

These labels describe appearance, not verified fire events. No new annotation has been accepted as human ground truth. Whole visible field polygons are approximate model proposals; non-fields are separate confounders. Uncertain parcels must be adjudicated, not silently dropped into training background.

`new-proposals.geojson` contains all regions. `manifest.json` retains selection, source footprints and comparisons. `model-runs.json` preserves exact prompts, outputs, warnings and reported usage for successful retained runs. `comparison.csv` is the candidate/scene index. `geometry-audit.json` records overlap checks. `review-queue.csv` provides blank human-review fields and priorities; it does not contain accepted decisions. Historical reports `student-feedback.md` and `expansion-feedback.md` describe the earlier four- and fourteen-scene checkpoints, respectively.

`sentinel-scene-footprints.geojson` and `sentinel-handoff.json` retain georeferenced scenes and dates for a future matching stage. `spatial-holdout-groups.json` connects nearby crops and their anchors to reduce split leakage. No RF-DETR training or Sentinel imagery retrieval has been run.

## Source and sampling

The original 14 scenes are preserved. The frozen expansion adds 22 unused student candidates and 104 raw-image crops around five study neighborhoods. All 126 new crops are pairwise disjoint and disjoint from the original scenes. Sampling is purposive and geographically correlated. This collection is in Haryana, not a representative Punjab dataset or a prevalence estimate.

Each source PNG is assembled without resizing from 16 native zoom-18 tiles of Wayback release 32553 (2024-08-15). Release date is not acquisition date. Native-zoom provider metadata identifies 43 mixed-date crops and 20 discrepancies among the 36 nominated student candidates. The 104 raw-image samples have no student date to compare. Keep unresolved seams and dates out of temporal labels until reviewed.

For nominated candidates, Codex received the unmasked image and candidate coordinates, with the student class/confidence withheld. Raw-image samples had no nomination. Exact questions and system prompts are retained. The model supplied parcel vertices, visibility and appearance tags. Axis-aligned boxes come from polygon extrema; oriented boxes are minimum-area rectangles around the convex hull. Binary mask exports use pixel-center even-odd rasterization (0/255, holes preserved, no antialiasing). Georeferencing uses the Web Mercator tile origin. Positional accuracy inherits imagery and annotation error.

## Checks and limitations

Every retained model record passes schema, bounds, nondegeneracy, self-intersection and hole checks. All input hashes match. The overlap audit flags 31 regions with at least 16 shared pixels and 1% mask overlap. It does not establish complete parcel coverage or correct boundaries. 0 regions need tag-format review. Labels remain heavily imbalanced.

Suggested holdout components connect scene anchors and crops whose edge-to-edge separation is at most 1024 native pixels (about 0.53 km here). There are 16 current components. These are split-planning aids, not a randomized or validated split. Widen separation and consider acquisition/domain grouping before final evaluation.

Reported successful-run usage: 2,008,546 input tokens and 1,074,796 output tokens, including 228,369 reasoning-output tokens. These totals cover retained runs, not rejected/retried attempts or software-development work. No OpenAI API key was used for annotation; Codex subscription usage applies.

## Obtain exact model inputs

The archive keeps display previews small. The online inspector links each original PNG. Run `python3 download-native-images.py` alongside `manifest.json` to retrieve the native PNGs from the published dataset and verify every SHA-256. Do not train on the portable JPEG previews.

## Reproduce in the existing gpt-label-vision project

Use its existing Node dependencies and Codex sign-in. Preserve the frozen selection and original runs.

```sh
node --import tsx scripts/prepare-crop-burn-large.ts
node --import tsx scripts/check-crop-burn-dates.ts --large
python3 scripts/run-crop-burn-expansion.py --large --workers 8
node --import tsx scripts/export-crop-burn-review.ts
node --import tsx scripts/build-crop-burn-browser.ts
python3 scripts/package-crop-burn-browser.py
node --import tsx --test tests/crop-burn-browser.test.ts
python3 -m http.server 4320 --bind 127.0.0.1 --directory site
```

Then open http://127.0.0.1:4320/crop-burn-review/. `--completed-only` is available on the exporter for honest intermediate previews. Inference resumes matching completed input-hash/question pairs; per-case locks prevent duplicate concurrent calls. Do not rerun C01–C14 with the newer prompt if reproducing the frozen baseline.

Public artifacts exclude raw Codex session events, local image paths, authentication data and the private student application source. Follow-up sampling and annotation made no student-server label writes. The original six labels were restored and verified during the historical UI audit.
