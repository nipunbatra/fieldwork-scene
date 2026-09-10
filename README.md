# Fieldwork — satellite scene labeling

[Open the interactive page](https://nipunbatra.github.io/fieldwork-scene/)

A simple, self-contained viewer for a user-supplied 2130 × 1582 satellite screenshot. Click regions to inspect their tags, visual evidence, polygon boundaries, segmentation masks, and oriented bounding boxes. The category menu includes a kiln-only view.

The page contains **139 regions**, **10 categories**, and **165 distinct tags**, including **4 circular kiln footprints** and **2 FCBK/Zigzag footprints**. FCBK/Zigzag is a combined visual class; construction technology has not been independently verified. Polygon union coverage is **69.0%**, not an accuracy score.

## Credits and provenance

- **Task, image, and project direction:** Nipun Batra, for the Sustainability Lab workflow.
- **Viewer and workflow:** OpenAI Codex, at Nipun Batra’s direction.
- **Polygon annotations, observations, and scene tags:** OpenAI GPT-6 Astra through Codex app-server 0.153.4, using Nipun’s ChatGPT/Codex subscription.
- **Labeling date:** 9 September 2026. This is not the imagery acquisition date.
- **Imagery:** supplied by the user; provider, location, acquisition date, and image license were not recorded. No license for the underlying imagery is asserted here.

Two focused kiln passes used high reasoning. Four native 1065 × 791 scene crops used medium reasoning. The scene polygons were translated into original-image coordinates, and six tile kiln interpretations were replaced with the six focused footprints. Three ambiguous water-like regions are presented as “uncertain surface,” with their original model labels retained in the data.

Masks are derived from the polygons by pixel-center, even–odd scan conversion, including holes. Oriented bounding boxes are the minimum-area rectangles enclosing polygon convex hulls. Geometry validity checks do not establish visual accuracy. The six retained kiln regions use tags constructed from their recorded class, morphology, and boundary visibility; other tags were extracted from model notes.

The page’s **How this was made** section explains the workflow and its limitations. **Technical details** contains exact application prompts, questions, measured token counts, timings, raw outputs, and the public run record. All six successful runs used 85,436 input and 20,148 output tokens. The failed eight-minute full-scene attempt has no reported usage and is excluded from those totals. Internal account/session events and thread identifiers are not included.

These are approximate model annotations, without independent expert validation or ground truth. Dense trees, small buildings, and brick rows are grouped; gaps and overlaps remain, and tile boundaries may split features. Region counts are not an exhaustive object census.

## View or download

Open `index.html` directly in a modern browser. No installation, login, model access, API key, or server is needed. The image, labels, viewer, and run record are all embedded.

- **Download HTML** saves a complete offline copy.
- **Download all labels & run details** exports JSON from Technical details.
- Selecting a region offers its labels and a full-resolution binary mask PNG (white region, black background).

For an optional local preview, run this command from the repository directory:

```sh
python3 -m http.server 8080 --bind 127.0.0.1
```

Then open <http://127.0.0.1:8080/>.

## Hosting and maintenance

GitHub Pages publishes the root of the `main` branch. `.nojekyll` keeps the page as plain static HTML. The original viewer has no package dependencies or build steps. The Punjab map vendors Leaflet 1.9.4 and also needs no build step.

`index.html` is the complete source and artifact: CSS, viewer JavaScript, the `scene-data` JSON block, and the embedded image. To update the viewer, edit it, preview it locally, and push to `main`. To replace the underlying annotations, use the local Fieldwork export workflow and replace `index.html` with its generated single-file export. The inference application and local credentials are not part of this public repository.


## Punjab geographic explorer

[Open the Punjab map](https://nipunbatra.github.io/fieldwork-scene/punjab/) · [Field burning](https://nipunbatra.github.io/fieldwork-scene/punjab/?view=burn)

`punjab/` adds a continuous 100-tile study near Ludhiana, India, plus a nine-tile November field study. Pan/zoom Esri Wayback imagery, inspect polygons and oriented boxes, filter tags, copy latitude/longitude, and download GeoJSON or binary masks. The field tab distinguishes burned-looking, partially burned-looking, unburned-looking, and uncertain appearance. These are model screening labels, without independently confirmed fire events.

See [Punjab provenance and maintenance](punjab/README.md). The map streams imagery from Esri; this repository contains derived labels and sanitized run records, not source imagery tiles. The site needs internet access for that map. The original root screenshot viewer still works offline.
