"""Optional maintainer helper. The generated vector subsets are committed to Git.

Requires fontTools plus the DejaVu and Latin Modern files listed below.
Not used during deployment. Subsets are named Dobra; see FONT-LICENSE.txt.
"""
import json
from pathlib import Path
from shutil import copyfile
from fontTools.ttLib import TTFont
from fontTools.pens.basePen import BasePen
from fontTools.pens.boundsPen import BoundsPen

ROOT = Path(__file__).resolve().parents[1]
DEJAVU = Path('/usr/share/fonts/truetype/dejavu')
LATIN = Path('/usr/share/texmf/fonts/opentype/public/lm')
FONT_FILES = {
    'serif': DEJAVU/'DejaVuSerif.ttf',
    'sans': DEJAVU/'DejaVuSans.ttf',
    'bold': DEJAVU/'DejaVuSans-Bold.ttf',
    'serif_bold': DEJAVU/'DejaVuSerif-Bold.ttf',
    'mono': DEJAVU/'DejaVuSansMono.ttf',
    'mono_italic': DEJAVU/'DejaVuSansMono-Oblique.ttf',
    'mono_bold': DEJAVU/'DejaVuSansMono-Bold.ttf',
    'elegant': LATIN/'lmroman10-italic.otf',
    'compact': LATIN/'lmsansdemicond10-regular.otf',
    'smallcaps': LATIN/'lmromancaps10-regular.otf',
    'artistic': LATIN/'lmromandunh10-regular.otf',
}
STYLES = [
    ('classic','Clássica','serif',0),
    ('modern','Moderna','sans',0),
    ('delicate','Delicada','serif',.18),
    ('bold','Marcante','bold',0),
    ('elegant','Elegante','elegant',0),
    ('serif_bold','Clássica forte','serif_bold',0),
    ('compact','Compacta','compact',0),
    ('typewriter','Máquina de escrever','mono',0),
    ('typewriter_italic','Máquina inclinada','mono_italic',0),
    ('typewriter_bold','Máquina forte','mono_bold',0),
    ('smallcaps','Editorial','smallcaps',0),
    ('artistic','Artística','artistic',0),
]
CHARS = ''.join(map(chr, list(range(32,127))+list(range(160,384))+[0x2013,0x2014,0x2018,0x2019,0x201c,0x201d,0x2022,0x2026,0x2605,0x2606,0x2661,0x2665,0x2764]))

class OutlinePen(BasePen):
    def __init__(self,glyphs,units):
        super().__init__(glyphs)
        self.units=units
        self.commands=[]
    def point(self,p):return [round(v/self.units*1000,1) for v in p]
    def _moveTo(self,p):self.commands.append(['M',*self.point(p)])
    def _lineTo(self,p):self.commands.append(['L',*self.point(p)])
    def _curveToOne(self,p1,p2,p3):self.commands.append(['C',*self.point(p1),*self.point(p2),*self.point(p3)])
    def _qCurveToOne(self,p1,p2):self.commands.append(['Q',*self.point(p1),*self.point(p2)])
    def _closePath(self):self.commands.append(['Z'])
    def _endPath(self):pass

fallback=TTFont(FONT_FILES['sans'])
fonts={}
for key,path in FONT_FILES.items():
    font=TTFont(path);glyphs={}
    for char in CHARS:
        current=font if ord(char) in font.getBestCmap() else fallback
        name=current.getBestCmap().get(ord(char))
        if not name:continue
        glyphset=current.getGlyphSet();units=current['head'].unitsPerEm
        pen=OutlinePen(glyphset,units);glyphset[name].draw(pen)
        bounds=BoundsPen(glyphset);glyphset[name].draw(bounds)
        glyphs[char]={'advance':round(current['hmtx'][name][0]/units*1000,1),'commands':pen.commands,'bounds':[round(v/units*1000,1) for v in (bounds.bounds or (0,0,0,0))]}
    fonts[key]=glyphs

copyright=Path('/usr/share/doc/fonts-dejavu-core/copyright').read_text()
vera=copyright.split('Files: *\n',1)[1].split('\nFiles: debian/',1)[0]
lm=Path('/usr/share/doc/fonts-lmodern/copyright').read_text()
gust=lm.split('% This is version 1.0',1)[1]
notice='''Dobra vector font subsets - modified versions for Dobra Ateliê.

Changes: glyph subsets listed in scripts/prepare-fonts.py; metrics normalized to
1000 units; outlines rounded to 0.1 unit; glyph bounds added; missing symbols
fall back to DejaVu Sans. The Delicada style applies a synthetic slant.
The upstream authors do not maintain or support these modified subsets.
Generated outlines are distributed directly as readable JavaScript in src/fonts.js
and in the self-contained HTML build, with these notices embedded.

DejaVu sources: https://dejavu-fonts.github.io/
DejaVu derivatives: Clássica, Moderna, Delicada, Marcante, Clássica forte,
Máquina de escrever, Máquina inclinada, Máquina forte; fallback symbols.
'''+vera+'''
Latin Modern Family, version 2.005 (2021).
Copyright 2003-2021 B. Jackowski and J.M. Nowacki, on behalf of TeX Users Groups.
Design based on Computer Modern by Donald E. Knuth.
Original unmodified distribution: https://ctan.org/pkg/lm
and http://www.gust.org.pl/projects/e-foundry/latin-modern/
Derived subsets: Elegante (lmroman10-italic.otf), Compacta
(lmsansdemicond10-regular.otf), Editorial (lmromancaps10-regular.otf),
Artística (lmromandunh10-regular.otf). The vector subsets are renamed Dobra.
GUST Font License 1.0 / LPPL 1.3c or later; full LPPL in FONT-LPPL.tex.

% This is version 1.0'''+gust+'\n'
(ROOT/'FONT-LICENSE.txt').write_text(notice,encoding='utf-8')
copyfile('/usr/share/texlive/texmf-dist/tex/latex/base/lppl.tex',ROOT/'FONT-LPPL.tex')
lppl=(ROOT/'FONT-LPPL.tex').read_text()
assert '*/' not in notice+lppl
text='/* Dobra font vector subsets. Generated by scripts/prepare-fonts.py.\n'+notice+'\nComplete LPPL license follows:\n'+lppl+'\n*/\nconst FONT_PATHS = '+json.dumps(fonts,ensure_ascii=False,separators=(',',':'))+';\nexport const FONT_LIBRARY = [\n'
for id,name,key,shear in STYLES:
    text+='  {id:'+json.dumps(id)+',name:'+json.dumps(name,ensure_ascii=False)+',glyphs:FONT_PATHS.'+key+',shear:'+str(shear)+'},\n'
text+='];\n'
(ROOT/'src/fonts.js').write_text(text,encoding='utf-8')
print(f'Generated {len(STYLES)} styles from {len(fonts)} glyph sets: {len(text.encode())} bytes.')
