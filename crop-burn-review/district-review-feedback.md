# Student review handoff: 600-scene district collection

34,085 AI proposals are pending, spanning nine districts. No new feedback was sent externally and no student-server labels were changed.

1. Review every burnt/partially burnt proposal first, with masks off and on. Record visible evidence and competing explanations such as soil, water, shadow or residue. These labels do not verify a fire event.
2. Reconcile uncertain parcels, mixed source dates and boundary overlap flags. Add missed fields and correct whole-parcel edges. Avoid labeling only dark patches inside a larger parcel.
3. Review examples from every district and each date, including unburnt-looking and non-field confounders. Track both additions and disagreements, rather than reporting model counts as accuracy.
4. Use review-queue.csv: fill human_label, geometry_decision, reviewer, reviewed_at and feedback. All review_status fields start pending. Keep original model outputs unchanged.
5. Freeze geographic/acquisition holdouts before RF-DETR training. Plan Sentinel transfer only after source-date and boundary review; validate small-field and mixed-pixel effects separately.

Concrete calibration pair: C141.p52, C141.p53 and C141.p55 were labeled uncertain despite dark looping bands; C156.f19, C156.f20 and C156.f37 were labeled partially burned-looking with similar row-following patterns. Compare these with masks off, then on. Decide which visual evidence would distinguish char from residue windrows, moist furrows and shadows, and apply the same criterion across scenes. This is an appearance-threshold review prompt, not proof that either model label is correct.

In the 100-scene addition, C283.f45 is proposed as burned-looking and C283.f41, C283.f42 and C283.f59 as partially burned-looking. The source image shows dark row-following patterns alongside tan residue and green parcels. Compare whole-parcel cover with the older calibration cases; moisture, soil and residue remain competing explanations. These proposals remain pending, including after the visual source-image check.

District filters, cross-image class/tag search, native-tile display, OBBs, binary-mask export and deep links support this workflow. Exact prompts, source records and usage are available for each scene.
