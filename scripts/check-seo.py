"""Check built HTML, not a JS-rendered approximation of crawler content."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlparse
import json
import xml.etree.ElementTree as ET

class Page(HTMLParser):
    def __init__(self, text):
        super().__init__(); self.meta={}; self.canonical=[]; self.h1=0; self.schemas=[]; self.ld=False; self.buf=''; self.feed(text)
    def handle_starttag(self, tag, attrs):
        a=dict(attrs)
        if tag=='meta': self.meta[a.get('name',a.get('property',''))]=a.get('content','')
        if tag=='link' and a.get('rel')=='canonical': self.canonical.append(a.get('href'))
        if tag=='h1': self.h1+=1
        if tag=='script' and a.get('type')=='application/ld+json': self.ld=True; self.buf=''
    def handle_data(self, text):
        if self.ld:self.buf+=text
    def handle_endtag(self, tag):
        if tag=='script' and self.ld:self.schemas.append(json.loads(self.buf)); self.ld=False

root=Path('dist'); assert root.exists(), 'Run npm run build first'
urls=[x.text for x in ET.parse(root/'sitemap.xml').iter('{http://www.sitemaps.org/schemas/sitemap/0.9}loc')]
assert len(urls)==len(set(urls)), 'Duplicate sitemap URLs'
for url in urls:
    path=urlparse(url).path
    p=root/path.lstrip('/')/'index.html'
    page=Page(p.read_text())
    assert page.canonical==[url], (p,'canonical')
    assert page.h1==1,(p,'h1 count',page.h1)
    assert page.meta.get('description'),(p,'description')
    assert 'noindex' not in page.meta.get('robots',''),(p,'indexability')
    assert page.meta.get('og:url')==url,(p,'Open Graph URL')
    for schema in page.schemas: assert schema.get('@context')=='https://schema.org',p
for name in ['pay','padsandbox']:
    assert 'noindex' in Page((root/name/'index.html').read_text()).meta.get('robots',''),name
print(f'Passed: {len(urls)} sitemap pages, canonical URLs, descriptions, H1s, JSON-LD, social URLs, and checkout noindex.')

# Every local link and media reference in the built pages must resolve.
from urllib.parse import urljoin, unquote
class References(HTMLParser):
    def __init__(self,text):
        super().__init__(); self.refs=[]; self.ids=set(); self.feed(text)
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if 'id' in a:self.ids.add(a['id'])
        for key in ('href','src','poster'):
            if key in a:self.refs.append(a[key])
        if tag=='meta' and a.get('property')=='og:image':self.refs.append(a.get('content',''))

count=0
for p in root.rglob('*.html'):
    base='https://meerkatta.com/'+str(p.relative_to(root)).replace('index.html','')
    refs=References(p.read_text())
    for ref in refs.refs:
        u=urlparse(urljoin(base,ref))
        if u.scheme not in ['http','https'] or u.netloc!='meerkatta.com':continue
        dest=root/unquote(u.path.lstrip('/'))
        if u.path.endswith('/') or dest.is_dir():dest=dest/'index.html'
        assert dest.is_file(),(p,'missing local target',ref)
        if u.fragment and dest.suffix=='.html':
            assert unquote(u.fragment) in References(dest.read_text()).ids,(p,'missing fragment',ref)
        count+=1
print(f'Passed: {count} internal links and asset references resolve in the build.')
