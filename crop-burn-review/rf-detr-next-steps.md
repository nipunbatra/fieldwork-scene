# RF-DETR training direction

Use RF-DETR instance segmentation to predict whole visible field parcels with three eventual supervised classes: burnt, partially burnt, and unburnt. Agree on the visible burned-fraction criteria before assigning those classes. Existing labels describe appearance and remain provisional.

Current review: 600 images across nine districts, 34,085 AI proposals. None is accepted human ground truth. The original 140 Fatehabad scenes are preserved; 460 October/November district expansion scenes cover eight additional districts. Use district/acquisition/spatial holdouts and expert-corrected parcels before training.

## Iterative workflow

1. Sample additional distinct geographic scenes and acquisition dates, deliberately enriching the sparse burnt and partially burnt categories. Include raw-image sampling beyond model positives to find missed fields and confounders.
2. Generate polygons and tentative appearance labels through Codex. Preserve source tiles, imagery SHA-256, dates, prompts, model identity, tokens and original output.
3. Have students correct whole-parcel boundaries and labels, resolve date mismatches and date seams, and record reviewer identity and explicit acceptance. Preserve uncertainty separately from the three supervised classes. Non-fields are confounders/background, not unburnt field instances.
4. Export fully reviewed scenes to COCO instance-segmentation format. Do not simply delete uncertain objects from otherwise retained images: unresolved target objects must not silently become background negatives. Exclude or resolve those scenes/crops unless an explicit loss-ignore method is implemented and verified.
5. Freeze train/validation/test groups by geographic scene and acquisition, with nearby or overlapping scenes kept together. Keep an independently adjudicated test set out of both training and case selection.
6. Fine-tune a pretrained RF-DETR-Seg model on the GPU server; log configuration, dataset version, split manifest and checkpoints. Codex can orchestrate this, but model training uses the server's compute.
7. Evaluate per-class detection/mask precision and recall, mask AP, boundary quality, field class confusion and errors by acquisition/geography. Inspect learning curves rather than claiming that a fixed number of AI labels guarantees performance.
8. Mine detector uncertainty, missed objects, model disagreements and confusing surfaces for the next human-reviewed batch. Retain random audits and the fixed holdout to avoid a biased feedback loop.

Do not train the production model directly on all these drafts. They are a useful proposal pool, but are heavily imbalanced and require adjudication.

Official references checked 10 September 2026:
- [RF-DETR training](https://rfdetr.roboflow.com/latest/learn/train/)
- [COCO segmentation dataset format](https://rfdetr.roboflow.com/latest/learn/train/dataset-formats/)

No RF-DETR training was launched in this review.
