from pathlib import Path
import sys, math, zipfile
sys.path.insert(0, str(Path(__file__).resolve().parents[2] / 'tmp/font-build-deps'))
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.ttLib import TTFont
from PIL import Image, ImageDraw, ImageFont

OUT = Path(__file__).resolve().parent
def poly(*pts): return list(pts)
def rect(x,y,w,h): return [(x,y),(x,y+h),(x+w,y+h),(x+w,y)]
def arc(cx,cy,r,a,b,n=64):
    return [(cx+r*math.cos(math.radians(a+(b-a)*i/n)),cy+r*math.sin(math.radians(a+(b-a)*i/n))) for i in range(n+1)]
def sector(cx,cy,r,a,b): return [(cx,cy)]+arc(cx,cy,r,a,b)
def ring(cx,cy,r,t,a,b): return arc(cx,cy,r,a,b)+arc(cx,cy,r-t,b,a)

shapes = [
('Right triangle',[poly((0,0),(0,1000),(1000,0))]),
('Triangle',[poly((0,0),(500,1000),(1000,0))]),
('Quarter disc',[sector(0,0,1000,0,90)]),
('Semicircle',[sector(500,500,500,0,180)]),
('Circle',[arc(500,500,500,0,360)]),
('Square',[rect(0,0,1000,1000)]),
('Half block',[rect(0,0,500,1000)]),
('Quarter block',[rect(0,0,500,500)]),
('Quarter ring',[ring(0,0,1000,200,0,90)]),
('Half ring',[ring(500,500,500,150,0,180)]),
('Ring',[ring(500,500,500,150,0,360)]),
('Concave corner',[poly((0,0),(0,1000),(1000,1000))+arc(1000,0,1000,90,180)]),
('Rounded corner',[poly((0,0),(1000,0),(1000,500))+arc(500,500,500,0,90)+[(0,1000)]]),
('Round-ended bar',[poly((0,250),(750,250))+arc(750,500,250,-90,90)+[(0,750)]]),
('Capsule',[arc(750,500,250,-90,90)+arc(250,500,250,90,270)]),
('Diagonal band',[poly((0,0),(250,0),(1000,750),(1000,1000),(750,1000),(0,250))]),
('L block',[poly((0,0),(1000,0),(1000,250),(250,250),(250,1000),(0,1000))]),
('Cross',[poly((375,0),(625,0),(625,375),(1000,375),(1000,625),(625,625),(625,1000),(375,1000),(375,625),(0,625),(0,375),(375,375))]),
('Staircase',[poly((0,0),(1000,0),(1000,250),(750,250),(750,500),(500,500),(500,750),(250,750),(250,1000),(0,1000))]),
('Chevron',[poly((0,0),(500,500),(0,1000),(500,1000),(1000,500),(500,0))]),
('Arrow',[poly((0,350),(600,350),(600,0),(1000,500),(600,1000),(600,650),(0,650))]),
('Diamond',[poly((0,500),(500,1000),(1000,500),(500,0))]),
('Four-point concave star', [arc(0,0,500,0,90)+arc(0,1000,500,-90,0)+arc(1000,1000,500,180,270)+arc(1000,0,500,90,180)]),
('Trapezoid',[poly((0,0),(250,1000),(750,1000),(1000,0))]),
('Parallelogram',[poly((0,0),(250,1000),(1000,1000),(750,0))]),
('Quarter disc cutout',[poly((0,0),(1000,0),(1000,1000))+arc(0,1000,1000,0,-90)])
]

def glyph(contours, mirror=False):
    p=TTGlyphPen(None)
    for points in contours:
        pts=[(round(1000-x if mirror else x),round(y)) for x,y in points]
        # Normalize outer contours to clockwise for TrueType.
        area=sum(pts[i][0]*pts[(i+1)%len(pts)][1]-pts[(i+1)%len(pts)][0]*pts[i][1] for i in range(len(pts)))
        if area>0: pts.reverse()
        p.moveTo(pts[0])
        for pt in pts[1:]: p.lineTo(pt)
        p.closePath()
    return p.glyph()

