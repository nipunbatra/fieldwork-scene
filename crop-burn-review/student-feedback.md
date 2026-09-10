# Crop Burn Mapper: review and dataset expansion

**Reviewed:** 10 September 2026, the internal student application, Fatehabad / Wayback release 2024-08-15 (32553).

**Main finding:** resolve imagery provenance and annotation semantics before turning additional model proposals into ground truth. The review produced four clean source-image crops and **240 provisional annotations**: 203 unburned-looking field regions, 30 uncertain field regions, four burned-looking, two partially burned-looking, and one non-field confounder. They have valid polygons, tags, WGS84 geometry, OBBs, image hashes, and recorded model runs. They are not independently validated labels.

Open [the interactive review](review.html). Start with both overlays hidden, then compare the student outlines and the Codex parcels. [Download the proposals](new-proposals.geojson), [case comparison](comparison.csv), and [recorded runs](model-runs.json).

## Priority 1 — imagery and label integrity

### Stored capture dates disagree with the imagery being reviewed

| Case | Student proposal | Stored capture date | Esri native-zoom metadata at candidate | Independent assessment |
| --- | --- | --- | --- | --- |
| C01 | Partially burnt, 82.4% | 2022-09-29 | **2021-01-31** | Non-field clearing in the current image |
| C02 | Partially burnt, 74.5% | 2022-11-05 | 2022-11-05 | Burned-looking surfaces across several parcels |
| C03 | Completely burnt, 75.7% | 2023-09-09 | 2023-09-09 | Uncertain soil/residue/burn interpretation |
| C04 | Partially burnt, about 50% | 2022-09-29 | **2022-05-14** | Uncertain; proposal crosses apparent parcel boundaries |

The entire C01 crop has January 2021 source footprints. C04's crop contains **both 9 and 14 May 2022** imagery. Dates were checked against the Esri metadata service at zoom 18, layer 5, using the actual candidate location and intersecting crop footprints; the app's capture-date endpoint agrees. The display release is the same in each case.

This proves a metadata mismatch, not which image was used for the original prediction. The precomputed model's exact input hashes are unavailable in its exposed records. Do not score C01/C04 as model errors until the original inputs are recovered. Check whether a scene-center date was copied to all features or whether predictions were imported from another input capture; neither cause was established from the frontend alone.

**Requested change:** save `(release_id, zoom, row, column, input_sha256)` and acquisition metadata with every prediction. Resolve source footprints per object and flag date seams. Show the immutable prediction input beside the review image. Block acceptance, or require an explicit provenance resolution, when they disagree.

### Decide whether an instance means a whole parcel or a burn footprint

C02 and C03 span several neighboring parcels. C01 encloses a small clearing rather than a field in the current capture. A connected burn-colored patch is not automatically a field instance. “Complete” versus “partial” needs an explicit denominator: the whole visible field, an entire known field, or the proposed patch.

**Requested change:** document the annotation unit. If the target is a field, split at parcel boundaries and classify each parcel. If the target is burn extent, name the objects burn footprints and provide parcel geometry separately. Add outcomes for **uncertain**, **not a field**, **needs split**, and **bad boundary**.

The new Codex annotations use visible parcels; they should not be mixed into a footprint dataset without reconciling that definition.

### Keep review labels separate from original model classes

A temporary C01 “Not burnt → Save & Next” test persisted successfully with reviewer ID and timestamp, but its record remained `cls: 1` with `status: "rejected"`. Keeping the model class is useful, but there is no separate explicit `review_label: 0` in that saved record. The UI also calls generic rejection “Not burnt.” A bad geometry, a non-field, an uncertain image, and a confirmed no-burn appearance should not all become the same training negative.

**Requested change:** retain `model_label` and `model_score`; add independent `review_label`, `review_status`, `geometry_status`, `reviewer_type`, `reviewer_id`, and review timestamps. Audit the training/export path to ensure it consumes adjudicated labels, including explicit negatives. Training code was not inspected in this review.

### New polygons default to complete burning before review

Code inspection of the served client shows that drawing a polygon immediately creates `cls: 2`, `status: "added"`, and saves it; `added` is treated as reviewed. This path was **not exercised on the live dataset** to avoid creating an invented label. See [served client, line 12633](evidence/served-client.txt).

**Requested change:** a newly drawn geometry should start as a draft with no burn class. Save the completed review only after the reviewer selects a class or uncertainty state.

## Priority 2 — make the workflow trustworthy

