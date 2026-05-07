#!/usr/bin/env python3
"""
Parse the price_list copy.docx into structured JSON for DB import review.

Output: parsed-products.json — list of { brand, name, skus: [{size_ml, price_bani, label}, ...] }

Usage:
  python3 scripts/parse-pricelist.py "<path to docx>" > scripts/parsed-products.json

Pipeline:
  1. Extract paragraphs from docx
  2. Pre-glue accent-fragment lines onto the previous line
  3. Walk lines top-to-bottom, tracking the current brand
  4. A line is a Brand if it matches a known canonical brand (case-insensitive) or
     looks like an all-uppercase header
  5. A line is a SKU if it matches a `<size>ml<sep><price>lei` pattern
  6. Anything else is a Product name; SKUs that follow attach to it
"""

import sys
import re
import json
import zipfile
import xml.etree.ElementTree as ET

W_NS = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"


# ---------------------------------------------------------------------------
# Known brands — canonical spellings keyed by normalized lowercase variants.
# Add new brands or aliases here when the doc grows.
# ---------------------------------------------------------------------------

CANONICAL_BRANDS = [
    "Maison Francis Kurkdjian Paris",
    "Stephane Humbert Lucas",
    "Matiere Premiere",
    "Penhaligon's",
    "Tom Ford",
    "Ex Nihilo",
    "Hormone Paris",
    "Parfums de Marly",
    "Kilian",
    "Le Labo",
    "Creed",
    "Aum",
    "Initio",
    "Bvlgari",
    "Louis Vuitton",
    "Christian Dior",
    "Amouage",
    "Givenchy",
    "Yves Saint Laurent",
    "HFC",
    "Tiziana Terenzi",
    "Mancera",
    "Byredo",
    "Montale Paris",
    "Escentric Molecules",
    "Thomas Kosmala",
    "Prada",
    "Essential Parfums",
    "Narciso Rodriguez",
    "Nishane",
    "BDK Parfums",
    "Sospiro",
    "Pasticcio",
    "Xerjoff",
    "Boadicea The Victorious",
    "Clive Christian",
    "Roja Parfums",
    "Marc-Antoine Barrois Paris",
    "Chanel",
    "Jo Malone",
    "Burberry",
    "Nasomatto",
    "Ajmal",
    "Armaf",
    "Armaf Odyssey",
    "Junaid Perfumes",
    "Hugo Boss",
    "Ahmad Al Maghribi",
    "My Geisha",
    "Attar Collection",
    "Arabesque Extract Parfum",
    "Gucci",
    "Syed Junaid Alam",
    "Just Jack",
    "Van Cleef & Arpels",
    "Juliette has a Gun",
    "Gritti",
    "Frederic Malle",
    "Jean Paul Gaultier",
    "Ducci Giardini Di Toscana",
    "Fleur Narcotique",
    "FugaZZi",
    "Marc-Antoine Barrois",
]

# Manual aliases: when one of these appears (case-insensitive), use the canonical form.
ALIASES = {
    "tom fort": "Tom Ford",
    "tom ford": "Tom Ford",
    "martiere premiere": "Matiere Premiere",
    "matiere premiere": "Matiere Premiere",
    "penthaligons": "Penhaligon's",
    "penthaligon's": "Penhaligon's",
    "penhaligon's": "Penhaligon's",
    "molecules": "Escentric Molecules",
    "escentric molecules": "Escentric Molecules",
    "yvessaintlaurent": "Yves Saint Laurent",
    "yves saint laurent": "Yves Saint Laurent",
    "armaf odyssey": "Armaf Odyssey",
    "armaf": "Armaf",
    "fug": "FugaZZi",
    "zzi": "FugaZZi",
    "fugazzi": "FugaZZi",
    "pm]": None,  # WhatsApp bracket leak
}

# Build the case-insensitive lookup
BRAND_LOOKUP = {}
for b in CANONICAL_BRANDS:
    BRAND_LOOKUP[b.lower()] = b