for style in ('Original','Opposite'):
    fb=FontBuilder(1000,isTTF=True)
    order=['.notdef','space']+list('ABCDEFGHIJKLMNOPQRSTUVWXYZ')
    fb.setupGlyphOrder(order)
    fb.setupCharacterMap({32:'space',**{ord(c):c for c in order[2:]}})
    gs={'.notdef':glyph([rect(100,100,800,800)]),'space':glyph([])}
    gs.update({c:glyph(shape[1],style=='Opposite') for c,shape in zip(order[2:],shapes)})
    fb.setupGlyf(gs)
    fb.setupHorizontalMetrics({c:(1000,gs[c].xMin if hasattr(gs[c],'xMin') else 0) for c in order})
    # Bounds are calculated on save; derive bearings directly from outlines.
    for name,g in gs.items():
        if g.numberOfContours:
            g.recalcBounds(fb.font['glyf']); fb.font['hmtx'].metrics[name]=(1000,g.xMin)
    fb.setupHorizontalHeader(ascent=1000,descent=0,lineGap=0)
    fb.setupNameTable({'familyName':f'Shape Grid Trial {style}','styleName':'Regular','typographicFamily':'Shape Grid Trial','typographicSubfamily':style,'uniqueFontIdentifier':f'ShapeGridTrial-{style}-1.000','fullName':f'Shape Grid Trial {style}','psName':f'ShapeGridTrial-{style}','version':'Version 1.000'})
    fb.setupOS2(version=4,sTypoAscender=1000,sTypoDescender=0,sTypoLineGap=0,usWinAscent=1000,usWinDescent=0,sxHeight=1000,sCapHeight=1000,fsSelection=0xC0)
    fb.setupPost(isFixedPitch=1)
    fb.setupMaxp()
    fb.save(OUT/f'ShapeGridTrial-{style}.ttf')

for style in ('Original','Opposite'):
    f=TTFont(OUT/f'ShapeGridTrial-{style}.ttf')
    assert len(f.getBestCmap())==27
    assert all(w==1000 for w,b in f['hmtx'].metrics.values())
    assert f['OS/2'].sTypoLineGap==0

img=Image.new('RGB',(1400,850),'#f3f0e8'); d=ImageDraw.Draw(img)
label=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',20)
title=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',30)
d.text((30,20),'SHAPE GRID TRIAL / 26 base shapes / A-Z',(25,25,25),font=title)
for row,style in enumerate(('Original','Opposite')):
    d.text((30,75+row*380),style+(' / horizontal mirror' if row else ''),(25,25,25),font=label)
    font=ImageFont.truetype(str(OUT/f'ShapeGridTrial-{style}.ttf'),86)
    for i,c in enumerate('ABCDEFGHIJKLMNOPQRSTUVWXYZ'):
        x=30+(i%13)*103; y=115+row*380+(i//13)*160
        d.rectangle((x,y,x+86,y+86),outline='#c6c2b8')
        d.text((x,y+86),c,font=font,fill='#171717',anchor='ls')
        d.text((x,y+96),c,font=label,fill='#333333')
img.save(OUT/'specimen.png')
lines=['Shape Grid Trial — 26-glyph prototype','', 'Install both TTF files. Select Shape Grid Trial and style Original / Opposite.','Legacy applications may list each style as a separate font family.','Opposite = horizontal reflection. Only A-Z and space are mapped.','All advances: 1000 units; em: 1000; ascent: 1000; descent and line gap: 0.','Set tracking to 0 and line spacing to 100% for square-grid composition.','', 'Character map:']+[f'{c}: {s[0]}' for c,s in zip('ABCDEFGHIJKLMNOPQRSTUVWXYZ',shapes)]
(OUT/'README.txt').write_text('\n'.join(lines),encoding='utf-8')
with zipfile.ZipFile(OUT/'ShapeGridTrial.zip','w',zipfile.ZIP_DEFLATED) as z:
    for name in ('ShapeGridTrial-Original.ttf','ShapeGridTrial-Opposite.ttf','specimen.png','README.txt'): z.write(OUT/name,name)
print('Built and validated two TTFs, preview and ZIP.')

