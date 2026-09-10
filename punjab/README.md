# Punjab imagery explorer

[Open the map](https://nipunbatra.github.io/fieldwork-scene/punjab/) · [Open Field burning](https://nipunbatra.github.io/fieldwork-scene/punjab/?view=burn)

A simple static map of two acquisitions near Ludhiana, Punjab, India. Scene & kilns covers 100 adjoining analysis images. Field burning opens a nested nine-image seasonal study and can also show the full October scene. The capture selector switches both labels and source imagery together.

| Study | Capture date | Wayback release | Grid | Reasoning |
| --- | --- | --- | --- | --- |
| Scene & kilns | 27 October 2023 | 5 August 2026, ID 26334 | 10 × 10 | medium |
| Seasonal fields | 9 November 2020 | 21 December 2021, ID 26120 | 3 × 3 | high |

Dates come from source metadata, not an assumption about the release date. Each analysis image joins 4 × 4 unresampled 256-pixel Esri tiles at native zoom 18 into 1024 × 1024 pixels. Tile centers/corners and intersecting source footprints were checked. Overview footprint metadata at zooms 12–18 also reports the stated capture dates inside each study boundary. Outside those boundaries, source dates can differ. Zoom above 18 enlarges the same source pixels.

## Recorded results

The completed October study contains **4,094 regions**, including **2,395 field regions**, **7 FCBK/Zigzag kiln regions**, and no circular kiln regions. Polygon union coverage is **63.1%**. Its field screen contains 1,680 unburned-looking and 715 uncertain regions, with no apparent-burn labels.

The November study contains **615 field regions**: **3 burned-looking**, **8 partially burned-looking**, **565 unburned-looking**, and **39 uncertain**. Polygon union coverage is **70.6%**. All 109 planned images have accepted outputs; no invalid regions needed to be excluded from the final accepted runs. Eight failed attempts and three superseded successful pilots are accounted for separately across the two studies.

These are region/fragment counts and RGB interpretations, not verified event counts or an accuracy evaluation. [Validation record](validation.json).

## What can be inspected

- Click polygons to see classes, tags, evidence, and longitude/latitude; toggle oriented bounding boxes, segmentation, and the analysis grid.
- Search by region ID, tile, or tag. The keyboard-accessible region browser lists the first 80 matches; filtering narrows it.
- Each region exports as GeoJSON or a 1024 × 1024 binary PNG mask in its source tile's pixel frame. Black is background, white is foreground; holes remain background.
- “How this was made” provides complete GeoJSON, grid, source metadata, credits, and measured usage. Region details contain the exact application prompt, question, model output, image hash, model, effort, timings, and tokens for the corresponding tile.

## Who did what

Nipun Batra directed the study for Sustainability Lab. OpenAI Codex implemented the software and orchestrated annotation. GPT-6 Astra produced polygon annotations through Codex app-server 0.153.4 using the user's ChatGPT/Codex subscription. This static site does not call a model or require a login. It does not expose local credentials or internal account/session events.

The October scene uses a general scene question with medium reasoning. The November study uses a focused field-parcel question with high reasoning; three earlier medium-reasoning pilots are superseded and listed separately. Successful and failed attempts are retained locally. Public records include accepted outputs and a sanitized summary of failed or superseded attempts. Accepted-run totals and all-recorded usage are reported separately, deduplicated by run ID. Missing usage cannot be recovered or converted into subscription credits.

## Geometry and interpretation

Pixel polygons are validated for finite coordinates, image bounds, unique vertices, nonzero area, self-intersections, and valid nonoverlapping interior holes. Failed outputs retry. If valid regions are retained from a partly invalid output, the tile is explicitly flagged for review and excluded regions are identified. No invalid coordinates are silently repaired.

Masks use pixel-center, even–odd scan conversion. Minimum-area oriented boxes are computed around polygon convex hulls in the original Web Mercator pixel plane, then their corners are converted to WGS84. GeoJSON coordinates are longitude, latitude, with closed outer rings counterclockwise and holes clockwise. The displayed coordinate is the center of the axis-aligned pixel bounding box. It is not a surveyed field entrance or centroid.

Counts refer to model regions or tile fragments, not deduplicated physical objects or a complete census. Buildings and trees can be grouped; unlabeled gaps and ambiguous boundaries remain. Polygon coverage measures the union of masks, not accuracy. No independent expert or field validation has been performed. Esri source position accuracy excludes annotation error.

Burned-looking and partially burned-looking are visual RGB screening classes. Dark soil, moisture, ploughing, shadows, and residue can look similar. Unburned-looking means no visible burn evidence in that capture, not that a field never burned. No fire event, crop species, event date, fire severity, pollution level, or independently measured burned fraction is established. No before/after or infrared burn-index validation was performed. FCBK/Zigzag is a combined morphology class, not verified kiln technology.

## Files and maintenance

- `index.html`, `map.css`, `map.js`: inspectable vanilla HTML/CSS/JavaScript viewer.
- `vendor/`: Leaflet 1.9.4 and its BSD license; no CDN dependency.
- `data/manifest.json`, `data/regions.geojson`, `data/runs/`: October study.
- `seasonal/manifest.json`, `seasonal/regions.geojson`, `seasonal/runs/`: November study.

Serve the parent site directory with `python3 -m http.server 8080 --bind 127.0.0.1` and open `/punjab/`. GitHub Pages serves the same files without a build. Opening this map through `file://` is unsupported because JSON is fetched as separate files. The original viewer at the repository root remains a single-file offline download.

The data preparation/inference/export scripts live in the local Fieldwork project under `scripts/punjab/`; they require its existing Codex bridge and Node dependencies. They are not a standalone inference package in this publishing repository. Exact prompts and geometry outputs needed to inspect the labels are in the public run records. Re-export both datasets, run `scripts/punjab/verify.ts` in that local project, inspect the browser, and commit only the publishing checkout. Never add local PNG imagery, authentication files, or account/session logs.

Imagery is streamed from Esri and its providers under their applicable terms. This repository distributes derived labels and public provenance, not source imagery tiles; viewing the map needs internet access. Attribution remains visible on the map.

Sources: [Esri Wayback](https://github.com/Esri/wayback), [Wayback metadata API](https://github.com/Esri/wayback-core), [Leaflet](https://leafletjs.com/reference). Release-specific imagery items and metadata service links are recorded in each manifest and the viewer's methodology dialog.
