"""ヒーローの 3D 文字に使う字形データ（three の typeface JSON）を書き出す。

ヒーローの 3 行（ロゴ行・見出し・小見出し）と軸のラベルに出る字だけを、
Noto Sans JP（可変フォント）から決めた太さで切り出す。日本語のフォントを丸ごと
読ませると数 MB になるため、出る字だけにする。文言を変えたら、これを打ち直す。
足りない字があると、hero-scene はその行を 2D の文字のまま残す（消えはしない）。

    python apps/portal/scripts/build-hero-font.py

要るもの: fontTools、skia-pathops（字の重なりを外す）、Noto Sans JP の可変フォント。
Noto Sans JP は SIL Open Font License 1.1。切り出した物を配ってよい。
"""

import json
import sys
from pathlib import Path

from fontTools.pens.basePen import BasePen
from fontTools.pens.boundsPen import BoundsPen
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

FONT = Path("C:/Windows/Fonts/NotoSansJP-VF.ttf")
OUT = Path(__file__).resolve().parent.parent / "public" / "hero" / "hero-text.json"
# globals.css の --w-display（見出し）。ロゴ行と小見出しもこの太さで組む
WEIGHT = 450
TEXT = "higgs1729常に、学びを止めない今までの制作物をまとめていますOxy"


class TypefacePen(BasePen):
    """three の FontLoader が読む 'o' の文字列にする。q は 終点 → 制御点 の順"""

    def __init__(self, glyph_set):
        super().__init__(glyph_set)
        self.ops = []

    def _moveTo(self, p):
        self.ops += ["m", p[0], p[1]]

    def _lineTo(self, p):
        self.ops += ["l", p[0], p[1]]

    def _qCurveToOne(self, p1, p2):
        self.ops += ["q", p2[0], p2[1], p1[0], p1[1]]

    def _curveToOne(self, p1, p2, p3):
        self.ops += ["b", p3[0], p3[1], p1[0], p1[1], p2[0], p2[1]]

    def text(self):
        return " ".join(str(round(v)) if not isinstance(v, str) else v for v in self.ops)


def main():
    font = TTFont(FONT)
    font = instancer.instantiateVariableFont(
        font, {"wght": WEIGHT}, overlap=instancer.OverlapMode.REMOVE
    )
    cmap = font.getBestCmap()
    glyph_set = font.getGlyphSet()
    hmtx = font["hmtx"]
    glyphs = {}
    missing = []
    for ch in dict.fromkeys(TEXT):
        name = cmap.get(ord(ch))
        if name is None:
            missing.append(ch)
            continue
        pen = TypefacePen(glyph_set)
        glyph_set[name].draw(pen)
        bounds_pen = BoundsPen(glyph_set)
        glyph_set[name].draw(bounds_pen)
        x_min, _, x_max, _ = bounds_pen.bounds or (0, 0, 0, 0)
        glyphs[ch] = {
            "ha": hmtx[name][0],
            "x_min": round(x_min),
            "x_max": round(x_max),
            "o": pen.text(),
        }
    if missing:
        sys.exit(f"missing glyphs: {''.join(missing)}")

    head = font["head"]
    data = {
        "glyphs": glyphs,
        "familyName": f"Noto Sans JP {WEIGHT} (hero subset)",
        "ascender": font["hhea"].ascent,
        "descender": font["hhea"].descent,
        "underlinePosition": font["post"].underlinePosition,
        "underlineThickness": font["post"].underlineThickness,
        "boundingBox": {"xMin": head.xMin, "yMin": head.yMin, "xMax": head.xMax, "yMax": head.yMax},
        "resolution": head.unitsPerEm,
        "original_font_information": {"license": "SIL Open Font License 1.1", "source": FONT.name},
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"{OUT} {len(glyphs)} glyphs {OUT.stat().st_size} bytes")


if __name__ == "__main__":
    main()
