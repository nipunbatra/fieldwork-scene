# Fieldwork crop-burn collection: 600 scenes across nine districts

34,085 provisional regions from **600 native 1024 × 1024 satellite scenes** in Punjab and Haryana, India. Direction: **Nipun Batra**. Annotations: **GPT-6 Astra, high reasoning**, via the existing Codex subscription. Imagery: **Esri World Imagery Wayback and its source providers**. This release preserves all 500 previous images, annotations and model runs and adds 100 scenes. The complete collection has 140 Fatehabad scenes and 460 scenes across eight additional districts.

These are AI proposals awaiting expert review. Labels describe visible appearance, not verified fire events or human ground truth.

## Open and use

Online: https://nipunbatra.github.io/fieldwork-scene/crop-burn-review/

Filter by district, Burnt / Partially burnt / Unburnt / Uncertain / Non-field, tags, source acquisition month, imagery checks, study group, field area or geometry flags. Class counts reflect the other active filters. Choose Scenes or Regions, page through matches, and open an inspector. Click tags to search the whole collection. Export matches includes every matching page.

The inspector offers masks, oriented boxes, opacity, pan/zoom, region GeoJSON, binary mask PNG, coordinates, evidence and exact model provenance. Online and portable files use JPEG display previews. **Native tiles** loads the original 16 source tiles over the internet; all tiles must load before masks appear. Exact PNG model inputs are preserved in district native archives. Do not train on display previews.

Prompts, tokens & model output contains the actual question, system prompt, raw model output, reported usage, model/run ID, input SHA-256 and source metadata. Source metadata dates are acquisition footprints, not the Wayback release date or dates of fire events.

## Coverage and proposed classes

| District | State | Scenes | Regions | Burnt-looking | Partially burnt-looking |
| --- | --- | ---: | ---: | ---: | ---: |
| Bathinda | Punjab | 58 | 3,118 | 11 | 1 |
| Fatehabad | Haryana | 140 | 8,242 | 37 | 21 |
| Jalandhar | Punjab | 58 | 3,441 | 0 | 0 |
| Kaithal | Haryana | 58 | 3,607 | 1 | 16 |
| Kapurthala | Punjab | 58 | 2,838 | 0 | 4 |
| Karnal | Haryana | 57 | 3,327 | 0 | 1 |
| Ludhiana | Punjab | 57 | 2,763 | 2 | 0 |
| Patiala | Punjab | 57 | 3,568 | 1 | 45 |
| Sangrur | Punjab | 57 | 3,181 | 0 | 0 |

| Proposed appearance | Regions |
| --- | ---: |
| burned-looking field | 52 |
| partially burned-looking field | 88 |
| unburned-looking field | 27,479 |
| uncertain field | 5,843 |
| non-field confounder | 623 |

## Sampling and source dates

Frozen worldwide 1024-pixel lattice crops, fully inside source district boundaries, with complete native-zoom metadata coverage. The collection contains 600 scenes: 140 original Fatehabad scenes and 460 October/November scenes across eight additional districts. This expansion preserves all 500 previous scenes and adds 100 unused autumn samples. Preserve every existing scene; distribute additions evenly across eight expansion districts in alphabetical order (remainder to the first districts), filling least-represented geographic groups in frozen original case order. Only complete October/November source footprints qualify. No model outputs, labels or successes used. The earlier 500-scene selection retained 32 already-dispatched Kaithal scenes when the user reduced the initial 1,400-scene target. Stable source-plan IDs are retained, so gaps are expected. Purposive geographic sampling, not a random prevalence or accuracy benchmark. Source dates are provider metadata, not fire-event dates.

All **460 district expansion scenes** have only October/November acquisition dates in the intersecting native-zoom metadata footprints. The original 140 retain their original dates, including other seasons. The collection includes 49 mixed-date crops; resolve each field's source footprint before temporal matching. The original 36 nominated student candidates include 20 date discrepancies. Raw district samples have no student prediction/date to compare.

Crops contain no overlapping source pixels across the expansion and original scenes. Entire new crop envelopes are contained in the frozen source district polygons. District names and shape IDs come from the original student application's boundary dataset; they do not assert current official government boundaries. The full boundary GeoJSON and checksum are retained in source-metadata.zip.

Each image combines sixteen 256 × 256 tiles at native zoom 18, with no resizing, from Wayback release **32553 (2024-08-15)**. Full native-layer-5 footprint responses were fetched once per district, then intersected locally with Shapely. Per-scene metadata retains exact source attributes and clipped GeoJSON geometries; full provider footprints are stored once with SHA-256 references. Independent provider point queries matched all 64 original cluster checks (including the 62 autumn clusters retained in this release). Acquire dates describe source footprints and may vary within a crop.

The earlier 500-scene release followed a reduction from a 1,400-scene plan while 32 Kaithal jobs were dispatched. That complete release is preserved. Subsequent additions fill the least represented geographic groups in frozen order. No model outputs, labels, scores or successes were used to choose the samples. IDs retain their original plan identifiers, so gaps are expected. These are deliberate geographic samples, not random estimates of prevalence or generalization accuracy.

## How annotations and geometry were produced

