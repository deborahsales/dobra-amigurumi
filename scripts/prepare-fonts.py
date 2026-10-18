"""Optional maintainer helper; deployment uses the committed vector subsets.

Requires fontTools and DejaVu Sans. Upstream files are pinned and verified using
scripts/font-sources.json, then cached in .font-cache (not committed).
The renamed Dobra subsets include the complete upstream license notices.
"""
import hashlib
import json
from pathlib import Path
from urllib.parse import quote
from urllib.request import urlopen

from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.basePen import BasePen
from fontTools.pens.boundsPen import BoundsPen

ROOT = Path(__file__).resolve().parents[1]
CACHE = ROOT / '.font-cache'
SOURCES = json.loads((ROOT / 'scripts/font-sources.json').read_text())
FALLBACK = Path('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf')
CHARS = ''.join(map(chr, list(range(32, 127)) + list(range(160, 384)) + [0x2013, 0x2014, 0x2018, 0x2019, 0x201c, 0x201d, 0x2022, 0x2026, 0x2605, 0x2606, 0x2661, 0x2665, 0x2764]))
PORTUGUESE = 'ÁÀÂÃÉÊÍÓÔÕÚÜÇáàâãéêíóôõúüç'


def git_sha(data):
    return hashlib.sha1(b'blob ' + str(len(data)).encode() + b'\0' + data).hexdigest()


def source_file(source, license=False):
    filename = source['license'] if license else source['filename']
    expected = source['licenseSha'] if license else source['sha']
    path = CACHE / (source['id'] + '-license.txt' if license else filename)
    if not path.exists():
        upstream = f"{source['folder']}/{source['id']}/{filename}"
        url = f"https://raw.githubusercontent.com/{SOURCES['repository']}/{SOURCES['ref']}/{quote(upstream)}"
        with urlopen(url, timeout=30) as response:
            data = response.read()
        if git_sha(data) != expected:
            raise ValueError(f'Unexpected upstream file: {upstream}')
        path.write_bytes(data)
    if git_sha(path.read_bytes()) != expected:
        raise ValueError(f'Unexpected cached file: {path.name}')
    return path


class OutlinePen(BasePen):
    def __init__(self, glyphs, units):
        super().__init__(glyphs)
        self.units = units
        self.commands = []

    def point(self, p):
        return [round(v / self.units * 1000, 1) for v in p]

    def _moveTo(self, p): self.commands.append(['M', *self.point(p)])
    def _lineTo(self, p): self.commands.append(['L', *self.point(p)])
    def _curveToOne(self, p1, p2, p3): self.commands.append(['C', *self.point(p1), *self.point(p2), *self.point(p3)])
    def _qCurveToOne(self, p1, p2): self.commands.append(['Q', *self.point(p1), *self.point(p2)])
    def _closePath(self): self.commands.append(['Z'])
    def _endPath(self): pass


def outlines(font):
    cmap, glyphset, units = font.getBestCmap(), font.getGlyphSet(), font['head'].unitsPerEm
    result = {}
    for char in CHARS:
        name = cmap.get(ord(char))
        if not name:
            continue
        pen = OutlinePen(glyphset, units)
        glyphset[name].draw(pen)
        bounds = BoundsPen(glyphset)
        glyphset[name].draw(bounds)
        result[char] = {
            'advance': round(font['hmtx'][name][0] / units * 1000, 1),
            'commands': pen.commands,
            'bounds': [round(v / units * 1000, 1) for v in (bounds.bounds or (0, 0, 0, 0))],
        }
    return result


CACHE.mkdir(exist_ok=True)
fonts = {'fallback': outlines(TTFont(FALLBACK))}
licenses = []
for source in SOURCES['fonts']:
    font = TTFont(source_file(source))
    if 'fvar' in font:
        axes = {a.axisTag: a.defaultValue for a in font['fvar'].axes}
        if source['weight'] is not None:
            axes['wght'] = source['weight']
        font = instantiateVariableFont(font, axes, inplace=False)
    missing = [c for c in PORTUGUESE if ord(c) not in font.getBestCmap()]
    if missing:
        raise ValueError(f"Portuguese accents missing from {source['id']}: {missing}")
    fonts[source['id']] = outlines(font)
    family = font['name'].getDebugName(1)
    weight = f"; weight {source['weight']}" if source['weight'] else ''
    upstream = f"https://github.com/{SOURCES['repository']}/blob/{SOURCES['ref']}/{source['folder']}/{source['id']}/{quote(source['filename'])}"
    licenses.append(f"Dobra {source['label']} — derived from {family}{weight}.\nSource: {upstream}\n\n" + source_file(source, license=True).read_text())

copyright = Path('/usr/share/doc/fonts-dejavu-core/copyright').read_text()
vera = copyright.split('Files: *\n', 1)[1].split('\nFiles: debian/', 1)[0]
notice = '''Dobra vector font subsets — modified versions for Dobra Ateliê.

Changes: Latin glyph subsets listed in scripts/prepare-fonts.py; variable fonts
instantiated at the selected weights; metrics normalized to 1000 units; outlines
rounded to 0.1 unit; bounds included. Missing extended Latin glyphs and symbols
fall back to DejaVu Sans. Every family contains its own Portuguese accents.
The modified subsets are renamed Dobra followed by their Portuguese style label.
The upstream authors do not maintain or support these modified subsets.
The complete notices below are embedded in src/fonts.js and the standalone HTML.
The upstream font binaries and licenses are pinned in scripts/font-sources.json.

''' + '\n\n'.join(licenses) + '\n\nDejaVu Sans fallback glyphs.\nSource: https://dejavu-fonts.github.io/\n\n' + vera + '\n'
(ROOT / 'FONT-LICENSE.txt').write_text(notice, encoding='utf-8')
assert '*/' not in notice
text = '/* Generated Dobra font subsets.\n' + notice + '\n*/\nconst FONT_PATHS = ' + json.dumps(fonts, ensure_ascii=False, separators=(',', ':')) + ';\nexport const FONT_LIBRARY = [\n'
for source in SOURCES['fonts']:
    text += '  {id:' + json.dumps(source['id']) + ',name:' + json.dumps(source['label'], ensure_ascii=False) + ',glyphs:{...FONT_PATHS.fallback,...FONT_PATHS.' + source['id'] + '},shear:0},\n'
text += '];\n'
(ROOT / 'src/fonts.js').write_text(text, encoding='utf-8')
print(f"Generated {len(SOURCES['fonts'])} creative styles: {len(text.encode())} bytes.")
