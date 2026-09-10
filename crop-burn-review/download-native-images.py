"""Download the original published PNG inputs and verify their frozen hashes."""
import concurrent.futures, hashlib, json, pathlib, urllib.request
base=pathlib.Path(__file__).resolve().parent
cases=json.loads((base/'manifest.json').read_text())['cases']
target=base/'native-images';target.mkdir(exist_ok=True)
def fetch(c):
    dest=target/(c['id']+'.png')
    if dest.exists() and hashlib.sha256(dest.read_bytes()).hexdigest()==c['imageHash']:return c['id']+' cached'
    url='https://nipunbatra.github.io/fieldwork-scene/crop-burn-review/images/'+c['id']+'.png'
    with urllib.request.urlopen(url,timeout=60) as response:content=response.read()
    if hashlib.sha256(content).hexdigest()!=c['imageHash']:raise ValueError('SHA-256 mismatch for '+c['id'])
    temp=dest.with_suffix('.tmp');temp.write_bytes(content);temp.replace(dest)
    return c['id']+' verified'
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
    for result in pool.map(fetch,cases):print(result,flush=True)
