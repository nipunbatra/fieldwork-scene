# Ten-scene expansion: student review follow-up

Added **10 non-overlapping scenes** and **568 provisional regions**. The combined viewer now contains **14 scenes and 808 regions**. No student-server labels were written in this follow-up.

The ten inputs were selected before independent inference from the frozen 64-prediction snapshot: five student partial-burn and five complete-burn proposals, spanning confidence scores and three reported capture-date groups. This purposeful sample is not an accuracy benchmark. The independent model received clean pixels and candidate coordinates, with student classes and scores withheld.

## Main findings

**5 of the ten additional reported capture dates disagree with the native Esri source metadata** (C06, C08, C12, C13, C14). **2 additional crops contain multiple source dates** (C06, C14). Resolve source identity before scoring these as student-model errors.

The independent candidate assessments are 2 burned-looking, 2 not-a-field, 6 uncertain. These are visual appearance assessments, not confirmed fire events. Preserve uncertain and non-field outcomes separately from a confirmed no-burn class.

Parcel boundaries are approximate. The model can split management strips or merge weakly separated fields; its per-run warnings are retained and shown in the viewer. Human adjudication is required before training or evaluation.

| Case | Student class / score | Stored date | Current candidate date | Crop dates | Independent assessment | Regions |
| --- | --- | --- | --- | --- | --- | --- |
| C05 | partial / 82.7% | 2022-11-05 | 2022-11-05 | 2022-11-05 | uncertain | 63 |
| C06 | complete / 67.4% | 2022-11-05 | 2023-04-17 | 2022-11-05, 2023-04-17 | uncertain | 49 |
| C07 | complete / 56.7% | 2022-11-05 | 2022-11-05 | 2022-11-05 | uncertain | 62 |
| C08 | partial / 55.0% | 2022-11-05 | 2022-10-22 | 2022-10-22 | uncertain | 54 |
| C09 | complete / 61.9% | 2023-09-09 | 2023-09-09 | 2023-09-09 | not-a-field | 58 |
| C10 | partial / 41.5% | 2023-09-09 | 2023-09-09 | 2023-09-09 | not-a-field | 65 |
| C11 | partial / 47.7% | 2023-09-09 | 2023-09-09 | 2023-09-09 | uncertain | 56 |
| C12 | complete / 71.8% | 2022-09-29 | 2021-04-29 | 2021-04-29 | burned-looking | 45 |
| C13 | complete / 75.1% | 2022-09-29 | 2022-05-14 | 2022-05-14 | burned-looking | 69 |
| C14 | partial / 74.1% | 2022-09-29 | 2022-05-09 | 2021-06-06, 2022-05-09, 2022-09-29 | uncertain | 47 |

## New provisional region labels

- burned-looking field: 5
- non-field confounder: 16
- partially burned-looking field: 4
- unburned-looking field: 488
- uncertain field: 55

## Suggested student review order

1. Recover the exact prediction input for each date-mismatched candidate. Do not silently substitute the displayed image for the historical model input.
2. Inspect the date-consistent cases with both overlays and assessments hidden. Draw or correct whole-parcel boundaries before revealing model suggestions.
3. Record appearance class, uncertainty reason, geometry quality, reviewer identity and review status separately. Adjudicate pond/built-surface confounders as non-fields rather than training them as unburned fields.
4. Resolve each mixed-date crop at the region level. Keep unresolved imagery identity out of accepted training and evaluation data.
5. Audit proposed splits, image-edge fragments, omissions and false negatives. Keep all parcels from a geographic scene/capture together when forming data splits.

## Verification

All ten 1024 × 1024 inputs use 16 native zoom-18 Esri tiles, assembled without resampling. New crops are pairwise disjoint and disjoint from the original four. Input SHA-256 hashes, exact source candidate matches, polygon validity and coordinate bounds were checked. WGS84 rings, OBBs, tags, prompts, raw outputs, warnings and token usage are retained.

The original four-case UI findings remain in `student-feedback.md`. The additional cases use saved student predictions; the student detector was not rerun for these ten scenes. No new labels have been accepted as human ground truth.
