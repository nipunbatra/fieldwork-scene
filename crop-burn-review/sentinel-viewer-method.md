# Sentinel comparison and pixel dimensions

Open any scene or field in the [Fieldwork viewer](https://nipunbatra.github.io/fieldwork-scene/crop-burn-review/). Choose **Sentinel-2** for the matched image, or **Compare** for a swipe over the ESRI image. Pan, zoom, masks and oriented boxes remain available. The swipe follows the visible viewport, including when focused on a field.

The viewer searches Microsoft Planetary Computer's public Sentinel-2 L2A STAC catalog on demand. No API key is embedded. It uses the chosen **ESRI source acquisition date**, not the Wayback release date, annotation date or today's date. For mixed-date ESRI crops, choose the appropriate footprint date explicitly; the viewer does not assign one crop-wide date to every field.

The default window is ±7 calendar days and the maximum product cloud estimate is 40%. Windows of ±3, ±14, ±30 and ±60 days and other cloud limits are available. Only products whose STAC footprint covers the full crop are offered. Results are ranked by absolute calendar-day distance, then product cloud cover, with reprocessed duplicates collapsed. The signed day gap and exact Sentinel acquisition time in UTC are shown. Unknown cloud estimates are included only under Any / unknown. Cloud percentage describes the whole Sentinel tile, not the selected field; inspect local cloud, shadow, haze, changes and alignment.

True color uses the Sentinel `visual` asset (10 m source pixels) and the public data API. The crop is requested in EPSG:3857 with exactly the same projected bounds as the ESRI crop, at 1024 × 1024 display pixels and nearest-neighbor resampling. This is a geospatial display comparison, not image-based registration or a new 0.5 m Sentinel observation. Source offsets and mixed pixels remain. The original ESRI polygons, masks and class proposals are overlaid for reference and are not automatically validated or transferred to Sentinel. The true-color display is not a reflectance array for scientific index calculation.

**Dimensions & pixel sizes** works offline. For the full scene it measures the crop; for a selected field it uses the existing minimum-area oriented bounding box. Length is the longer mean opposite edge and width is the shorter. Ground lengths use the local Web Mercator scale at the scene center:

`ground metres per map pixel = 2π × 6,378,137 × cos(latitude) / (256 × 2^zoom)`

`length or width in pixels = length or width in metres / pixel size`

The slider covers web-map zooms 8–22, with a comparison table for zooms 12, 14, 16, 18 and 20, plus Sentinel 10, 20 and 60 m grids. The 10 m group includes visible/NIR bands, 20 m includes red-edge/SWIR, and 60 m includes atmospheric bands. These are fractional pixel spans, not exact counts of raster cells touched or fully contained. The separate area-equivalent calculation uses visible polygon area divided by pixel area; it is not the oriented box area. Ground dimensions are approximate and inherit source and annotation errors. Zooming or enlarging the display adds no native spatial detail.

For C283 (Kaithal), the ESRI acquisition is 2022-10-24. A verified nearby Sentinel product is `S2B_MSIL2A_20221026T052909_R105_T43RFP_20221026T181048`, acquired 2022-10-26T05:29:09.024Z (+2 days). The scene is about 530.2 × 530.2 m, or 53.0 × 53.0 Sentinel 10 m pixel spans. Field C283.f45 has an oriented box about 100.4 × 48.2 m, or 10.0 × 4.8 Sentinel 10 m pixel spans. These examples do not establish that the burned-looking class is correct.

Download comparison record retains the selected STAC item, actual acquisition time, query limits, date gap, render URL, ESRI input hash and current measurements. Matches are session-local and are not silently written into the frozen dataset manifest. The 600-scene dataset and all previous release archives remain unchanged. Updated portable viewers contain the same ESRI previews and model records; online Sentinel comparison requires internet. If the catalog or image service is unavailable, retry, choose another acquisition, return to ESRI, or use the linked Copernicus Browser. Copernicus may require its own account for some actions.

Rebuild with the existing Node dependencies:

```sh
node --import tsx scripts/build-crop-burn-district-browser.ts
node --import tsx --test tests/crop-burn-sentinel.test.ts tests/crop-burn-browser.test.ts
python3 scripts/package-crop-burn-viewer.py
python3 -m http.server 4320 --bind 127.0.0.1 --directory site
```

No new annotation inference, RF-DETR training or bulk Sentinel dataset retrieval is performed by this update.

Sources: [Planetary Computer STAC guide](https://planetarycomputer.microsoft.com/docs/quickstarts/reading-stac/), [live data API specification](https://planetarycomputer.microsoft.com/api/data/v1/openapi.json), [Sentinel-2 band resolutions](https://documentation.dataspace.copernicus.eu/APIs/SentinelHub/Data/S2L2A.html), [Web Mercator pixel formula](https://learn.microsoft.com/en-us/bingmaps/articles/bing-maps-tile-system).
