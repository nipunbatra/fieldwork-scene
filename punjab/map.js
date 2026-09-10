'use strict';
const $=id=>document.getElementById(id), num=n=>new Intl.NumberFormat('en').format(n), esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const burnLabels=['burned-looking field','partially burned-looking field','unburned-looking field','uncertain field'];
const colors={'circular kiln':'#1bac88','FCBK/Zigzag kiln':'#e99a43','uncertain kiln':'#ce6d99','brick drying yard':'#c8ab79','field':'#b7c765','burned-looking field':'#bd6553','partially burned-looking field':'#dcaa57','unburned-looking field':'#a9c77b','uncertain field':'#9fa9af','vegetation':'#599778','orchard':'#499aa2','road':'#e77885','building':'#779ce1','building cluster':'#ac8dd1','bare ground':'#c0bba5','water':'#52b9e6','uncertain surface':'#c79da6'};
let manifest, collection, map, imagery, regionLayer, boxLayer, gridLayer, boundary, selected, tab='scene', dataset='main', loading=false, refreshTimer, requestedDataset='main', failedTiles=0;
const layerById=new Map(), runCache=new Map();
const label=s=>s.charAt(0).toUpperCase()+s.slice(1);
const date=v=>{const s=String(v);return /^\d{8}$/.test(s)?s.slice(0,4)+'-'+s.slice(4,6)+'-'+s.slice(6,8):'Not recorded'};
const extent=b=>[[b[1],b[0]],[b[3],b[2]]];
const category=f=>tab==='scene'&&f.properties.isField?'field':f.properties.label;
const color=f=>colors[category(f)]||'#c3c8be';
function tabFeatures(){return (collection?.features||[]).filter(f=>tab==='scene'||f.properties.isField)}
function filtered(){const q=$('search').value.trim().toLowerCase(),c=$('category').value;return tabFeatures().filter(f=>(c==='all'||category(f)===c)&&(q===''||[f.id,f.properties.tileId,f.properties.label,f.properties.note,...f.properties.tags].join(' ').toLowerCase().includes(q)))}
function featureBounds(f){const coords=f.geometry.coordinates[0];return L.latLngBounds(coords.map(([lon,lat])=>[lat,lon]))}
function withinView(f){return map.getBounds().intersects(featureBounds(f))}
function style(f){const chosen=f.id===selected,seg=$('segments').checked;return {color:chosen?'#fff':color(f),weight:chosen?2.8:1.15,opacity:seg?1:0,fillColor:color(f),fillOpacity:seg?Math.min(.65,Number($('opacity').value)+(chosen ? .12 : 0)):0,bubblingMouseEvents:false}}
function setError(message){$('error-message').textContent=message;$('load-error').hidden=false}
function status(message){$('status').textContent=message}
async function json(url){const r=await fetch(url,{cache:'no-store'});if(!r.ok)throw Error(`Could not load ${url} (HTTP ${r.status}).`);return r.json()}
async function load(key=dataset){
 if(loading)return;loading=true;requestedDataset=key;$('season').disabled=true;$('scene-tab').disabled=true;$('burn-tab').disabled=true;
 try{
  const folder=key==='november'?'seasonal':'data';const m=await json(folder+'/manifest.json');
  if(manifest&&dataset===key&&manifest.generatedAt===m.generatedAt){loading=false;return}
  const data=await json(folder+'/regions.geojson'),changed=dataset!==key;
  const sourceRuns=new Map(m.tiles.map(t=>[t.id,t.runId]));if(data.features.length!==m.metrics.regions||data.features.some(f=>f.properties.sourceRunId!==sourceRuns.get(f.properties.tileId)))throw Error('Study files are updating. Please retry to load a consistent version.');
  manifest=m;collection=data;dataset=key;$('load-error').hidden=true;
  if(changed){clearSelection();runCache.clear();status('')}
  if(!map)initializeMap();else if(changed){map.attributionControl.removeAttribution(imagery.options.attribution);imagery.options.attribution=attribution();map.attributionControl.addAttribution(imagery.options.attribution);failedTiles=0;imagery.setUrl(imageryUrl());boundary.setBounds(extent(manifest.grid.bounds));map.fitBounds(extent(manifest.grid.bounds),{padding:[20,20]})}
  updateSummary();populateCategories();render();buildTiles();buildMethods();
  if(selected&&collection.features.some(f=>f.id===selected))selectRegion(selected);
  if(m.metrics.tilesCompleted===m.metrics.tilesPlanned){clearInterval(refreshTimer);refreshTimer=undefined}else if(!refreshTimer)refreshTimer=setInterval(()=>load(),30000);
 }catch(e){setError(e.message);$('progress').textContent='Data unavailable — retry loading.'}
 finally{loading=false;$('season').disabled=false;$('scene-tab').disabled=false;$('burn-tab').disabled=false}
}
function imageryUrl(){return manifest.imagery.itemURL.replace('{level}','{z}').replace('{row}','{y}').replace('{col}','{x}') }
function attribution(){return 'Imagery © Esri, Maxar/Vantor, Earthstar Geographics, GIS User Community · <a href="'+manifest.imagery.sourceUrl+'" target="_blank" rel="noopener">Wayback</a>'}
function updateMapNote(){
 const inside=L.latLngBounds(extent(manifest.grid.bounds)).contains(map.getCenter());
 $('map-note').textContent=failedTiles>=4?'Some imagery tiles could not load. Labels remain available.':!inside?'Outside study area · imagery only; capture dates may differ':map.getZoom()>18?'Zoom '+map.getZoom()+' · enlarged native zoom-18 imagery; no extra source detail':'Wayback release '+manifest.imagery.releaseDate+' · capture '+manifest.metrics.sourceDates.map(date).join(', ');
}
function initializeMap(){
 map=L.map('map',{preferCanvas:true,minZoom:12,maxZoom:22,zoomSnap:.25,zoomDelta:.5,zoomControl:true,attributionControl:true});
 imagery=L.tileLayer(imageryUrl(),{maxNativeZoom:18,maxZoom:22,minZoom:0,attribution:attribution(),crossOrigin:'anonymous'}).addTo(map);
 imagery.on('tileerror',()=>{failedTiles++;updateMapNote()});imagery.on('load',updateMapNote);
 boundary=L.rectangle(extent(manifest.grid.bounds),{color:'#fff',weight:2,fill:false,dashArray:'8 6',interactive:false}).addTo(map);
 L.control.scale({imperial:false,position:'bottomleft'}).addTo(map);
 map.fitBounds(extent(manifest.grid.bounds),{padding:[20,20]});
 map.on('mousemove',e=>{$('coordinates').textContent=`Lat ${e.latlng.lat.toFixed(6)} · Lon ${e.latlng.lng.toFixed(6)}`});
 map.on('moveend',()=>{updateShown();updateMapNote()});
 map.on('zoomend',updateMapNote);
}
function updateSummary(){
 const url=new URL(location.href);if(tab==='burn'){url.searchParams.set('view','burn');url.searchParams.set('capture',dataset)}else{url.searchParams.delete('view');url.searchParams.delete('capture')}history.replaceState(null,'',url);
 const m=manifest.metrics,dates=m.sourceDates.map(date).join(', ');
 $('capture').textContent='Study capture '+dates+' · Wayback release '+manifest.imagery.releaseDate+' · Punjab, India';
 $('progress').textContent=`${m.tilesCompleted} / ${m.tilesPlanned} tiles labeled · ${num(m.regions)} regions`+(m.tilesNeedingReview?' · '+m.tilesNeedingReview+' tiles need review':'');
 $('view-title').textContent=tab==='scene'?'Scene & kilns':'Field burning';
 $('view-hint').textContent=tab==='scene'?'Click a shape for tags, latitude / longitude, segmentation, and its oriented bounding box.':'Visual screening of field parcels. Dark soil and harvested residue can resemble burning; uncertain cases stay separate.';
 const counts=m.counts;
 const stats=tab==='scene'?[['Regions',m.regions],['Circular kiln regions',counts['circular kiln']||0],['FCBK/Zigzag regions',counts['FCBK/Zigzag kiln']||0]]:[['Field regions',m.fields],['Burned-looking',counts['burned-looking field']||0],['Partially burned-looking',counts['partially burned-looking field']||0]];
 $('view-counts').innerHTML=stats.map(([k,v])=>`<div><b>${num(v)}</b><span>${esc(k)}</span></div>`).join('');
}
function populateCategories(){
 const previous=$('category').value, counts={};for(const f of tabFeatures())counts[category(f)]=(counts[category(f)]||0)+1;
 const cats=tab==='burn'?burnLabels:Object.keys(counts).sort((a,b)=>a.includes('kiln')!==b.includes('kiln')?(a.includes('kiln')?-1:1):a.localeCompare(b));
 $('category').innerHTML='<option value="all">'+(tab==='burn'?'All field classes':'All categories')+'</option>'+cats.map(c=>`<option value="${esc(c)}">${esc(label(c))} (${counts[c]||0})</option>`).join('');
 if(cats.includes(previous))$('category').value=previous;
 $('legend').replaceChildren();for(const c of cats){const b=document.createElement('button');b.innerHTML=`<i class="dot" style="background:${colors[c]||'#bbb'}"></i>${esc(label(c))} · ${counts[c]||0}`;b.onclick=()=>{$('category').value=c;render()};$('legend').append(b)}
}
function updateShown(){if(!map||!collection)return;const list=filtered();$('shown').textContent=`${num(list.length)} matching regions · ${num(list.filter(withinView).length)} in the map view`;$('empty').hidden=list.length!==0}
function render(){
 if(!map)return;for(const layer of [regionLayer,boxLayer,gridLayer])if(layer)map.removeLayer(layer);layerById.clear();
 const list=filtered();
 $('region-list').replaceChildren();for(const f of list.slice(0,80)){const b=document.createElement('button');b.textContent=f.id+' · '+label(f.properties.label);b.onclick=()=>selectRegion(f.id);$('region-list').append(b)}if(list.length>80){const p=document.createElement('p');p.textContent='Showing the first 80 matches. Search a tile, region ID, or tag to narrow this list.';$('region-list').append(p)}
 if($('segments').checked||$('obb').checked){
  regionLayer=L.geoJSON({type:'FeatureCollection',features:list},{style,onEachFeature:(f,l)=>{layerById.set(f.id,l);l.bindTooltip(esc(f.id+' · '+label(f.properties.label)),{sticky:true});l.on('click',()=>selectRegion(f.id))}}).addTo(map);
 }
 boxLayer=L.layerGroup();if($('obb').checked)for(const f of list)L.polygon(f.properties.obbLonLat.map(([lon,lat])=>[lat,lon]),{color:f.id===selected?'#fff':color(f),weight:f.id===selected?2.4:1.2,fill:false,dashArray:'5 4',interactive:false}).addTo(boxLayer);boxLayer.addTo(map);
 gridLayer=L.layerGroup();if($('grid').checked)for(const t of manifest.tiles){const l=L.rectangle(extent(t.bounds),{color:['completed','review needed'].includes(t.labelStatus)?'#c7dec2':'#e9ceb0',weight:1,fillOpacity:0.015,dashArray:'3 4',bubblingMouseEvents:false});l.bindTooltip(esc(t.id+' · '+t.labelStatus+' · '+t.regionCount+' regions'));l.on('click',()=>selectTile(t.id));gridLayer.addLayer(l)}gridLayer.addTo(map);if(regionLayer)regionLayer.bringToFront();boundary.bringToFront();updateShown();
}
async function setTab(value){
 if(loading)return;tab=value;$('season-control').hidden=value!=='burn';$('scene-tab').setAttribute('aria-selected',String(value==='scene'));$('burn-tab').setAttribute('aria-selected',String(value==='burn'));$('category').value='all';$('search').value='';
 const f=collection?.features.find(f=>f.id===selected);if(f&&value==='burn'&&!f.properties.isField)clearSelection();
 const key=value==='burn'?$('season').value:'main';if(key!==dataset){$('progress').textContent='Loading the selected capture and labels…';await load(key)}else{updateSummary();populateCategories();render()}
}
function clearSelection(){selected=undefined;$('fit-selected').disabled=true;$('inspector').innerHTML='<h2>Inspect a region</h2><p class="hint">Click a colored shape for its tags, coordinates, geometry, and labeling details.</p>'}
function tileFor(id){return manifest.tiles.find(t=>t.id===id)}
function selectRegion(id){
 const f=collection.features.find(f=>f.id===id);if(!f)return;selected=id;const p=f.properties,t=tileFor(p.tileId);$('fit-selected').disabled=false;
 const source=(t.sources||[])[0]||{};
 $('inspector').innerHTML=`<div class="eyebrow">${esc(id)} · ${esc(p.visibility)} boundary</div><h2>${esc(label(p.label))}</h2>${p.edgeFragment?'<p class="fragment">Tile-edge fragment: not necessarily one complete physical object.</p>':''}<div class="tags">${p.tags.map(tag=>`<button class="tag" data-tag="${esc(tag)}">${esc(tag)}</button>`).join('')}</div><p class="evidence">${esc(p.note)}</p><div class="selection-kv"><div><span>Latitude · box center</span><b>${p.center[1].toFixed(6)}</b></div><div><span>Longitude · box center</span><b>${p.center[0].toFixed(6)}</b></div><div><span>Capture date</span><b>${p.sourceDates.map(date).join(', ')}</b></div><div><span>Tile / image size</span><b>${p.tileId} / ${p.tileWidth}² px</b></div><div><span>Source resolution</span><b>${source.SRC_RES??'—'} m</b></div><div><span>Source location accuracy</span><b>${source.SRC_ACC??'—'} m</b></div></div><p class="hint">Coordinates are calculated from the imagery grid, not guessed by the model. Source accuracy does not include polygon-labeling error.</p><div class="selection-actions"><button id="copy-location">Copy lat / lon</button><button id="download-region">GeoJSON</button><button id="download-mask">Mask PNG</button></div><details><summary>Polygon &amp; OBB coordinates</summary><pre>${esc(JSON.stringify({coordinateReference:'EPSG:4326',coordinateOrder:'longitude, latitude',polygon:f.geometry.coordinates,obb:p.obbLonLat,tilePixelPolygon:p.polygon,tilePixelHoles:p.holes,tilePixelOBB:p.obb},null,2))}</pre></details><details id="run-disclosure"><summary>Labeling details · prompt, tokens, output</summary><div id="run-details" class="run-details"><p>Open to load this tile’s saved run.</p></div></details>`;
 $('inspector').querySelectorAll('[data-tag]').forEach(b=>b.onclick=()=>{$('search').value=b.dataset.tag;$('category').value='all';render()});
 $('copy-location').onclick=async()=>{const s=p.center[1].toFixed(6)+', '+p.center[0].toFixed(6);try{await navigator.clipboard.writeText(s);status('Copied '+s)}catch{status('Latitude, longitude: '+s)}};
 $('download-region').onclick=()=>saveJSON({type:'FeatureCollection',features:[f]},id+'.geojson');$('download-mask').onclick=()=>downloadMask(p);
 $('run-disclosure').ontoggle=()=>{if($('run-disclosure').open)showRun(t)};render();$('inspector').scrollIntoView({block:'nearest'});
}
function selectTile(id){
 const t=tileFor(id);selected=undefined;$('fit-selected').disabled=true;
 $('inspector').innerHTML=`<div class="eyebrow">Analysis tile</div><h2>${esc(id)}</h2><p>${esc(t.labelStatus)} · ${t.regionCount} labeled regions</p><p class="hint">Center: ${t.center[1].toFixed(6)}, ${t.center[0].toFixed(6)}</p><p class="hint">Capture: ${(t.sources||[]).map(s=>date(s.SRC_DATE)).filter((v,i,a)=>a.indexOf(v)===i).join(', ')||'Not recorded'}</p>${t.labelError?'<p class="fragment">'+esc(t.labelError)+'</p>':''}<button id="zoom-tile">Zoom to tile</button><button id="filter-tile">Show tile labels</button>${t.runUrl?'<details id="run-disclosure"><summary>Labeling details · prompt, tokens, output</summary><div id="run-details" class="run-details"></div></details>':''}`;
 $('zoom-tile').onclick=()=>map.fitBounds(extent(t.bounds),{padding:[20,20]});$('filter-tile').onclick=()=>{$('search').value=t.id;$('category').value='all';render()};if(t.runUrl)$('run-disclosure').ontoggle=()=>{if($('run-disclosure').open)showRun(t)};render();$('inspector').scrollIntoView({block:'nearest'});
}
async function showRun(t){
 const target=$('run-details');if(!target)return;target.innerHTML='<p>Loading the recorded run…</p>';
 try{const cacheKey=dataset+':'+t.runId;let r=runCache.get(cacheKey);if(!r){r=await json(t.runUrl);if(r.id!==t.runId||r.imageHash!==t.sha256)throw Error('This run record has changed. Reload the study to inspect its current version.');runCache.set(cacheKey,r)}if(!target.isConnected)return;
  const u=r.usage||{};target.innerHTML=`<p><strong>${esc(r.actualModel||r.model)}</strong> · ${esc(r.effort)} reasoning · Codex ${esc(r.codexVersion||'version unavailable')}</p><div class="usage"><div><b>${u.inputTokens==null?'—':num(u.inputTokens)}</b><span>Input tokens</span></div><div><b>${u.outputTokens==null?'—':num(u.outputTokens)}</b><span>Output tokens</span></div><div><b>${(r.elapsedMs/1000).toFixed(1)} s</b><span>Elapsed</span></div></div><p>Reasoning tokens: ${u.reasoningOutputTokens==null?'unavailable':num(u.reasoningOutputTokens)} (included in output). Cached input: ${u.cachedInputTokens==null?'unavailable':num(u.cachedInputTokens)}.</p><details><summary>Exact question</summary><pre>${esc(r.question)}</pre></details><details><summary>Application system prompt</summary><pre>${esc(r.systemPrompt)}</pre></details><details><summary>Raw model output</summary><pre>${esc(r.rawOutput||'No recorded output')}</pre></details>${r.rejectedRegions?.length?'<details><summary>Rejected regions — review needed</summary><pre>'+esc(JSON.stringify(r.rejectedRegions,null,2))+'</pre></details>':''}<p class="hint">Input image SHA-256: ${esc(r.imageHash)}</p><button id="download-run">Download this run</button>`;target.querySelector('#download-run').onclick=()=>saveJSON(r,t.id+'-run.json');
 }catch(e){target.textContent=e.message}
}
function buildTiles(){
 $('tile-list').replaceChildren();for(const t of manifest.tiles){const b=document.createElement('button');b.className=t.labelStatus==='completed'?'done':t.labelStatus==='review needed'?'review':'pending';b.textContent=t.id;b.title=t.labelStatus+' · '+t.regionCount+' regions';b.onclick=()=>{selectTile(t.id);map.fitBounds(extent(t.bounds),{padding:[20,20]})};$('tile-list').append(b)}
}
function buildMethods(){
 const m=manifest.metrics,sources=manifest.tiles.flatMap(t=>t.sources||[]),res=[...new Set(sources.map(s=>s.SRC_RES))],accuracy=[...new Set(sources.map(s=>s.SRC_ACC))],providers=[...new Set(sources.map(s=>s.NICE_DESC+' / '+s.SRC_DESC))];
 const b=manifest.grid.bounds,mid=(b[1]+b[3])/2,height=(b[3]-b[1])*111.195,width=(b[2]-b[0])*111.195*Math.cos(mid*Math.PI/180);
 $('study-description').textContent=`A ${width.toFixed(2)} × ${height.toFixed(2)} km study near Ludhiana, Punjab, India. It is divided into ${manifest.grid.rows} × ${manifest.grid.columns} contiguous tiles, each 1024 × 1024 pixels at zoom 18. Bounds: ${b.map(v=>v.toFixed(6)).join(', ')} (west, south, east, north). ${m.tilesCompleted} of ${m.tilesPlanned} tiles have accepted labels.`;
 $('imagery-description').textContent=`Wayback release ${manifest.imagery.releaseDate}; the ${manifest.imagery.metadataSamples?.length||0} sampled tile-center/corner locations and intersecting metadata footprints report capture ${m.sourceDates.map(date).join(', ')}. Source: ${providers.join('; ')}. Recorded source resolution: ${res.join(', ')} m; source location accuracy: ${accuracy.join(', ')} m. Overview metadata footprints at zooms 12–18 also report the same capture within this study. These values come from Esri metadata, not model inference.`;
 $('geometry-description').textContent=manifest.methods.geometry+' '+manifest.methods.masks;
 $('count-description').textContent=manifest.methods.counting+' '+manifest.methods.scope;
 $('coverage-description').textContent=`Accepted polygons cover ${m.coveragePercent.toFixed(1)}% of the planned study’s pixels. This is coverage, not accuracy. ${m.tilesNeedingReview} tiles have excluded invalid regions requiring review. No independent ground-truth evaluation has been performed.`;
 $('effort-description').textContent=[...new Set(manifest.runs.map(r=>r.effort))].join(' / ')+' reasoning';
 const u=m.usage;$('usage').innerHTML=[['Input tokens',u.inputTokens],['Output tokens',u.outputTokens],['Reasoning tokens',u.reasoningOutputTokens],['Cached input',u.cachedInputTokens]].map(([k,v])=>`<div><b>${num(v)}</b><span>${k}</span></div>`).join('');
 $('usage-note').textContent=`Totals cover ${manifest.runs.length} accepted tile runs. Reasoning tokens are included in output tokens. ${manifest.failedAttempts.length} failed and ${(manifest.otherAttempts||[]).filter(a=>a.disposition==='superseded').length} superseded attempts are listed separately and excluded from these accepted totals. All recorded attempts with usage total ${num(manifest.allRecordedUsage?.inputTokens||u.inputTokens)} input and ${num(manifest.allRecordedUsage?.outputTokens||u.outputTokens)} output tokens. Timings are per request; concurrent durations must not be added as wall time. No dollar or subscription-credit conversion is inferred.`;
 const runs=new Map(manifest.runs.map(r=>[r.tileId,r]));$('run-table').innerHTML=manifest.tiles.map(t=>{const r=runs.get(t.id);return `<tr><td>${t.id}</td><td>${esc(t.labelStatus)}</td><td>${t.regionCount}</td><td>${r?.usage?num(r.usage.inputTokens):'—'}</td><td>${r?.usage?num(r.usage.outputTokens):'—'}</td><td>${r?.elapsedMs?(r.elapsedMs/1000).toFixed(1):'—'}</td></tr>`}).join('');
 $('failed-attempts').textContent=JSON.stringify(manifest.otherAttempts||manifest.failedAttempts,null,2);$('sources').innerHTML=manifest.references.map(r=>`<li><a href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.label)}</a></li>`).join('');
}
function download(blob,name){const a=document.createElement('a'),url=URL.createObjectURL(blob);a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);status('Prepared '+name)}
function saveJSON(data,name){download(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),name)}
function downloadMask(p){
 const w=p.tileWidth,h=p.tileHeight,mask=new Uint8Array(w*h),rings=[p.polygon,...p.holes];
 for(let y=Math.max(0,Math.floor(p.bbox[1]));y<Math.min(h,Math.ceil(p.bbox[3]));y++){
  const cuts=[];for(const ring of rings)for(let i=0,j=ring.length-1;i<ring.length;j=i++){const a=ring[i],b=ring[j],cy=y+.5;if((a[1]>cy)!==(b[1]>cy))cuts.push(a[0]+(cy-a[1])*(b[0]-a[0])/(b[1]-a[1]))}cuts.sort((a,b)=>a-b);for(let i=0;i+1<cuts.length;i+=2)mask.fill(255,y*w+Math.max(0,Math.ceil(cuts[i]-.5)),y*w+Math.min(w,Math.ceil(cuts[i+1]-.5)));
 }
 const c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d'),d=ctx.createImageData(w,h);for(let i=0;i<mask.length;i++){d.data[i*4]=d.data[i*4+1]=d.data[i*4+2]=mask[i];d.data[i*4+3]=255}ctx.putImageData(d,0,0);c.toBlob(b=>{if(b)download(b,p.id+'-'+p.tileId+'-mask.png')},'image/png');
}
$('scene-tab').onclick=()=>{if(manifest)setTab('scene')};$('burn-tab').onclick=()=>{if(manifest)setTab('burn')};
for(const [id,other] of [['scene-tab','burn-tab'],['burn-tab','scene-tab']])$(id).onkeydown=e=>{if(['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();$(other).focus();$(other).click()}};
$('season').onchange=()=>{if(!loading){$('category').value='all';$('search').value='';load($('season').value)}};
$('category').onchange=render;$('search').oninput=render;for(const id of ['segments','obb','grid'])$(id).onchange=render;$('opacity').oninput=render;
$('clear').onclick=()=>{$('search').value='';$('category').value='all';render()};$('fit-study').onclick=()=>{if(map)map.fitBounds(extent(manifest.grid.bounds),{padding:[20,20]})};$('fit-selected').onclick=()=>{const f=collection?.features.find(f=>f.id===selected);if(f)map.fitBounds(featureBounds(f),{padding:[50,50],maxZoom:20})};
$('download-visible').onclick=()=>{if(collection)saveJSON({type:'FeatureCollection',features:filtered().filter(withinView)},'Ludhiana-'+tab+'-visible.geojson')};$('download-all').onclick=()=>{if(collection)saveJSON(collection,'Ludhiana-all-regions.geojson')};$('download-manifest').onclick=()=>{if(manifest)saveJSON(manifest,'Ludhiana-study-metadata.json')};
$('download-grid').onclick=()=>{if(manifest)saveJSON({type:'FeatureCollection',features:manifest.tiles.map(t=>{const [w,s,e,n]=t.bounds;return{type:'Feature',id:t.id,properties:{id:t.id,status:t.labelStatus,regionCount:t.regionCount,center:t.center,sourceDates:[...new Set((t.sources||[]).map(s=>s.SRC_DATE))]},geometry:{type:'Polygon',coordinates:[[[w,s],[e,s],[e,n],[w,n],[w,s]]]}}})},'Ludhiana-'+manifest.tiles.length+'-tile-grid.geojson')};
$('about-button').onclick=()=>$('about').showModal();$('close-about').onclick=()=>$('about').close();$('retry').onclick=()=>load(requestedDataset);
const initial=new URLSearchParams(location.search);let initialDataset='main';
if(initial.get('view')==='burn'){tab='burn';initialDataset=initial.get('capture')==='main'?'main':'november';$('season').value=initialDataset;$('season-control').hidden=false;$('scene-tab').setAttribute('aria-selected','false');$('burn-tab').setAttribute('aria-selected','true')}
if(typeof L==='undefined')setError('The map library did not load. Please reload this page.');else{load(initialDataset)}