for k, v in ALIASES.items():
    if v is not None:
        BRAND_LOOKUP[k.lower()] = v
    else:
        BRAND_LOOKUP[k.lower()] = None  # explicit "drop"


def canonical_brand(line):
    """Return canonical brand name if `line` matches a known brand (case-insensitive)."""
    s = line.strip().rstrip(",.;:")
    norm = s.lower()
    if norm in BRAND_LOOKUP:
        return BRAND_LOOKUP[norm]
    # Also try without trailing 'paris'/'london' city suffixes
    for suffix in (" paris", " london", " roma"):
        if norm.endswith(suffix):
            base = norm[:-len(suffix)]
            if base in BRAND_LOOKUP:
                return BRAND_LOOKUP[base]
    return None


# ---------------------------------------------------------------------------

def extract_paragraphs(docx_path):
    """Return paragraphs by joining <w:t> runs inside each <w:p>."""
    with zipfile.ZipFile(docx_path) as z:
        with z.open("word/document.xml") as f:
            tree = ET.parse(f)
    paragraphs = []
    for p in tree.iter(f"{W_NS}p"):
        runs = []
        for t in p.iter(f"{W_NS}t"):
            if t.text:
                runs.append(t.text)
        line = "".join(runs).strip()
        if line:
            paragraphs.append(line)
    return paragraphs


# ---------------------------------------------------------------------------

CHAT_TIMESTAMP = re.compile(r"^\[\d+/\d+/\d+,?\s+\d+:\d+", re.IGNORECASE)
JUNK_TOKENS = {"Руки", "базуки", "-", "💪💪💪", "💪", ""}
COMMENT_PREFIXES = ("astea sunt", "așa arată", "asa arata", "mai sus")


def is_chat_artifact(line):
    if CHAT_TIMESTAMP.match(line):
        return True
    if line.strip() in JUNK_TOKENS:
        return True
    if line.strip().startswith(":") and len(line.strip()) <= 3:
        return True
    if any(line.lower().startswith(p) for p in COMMENT_PREFIXES):
        return True
    return False


# A line that is just diacritic chars or punctuation — often a split fragment.
ACCENT_ONLY_RE = re.compile(r"^[éèêëàâäîïôöûüç’'`\-\.,]+$", re.IGNORECASE)


def preglue_accents(lines):
    """Glue accent-fragment lines onto the preceding line."""
    out = []
    for line in lines:
        s = line.strip()
        if not s:
            continue
        if out and len(s) <= 2 and ACCENT_ONLY_RE.match(s):
            out[-1] = out[-1] + s
            continue
        # Glue 1-2 character lowercase fragments that look like Pages-split tails (e.g. "ld", "ve", "te")
        if out and 1 <= len(s) <= 3 and s.islower() and s.isalpha() and not is_sku_line(out[-1]):
            # Only glue if previous line doesn't already end in a space and looks like an unfinished name
            if not out[-1].endswith(" ") and not is_sku_line(s):
                out[-1] = out[-1] + s
                continue
        out.append(s)
    return out


# ---------------------------------------------------------------------------

SKU_RE = re.compile(
    r"^\s*(?P<size>\d+(?:\.\d+)?)\s*(?P<unit>ml|grams?|gr)\s*[-–—]?\s*(?P<price>\d{2,5})\s*lei",
    re.IGNORECASE,
)


def is_sku_line(line):
    return SKU_RE.match(line) is not None


def parse_sku(line):
    m = SKU_RE.match(line)
    if not m:
        return None
    size = float(m.group("size"))
    unit = m.group("unit").lower()
    price = int(m.group("price"))
    if unit.startswith("gr"):
        return None  # solid attar — different unit, skip
    size_ml = int(size)
    return size_ml, price * 100, f"{size_ml}ml"


# Generic uppercase-line brand fallback (3+ letters, mostly uppercase, no digits).
BRAND_FALLBACK_RE = re.compile(r"^[A-ZÀ-ÝÆŒ&'’\.\s\-,\(\)/]{3,}$")


