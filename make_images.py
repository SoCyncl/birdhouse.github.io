#!/usr/bin/env python3
"""Turn your original artwork into web-sized images and write the HTML to paste into your gallery.

Put originals in   originals/<gallery>/   for example  originals/sketches/My Drawing.png
Then, from the site's main folder, run:   python tools/make_images.py

For every original it makes
    images/<gallery>/thumbs/<name>.webp   small version, used in the grid
    images/<gallery>/<name>.webp          large version, shown in the viewer
and writes ready-to-paste HTML to tools/new-figures.html.
Already-converted images are skipped, so it is safe to run again whenever you add art.
Your originals are never changed.
"""
import argparse
import html
import io
import re
import sys
from datetime import datetime
from pathlib import Path

try:
    from PIL import Image, ImageCms, ImageOps
except ImportError:
    sys.exit("Pillow is missing. Install it with:  pip install pillow")

ROOT = Path(__file__).resolve().parent.parent
EXTS = {".jpg", ".jpeg", ".png", ".webp", ".tif", ".tiff", ".bmp", ".gif"}
IMG_ONLY = {"works", "about"}          # these folders get a bare <img> line instead of a <figure>
RESAMPLE = getattr(Image, "Resampling", Image).LANCZOS
Image.MAX_IMAGE_PIXELS = 400_000_000   # allow very large originals


def slug(name):
    """my Drawing (2).PNG -> my-drawing-2  (lowercase, no spaces: safe for web addresses)"""
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-") or "image"


def prepare(im):
    """Fix rotation, convert to RGB/RGBA, and convert colors to sRGB so they look right in browsers."""
    icc = im.info.get("icc_profile")
    was_cmyk = im.mode == "CMYK"
    im = ImageOps.exif_transpose(im)
    has_alpha = im.mode in ("RGBA", "LA", "PA") or (im.mode == "P" and "transparency" in im.info)
    srgb = ImageCms.createProfile("sRGB")
    if icc:
        try:
            src = ImageCms.ImageCmsProfile(io.BytesIO(icc))
            if was_cmyk:
                return ImageCms.profileToProfile(im, src, srgb, outputMode="RGB"), False
            if has_alpha:
                alpha = im.convert("RGBA").getchannel("A")
                rgb = ImageCms.profileToProfile(im.convert("RGB"), src, srgb)
                rgb.putalpha(alpha)
                return rgb, True
            return ImageCms.profileToProfile(im.convert("RGB"), src, srgb), False
        except Exception:
            pass  # unreadable profile: fall through to a plain conversion
    return im.convert("RGBA" if has_alpha else "RGB"), has_alpha


def fit_full(im, full):
    """Shrink so the longest edge is at most `full`, never upscaling.
    Very long strips (comic pages) would end up too narrow to read, so they are allowed to stay longer."""
    w, h = im.size
    scale = min(1.0, full / max(w, h))
    if min(w, h) * scale < full / 2:
        scale = min(1.0, (full / 2) / min(w, h), (full * 3) / max(w, h))
    if scale >= 1.0:
        return im.copy()
    return im.resize((max(1, round(w * scale)), max(1, round(h * scale))), RESAMPLE)


def save_webp(im, path, quality):
    path.parent.mkdir(parents=True, exist_ok=True)
    im.save(path, "WEBP", quality=quality, method=6)


def fresh(out, src_mtime):
    return out.exists() and out.stat().st_mtime >= src_mtime


def block(gallery, name, title, year, tw, th):
    thumb = "images/%s/thumbs/%s.webp" % (gallery, name)
    full = "images/%s/%s.webp" % (gallery, name)
    img = ('<img class="art" src="%s" data-full="%s" alt="TODO describe this picture" '
           'width="%d" height="%d" loading="lazy" decoding="async">' % (thumb, full, tw, th))
    if gallery in IMG_ONLY:
        return img
    return "<figure>\n  %s\n  <figcaption>%s <span>%s, medium</span></figcaption>\n</figure>" % (
        img, html.escape(title), year)


def main():
    ap = argparse.ArgumentParser(description="Make thumbnails and viewer-size images from originals.")
    ap.add_argument("--source", default=str(ROOT / "originals"), help="folder holding your originals (default: originals/)")
    ap.add_argument("--full", type=int, default=2400, help="longest edge of the viewer image in pixels (default 2400)")
    ap.add_argument("--thumb", type=int, default=700, help="width of the grid thumbnail in pixels (default 700)")
    ap.add_argument("--quality", type=int, default=82, help="WebP quality for viewer images, 1-100 (default 82)")
    ap.add_argument("--force", action="store_true", help="redo images that were already converted")
    args = ap.parse_args()

    source = Path(args.source)
    if not source.is_dir():
        sys.exit("Can't find %s. Create it and put your art in subfolders like originals/illustrations/." % source)

    done, skipped, blocks = 0, 0, {}
    for gdir in sorted(p for p in source.iterdir() if p.is_dir()):
        gallery = slug(gdir.name)
        used = set()
        for f in sorted(gdir.iterdir()):
            if f.suffix.lower() not in EXTS or f.name.startswith("."):
                continue
            name = slug(f.stem)
            n = 2
            while name in used:
                name = "%s-%d" % (slug(f.stem), n)
                n += 1
            used.add(name)

            out_full = ROOT / "images" / gallery / (name + ".webp")
            out_thumb = ROOT / "images" / gallery / "thumbs" / (name + ".webp")
            mtime = f.stat().st_mtime
            if not args.force and fresh(out_full, mtime) and fresh(out_thumb, mtime):
                skipped += 1
                continue
            try:
                with Image.open(f) as im:
                    if getattr(im, "is_animated", False):
                        print("skip   %s/%s: animated (use a short video or keep it as a GIF)" % (gdir.name, f.name))
                        continue
                    im, _ = prepare(im)
                    big = fit_full(im, args.full)
                    small = im.copy()
                    small.thumbnail((args.thumb, args.thumb * 2), RESAMPLE)
                    save_webp(big, out_full, args.quality)
                    save_webp(small, out_thumb, max(args.quality - 4, 50))
            except Exception as e:
                print("FAILED %s/%s: %s" % (gdir.name, f.name, e))
                continue

            kb_full = out_full.stat().st_size // 1024
            kb_thumb = out_thumb.stat().st_size // 1024
            note = "   (big. Try --quality 75)" if kb_full > 1500 else ""
            print("ok     %s/%s -> %s   thumb %d KB, viewer %d KB%s" % (gdir.name, f.name, name, kb_thumb, kb_full, note))
            year = datetime.fromtimestamp(mtime).year
            blocks.setdefault(gallery, []).append(block(gallery, name, f.stem.replace("_", " ").replace("-", " ").strip().title(), year, small.width, small.height))
            done += 1

    print("\n%d converted, %d already up to date." % (done, skipped))
    if not blocks:
        print("Nothing new to paste.")
        return

    out = ["<!-- Made by tools/make_images.py on %s." % datetime.now().strftime("%Y-%m-%d %H:%M"),
           "     Copy each block into the matching gallery section, then fix the alt text and caption.",
           "     The year is the file's last-modified year. Check it. -->", ""]
    for gallery, items in blocks.items():
        out.append("<!-- %s -->" % gallery.upper())
        out.extend(i + "\n" for i in items)
    (ROOT / "tools" / "new-figures.html").write_text("\n".join(out), encoding="utf-8")
    print("HTML to paste is in tools/new-figures.html")


if __name__ == "__main__":
    main()