Codex received unmasked images. Original nominated scenes include candidate coordinates with the student class/confidence withheld; all district samples have no nominated candidate. The same versioned whole-parcel question asks for five exact appearance classes, 4–16 ordered polygon vertices, visibility, 3–6 appearance tags and concise visual evidence. Raw output is retained. Only completed runs are published; attempts remain locally auditable.

Axis-aligned boxes use polygon coordinate extrema. Oriented boxes are minimum-area rectangles around each polygon's convex hull. Binary masks use pixel-center even-odd rasterization (0 or 255, holes preserved, no antialiasing). WGS84 polygons, coordinates and approximate physical areas are derived from the native Web Mercator tile origin; positional accuracy inherits imagery and annotation error. Native-tile display and PNGs use identical source pixel placement; compressed previews are display-only.

All records pass schema, finite bounds, nondegeneracy, self-intersection and hole checks; all PNG hashes match their runs. The pixel-center overlap audit flags 313 regions with at least 16 shared pixels and 1% mask overlap. 0 regions need tag-format review. These checks do not prove class correctness, field completeness or boundary accuracy. Dark soil, moisture, water, shadows, residue and char remain confounders.

## Downloads

GitHub Release: https://github.com/nipunbatra/fieldwork-scene/releases/tag/crop-burn-600-2026-09-11

- `fieldwork-600-annotations.zip`: all geographic/pixel polygons, oriented boxes, exact sanitized model records, manifest, review queue, checks, source-date and Sentinel planning files, plus pipeline scripts.
- `fieldwork-600-portable.html.zip`: one self-contained HTML for all 600 scenes, including previews, labels and model records. It is large; district review files are more convenient on phones. Native tile switching and original-download links require internet.
- `fieldwork-<district>-review.zip`: a smaller self-contained district HTML, annotations, source records and district review queue.
- `fieldwork-<district>-native.zip`: exact PNG inference inputs, per-image hashes and source tile provenance. Extract alongside district annotations for research use.
- `source-metadata.zip`: frozen district boundaries, complete official footprint responses, provider spot checks and sampling plans and expansion history.
- `SHA256SUMS.txt`: checksums for every release archive. Inside each native ZIP, `images.json` gives exact per-image SHA-256 values.

For scripted retrieval, place `download-native-images.py` beside `manifest.json` and run `python3 download-native-images.py --district Ludhiana` (omit the district to retrieve all). It verifies each exact PNG hash.

The Pages viewer downloads compressed district indexes and loads only visible previews and opened model records. The 140-scene portable HTML and previous review package remain at their historical Pages URLs as snapshots; current downloads are the release archives above. Raw Codex session events, private image paths, authentication data and internal student server URLs are excluded from public artifacts.

## Review and next modeling stage

`review-queue.csv` has 34,085 rows with blank human decisions, reviewer, date and feedback; every status is pending. Start with burned/partial proposals, uncertainty and overlap flags, then review a balanced sample of no-burn scenes across districts and dates. Check masks off as well as on, trace whole parcels and record disagreements. Correct missed parcels too. Do not silently treat unresolved fields as background negatives.

Suggested spatial holdout components join anchors and crops separated by <=1024 native pixels (roughly half a kilometre here). There are 80 components; no train/validation/test split has been assigned. Keep nearby and same-acquisition imagery together, consider whole-district holdouts, and freeze evaluation before RF-DETR training or model-driven sample selection.

`sentinel-scene-footprints.geojson` and `sentinel-handoff.json` are planning aids only. Match actual source dates, cloud cover, before/after context, alignment and field support. Small fields and mixed pixels matter at Sentinel-2's 10 m visible/NIR and 20 m SWIR resolutions. No RF-DETR training or Sentinel retrieval has been run in this release.

Successful retained runs report 8,589,682 input and 4,582,697 output tokens, including 1,082,886 reasoning tokens (part of output). These exclude failed attempts and software-development work. No OpenAI API key was used for annotations; Codex subscription usage applies.

## Reproduce or resume in gpt-label-vision

Use the existing Node dependencies and Codex sign-in. The frozen plans, exact inputs and successful outputs are authoritative; preserve all completed cases from earlier releases.

```sh
uv venv work/crop-burn-review/district-expansion/venv
uv pip install --python work/crop-burn-review/district-expansion/venv/bin/python shapely==2.1.2 numpy==2.5.3
# Frozen selection and metadata are supplied; do not overwrite them.
python3 scripts/run-crop-burn-expansion.py --districts --workers 24
node --import tsx scripts/export-crop-burn-review.ts
node --import tsx scripts/build-crop-burn-district-browser.ts
python3 scripts/package-crop-burn-districts.py
python3 scripts/verify-crop-burn-districts.py
node --import tsx --test tests/crop-burn-browser.test.ts
python3 -m http.server 4320 --bind 127.0.0.1 --directory site
```

The exporter supports `--completed-only` for honest intermediate previews. Per-case locks prevent duplicate inference; completed cases are reused, and output validation rechecks hashes. New district sampling and annotation made no student-server writes. The historical six labels remain unchanged.

Source services: [Esri Wayback](https://livingatlas.arcgis.com/wayback/) · [Sentinel-2 documentation](https://documentation.dataspace.copernicus.eu/APIs/SentinelHub/Data/S2L2A.html). Imagery remains subject to source-provider terms; annotations do not confer ownership over imagery.
