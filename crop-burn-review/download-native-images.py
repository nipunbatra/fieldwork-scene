"""Download exact native inputs from district Release archives and verify SHA-256.
Place beside manifest.json. Optionally pass --district Ludhiana (repeatable).
"""
import argparse,hashlib,json,pathlib,re,urllib.request,zipfile
parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--district',action='append');args=parser.parse_args()
base=pathlib.Path(__file__).resolve().parent
manifest=json.loads((base/'manifest.json').read_text());cases=manifest['cases']
release_tag=manifest['districtSelection'].get('releaseTag','crop-burn-500-2026-09-10')
if not re.fullmatch(r'crop-burn-[0-9]+-[0-9]{4}-[0-9]{2}-[0-9]{2}',release_tag):raise ValueError('Invalid release tag')
if any(not re.fullmatch(r'C[0-9]{2,4}',c['id']) or not re.fullmatch(r'[A-Za-z ]+',c['district']) for c in cases):raise ValueError('Invalid scene or district identifier in manifest')
known={c['district'] for c in cases}
if args.district and not set(args.district).issubset(known):parser.error('Choose districts from: '+', '.join(sorted(known)))
selected=[c for c in cases if not args.district or c['district'] in args.district]
target=base/'native-images';target.mkdir(exist_ok=True)
archive_dir=base/'native-archives'/release_tag;archive_dir.mkdir(parents=True,exist_ok=True)
def digest(file):
 h=hashlib.sha256()
 with file.open('rb') as f:
  for b in iter(lambda:f.read(1024*1024),b''):h.update(b)
 return h.hexdigest()
for district in sorted({c['district'] for c in selected}):
 cs=[c for c in selected if c['district']==district];missing=[c for c in cs if not (target/(c['id']+'.png')).exists() or digest(target/(c['id']+'.png'))!=c['imageHash']]
 if not missing:print(district,'all inputs already verified');continue
 archive=archive_dir/('fieldwork-'+district.lower().replace(' ','-')+'-native.zip')
 if not archive.exists():
  url='https://github.com/nipunbatra/fieldwork-scene/releases/download/'+release_tag+'/'+archive.name
  temp=archive.with_suffix('.zip.part');print('Downloading',district,flush=True)
  with urllib.request.urlopen(url,timeout=120) as response,temp.open('wb') as f:
   for chunk in iter(lambda:response.read(1024*1024),b''):f.write(chunk)
  temp.replace(archive)
 with zipfile.ZipFile(archive) as z:
  for c in missing:
   # Fixed expected members only; never extract arbitrary archive paths.
   content=z.read('images/'+c['id']+'.png')
   if hashlib.sha256(content).hexdigest()!=c['imageHash']:raise ValueError('Native input hash mismatch '+c['id'])
   dest=target/(c['id']+'.png');temp=dest.with_suffix('.png.part');temp.write_bytes(content);temp.replace(dest);print(c['id'],'verified',flush=True)