### Export is broken, with a confirmed one-step API correction

The button sends `POST /api/export?...`, which returns **405 Method Not Allowed**. `GET` on that same URL returns **200**, `application/geo+json`, and an attachment named `validated_fatehabad_32553.geojson`. All six existing labels were exported through GET to [this file](student-existing-labels.geojson). The current client also describes saving to a server path rather than downloading, which does not match the working API contract.

**Requested change:** use the GET download contract and test the downloaded file, not just the HTTP status. Preserve geometry, review provenance, and intended negative-label semantics. See the active handler at line 12662 of the served client.

### Detection is not idempotent, and counts become stale

Two detector runs in exactly the same viewport each reported **two proposals over 0.5 km²**, capture 14 May 2022. The second run added two nontrivial SVG outlines already present, with identical path geometry. This was checked after excluding off-screen empty paths.

After detection, the review counter stayed at 13/70 until a filter action refreshed it to 13/72; another summary still said “49 of 70.” The second run added two more entries. At the start, the UI showed 12/70 reviewed, although the server held six saved labels and 64 unique prediction IDs, all six saved IDs already included among those 64. Reloading reconciled the view to **6/64**. These are real UI inconsistencies; an initialization race is a possibility to investigate, not an established backend diagnosis.

**Requested change:** upsert by stable prediction/input identity, reconcile loaded records by ID, and recompute all counts and queues from one state after detection, save, undo, and filtering. Repeat detection should not add duplicate instances. Reviewer activity also remained “No reviewer activity yet” immediately after the test review was persisted.

### Save failures can advance the local review state

The active client mutates `status` before persistence. Its `save()` helper reports an HTTP failure and returns normally; `commitSelected()` then updates progress and advances. This is a **code-inspected failure path**, not a fault injected into the server. See lines 11665–11769 in the served client.

**Requested change:** throw or return an explicit failure, commit state only after success, roll back on failure, and keep the same selected candidate. Test a 500 response and a network interruption with an isolated fixture.

### Undo should restore the prior persisted state

Undo restored the test candidate's original class/status and removed its reviewer fields. However, it left a new unreviewed record in the labels store even though no such record existed before the test. That newly created record was then removed explicitly. All six original labels were compared to the baseline and remained identical.

**Requested change:** record whether the pre-decision annotation existed. Undo an insertion by deleting only that insertion; undo an update by restoring the previous version.

## Suggested next dataset round

1. Agree on parcel versus footprint semantics and publish a short annotation guide with accepted, uncertain, and rejected examples.
2. Repair image identity and capture-date checks. Keep a prediction's original source image immutable.
3. Have students adjudicate the four cases and the 240 provisional regions. Keep the 59 regions from the mixed-date C04 crop out of accepted training data until their date provenance is resolved. C01's current-image proposals belong to January 2021, not the stored September 2022 prediction date.
4. Expand beyond model-proposed positives: sample raw imagery for missed fields, clear no-burn examples, dark/wet soil, residue rows, shadows, built surfaces, and irregular non-fields. Include both high-confidence random checks and lower-confidence/model-disagreement cases.
5. Store draft AI proposals separately from human acceptance. Require a second reviewer for disputed appearance or parcel boundaries.
6. Split evaluation by geographic scene and capture date; keep overlapping crops and nearby parcels together. Maintain a fixed, independently adjudicated holdout. Agreement between two models is not ground truth, and this four-case sample is not an accuracy estimate.

## Verification and scope

- Exercised Next/Previous, masks off/on, the 70% to 50% confidence filter, two live detector calls, one negative review, Undo, reload, and export.
- Four GPT-6 Astra runs used high reasoning through Codex app-server 0.153.4 and the user's Codex subscription. Student class and confidence were withheld; candidate coordinates were supplied to identify each region. Runs used **57,832 input and 31,688 output tokens**, including 6,981 reasoning tokens in output. No API key was used.
- All 240 model polygons passed geometry validation; image hashes, source polygons, and WGS84 transformations were checked. These checks establish data integrity, not annotation accuracy.
- No burn events were independently confirmed. C02 is a date-consistent model disagreement; C03 remains visually uncertain. C01/C04 have provenance mismatches and cannot support clean model comparisons yet.
- Existing student labels were preserved. No new proposal was accepted into student ground truth, no messages were sent to students, and this review was not published to GitHub Pages.
- The served HTML includes six commented historical app versions before the active version. Move that history into version control to make future fixes easier to review; these comments are not evidence that seven apps execute at runtime.