def is_uppercase_brand_header(line):
    s = line.strip()
    if any(ch.isdigit() for ch in s):
        return False
    letters = [ch for ch in s if ch.isalpha()]
    if len(letters) < 3:
        return False
    upper_ratio = sum(1 for ch in letters if ch.isupper()) / len(letters)
    if upper_ratio < 0.85:
        return False
    return BRAND_FALLBACK_RE.match(s) is not None


# ---------------------------------------------------------------------------

def split_inline_brand(line):
    """If a line starts with a known brand followed by a product name, return (brand, product)."""
    s = line.strip()
    for b in CANONICAL_BRANDS:
        if s.lower().startswith(b.lower() + " "):
            return b, s[len(b):].strip()
    return None


# ---------------------------------------------------------------------------

def parse_pricelist(paragraphs):
    products = []
    current_brand = None
    current_product = None

    def flush_product():
        nonlocal current_product
        if current_product is not None and current_product.get("skus"):
            products.append(current_product)
        current_product = None

    def start_product(name):
        nonlocal current_product
        flush_product()
        current_product = {
            "brand": current_brand or "(unknown)",
            "name": name.strip().rstrip(",.;:"),
            "skus": [],
        }

    lines = preglue_accents(paragraphs)

    for raw in lines:
        line = raw.strip()
        if not line or is_chat_artifact(line):
            continue

        # Strip leading "[date] " WhatsApp prefix
        m = re.match(r"^\[[^\]]+\]\s*:?\s*(.*)$", line)
        if m:
            line = m.group(1).strip()
            if not line:
                continue

        # ": Brand" colon-prefixed brand
        if line.startswith(":"):
            tail = line[1:].strip()
            if tail:
                line = tail
            else:
                continue

        # Inline brand+product, e.g. "STEPHANE HUMBERT LUCAS Sand Dance"
        ib = split_inline_brand(line)
        if ib is not None:
            brand, product = ib
            current_brand = brand
            if product:
                start_product(product)
            else:
                flush_product()
            continue

        # Brand line (canonical or uppercase fallback)
        cb = canonical_brand(line)
        if cb is not None:
            current_brand = cb
            flush_product()
            continue
        if cb is None and line.lower() in BRAND_LOOKUP and BRAND_LOOKUP[line.lower()] is None:
            # explicit drop ("PM]" etc.)
            continue
        if is_uppercase_brand_header(line) and len(line) >= 4:
            # Try canonical form one more time
            normalized = line.title()
            current_brand = canonical_brand(normalized) or normalized
            flush_product()
            continue

        # SKU line
        sku = parse_sku(line)
        if sku is not None:
            size_ml, price_bani, label = sku
            if current_product is None:
                continue
            if any(s["size_ml"] == size_ml for s in current_product["skus"]):
                continue
            current_product["skus"].append({
                "size_ml": size_ml,
                "price_bani": price_bani,
                "label": label,
            })
            continue

        # Otherwise: product name
        if len(line) <= 1:
            if current_product is not None and not current_product["skus"]:
                current_product["name"] = (current_product["name"] + line).strip()
            continue

        start_product(line)

    flush_product()
    return products


# ---------------------------------------------------------------------------

def main():
    if len(sys.argv) < 2:
        print("usage: parse-pricelist.py <path-to-docx>", file=sys.stderr)
        sys.exit(2)
    paragraphs = extract_paragraphs(sys.argv[1])
    products = parse_pricelist(paragraphs)

    print(f"# parsed {len(products)} products", file=sys.stderr)
    by_brand = {}
    for p in products:
        by_brand[p["brand"]] = by_brand.get(p["brand"], 0) + 1
    for b, n in sorted(by_brand.items(), key=lambda kv: (-kv[1], kv[0])):
        print(f"#   {n:>4}  {b}", file=sys.stderr)

    json.dump(products, sys.stdout, ensure_ascii=False, indent=2)
    print()


if __name__ == "__main__":
    main()
