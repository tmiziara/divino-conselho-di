#!/usr/bin/env python3
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DOCS_DIR = ROOT / "docs"
OUTPUT_ROOT = ROOT / "public" / "data" / "bible"

VERSION_SOURCES = {
    "esv": DOCS_DIR / "ESV" / "ESV_bible.json",
    "niv": DOCS_DIR / "NIV" / "NIV_bible.json",
    "nkjv": DOCS_DIR / "NKJV" / "NKJV_bible.json",
    "nasb1995": DOCS_DIR / "NASB1995" / "NASB1995_bible.json",
}

# Keep this order aligned with the in-app book order and existing PT file abbreviations.
BOOKS = [
    ("gn", ["Genesis"]),
    ("ex", ["Exodus"]),
    ("lv", ["Leviticus"]),
    ("nm", ["Numbers"]),
    ("dt", ["Deuteronomy"]),
    ("js", ["Joshua"]),
    ("jz", ["Judges"]),
    ("rt", ["Ruth"]),
    ("1sm", ["1 Samuel"]),
    ("2sm", ["2 Samuel"]),
    ("1rs", ["1 Kings"]),
    ("2rs", ["2 Kings"]),
    ("1cr", ["1 Chronicles"]),
    ("2cr", ["2 Chronicles"]),
    ("ed", ["Ezra"]),
    ("ne", ["Nehemiah"]),
    ("et", ["Esther"]),
    ("j\u00f3", ["Job"]),
    ("sl", ["Psalms", "Psalm"]),
    ("pv", ["Proverbs"]),
    ("ec", ["Ecclesiastes"]),
    ("ct", ["Song Of Solomon", "Song of Solomon", "Song of Songs", "Canticles"]),
    ("is", ["Isaiah"]),
    ("jr", ["Jeremiah"]),
    ("lm", ["Lamentations"]),
    ("ez", ["Ezekiel"]),
    ("dn", ["Daniel"]),
    ("os", ["Hosea"]),
    ("jl", ["Joel"]),
    ("am", ["Amos"]),
    ("ob", ["Obadiah"]),
    ("jn", ["Jonah"]),
    ("mq", ["Micah"]),
    ("na", ["Nahum"]),
    ("hc", ["Habakkuk"]),
    ("sf", ["Zephaniah"]),
    ("ag", ["Haggai"]),
    ("zc", ["Zechariah"]),
    ("ml", ["Malachi"]),
    ("mt", ["Matthew"]),
    ("mc", ["Mark"]),
    ("lc", ["Luke"]),
    ("jo", ["John"]),
    ("atos", ["Acts"]),
    ("rm", ["Romans"]),
    ("1co", ["1 Corinthians"]),
    ("2co", ["2 Corinthians"]),
    ("gl", ["Galatians"]),
    ("ef", ["Ephesians"]),
    ("fp", ["Philippians"]),
    ("cl", ["Colossians"]),
    ("1ts", ["1 Thessalonians"]),
    ("2ts", ["2 Thessalonians"]),
    ("1tm", ["1 Timothy"]),
    ("2tm", ["2 Timothy"]),
    ("tt", ["Titus"]),
    ("fm", ["Philemon"]),
    ("hb", ["Hebrews"]),
    ("tg", ["James"]),
    ("1pe", ["1 Peter"]),
    ("2pe", ["2 Peter"]),
    ("1jo", ["1 John"]),
    ("2jo", ["2 John"]),
    ("3jo", ["3 John"]),
    ("jd", ["Jude"]),
    ("ap", ["Revelation", "Revelation of John"]),
]


def normalize_name(name: str) -> str:
    lowered = name.strip().lower()
    lowered = re.sub(r"[^a-z0-9 ]+", " ", lowered)
    lowered = re.sub(r"\s+", " ", lowered).strip()
    return lowered


def sorted_numeric_values(container):
    if isinstance(container, list):
        return list(container)
    if isinstance(container, dict):
        return [container[key] for key in sorted(container.keys(), key=lambda item: int(item))]
    raise TypeError(f"Unsupported chapter/verse container type: {type(container)}")


def mojibake_score(text: str) -> int:
    bad_tokens = ["Ã", "Â", "â€", "â€™", "â€œ", "â€\x9d", "â€”", "â€“", "â€¦", "\ufffd"]
    return sum(text.count(token) for token in bad_tokens)


def normalize_verse_text(value) -> str:
    text = str(value).strip()
    if mojibake_score(text) == 0:
        return text

    try:
        repaired = text.encode("latin1").decode("utf-8")
    except UnicodeError:
        return text

    return repaired if mojibake_score(repaired) < mojibake_score(text) else text


def to_chapter_matrix(raw_book):
    chapter_items = sorted_numeric_values(raw_book)
    chapters = []
    for chapter in chapter_items:
        verse_items = sorted_numeric_values(chapter)
        verses = [normalize_verse_text(verse) for verse in verse_items]
        chapters.append(verses)
    return chapters


def resolve_book(raw_data, aliases):
    normalized_lookup = {normalize_name(name): name for name in raw_data.keys()}
    for alias in aliases:
        source_name = normalized_lookup.get(normalize_name(alias))
        if source_name:
            return source_name, raw_data[source_name]
    raise KeyError(f"Book not found for aliases: {aliases}")


def ensure_utf8_clean(version: str, abbrev: str, payload: dict):
    encoded = json.dumps(payload, ensure_ascii=False).encode("utf-8", errors="strict")
    if not encoded:
        raise ValueError(f"Empty UTF-8 payload for {version}/{abbrev}")
    serialized = encoded.decode("utf-8")
    if mojibake_score(serialized) > 0:
        raise ValueError(f"Possible mojibake detected in {version}/{abbrev}")


def generate_version(version_key: str, source_path: Path):
    if not source_path.exists():
        raise FileNotFoundError(f"Source not found: {source_path}")

    raw_data = json.loads(source_path.read_text(encoding="utf-8-sig"))
    if not isinstance(raw_data, dict):
        raise ValueError(f"Unexpected source format in {source_path}: expected object with 66 books")
    if len(raw_data) != 66:
        raise ValueError(f"{version_key} has {len(raw_data)} books; expected 66")

    version_dir = OUTPUT_ROOT / version_key
    version_dir.mkdir(parents=True, exist_ok=True)

    written = 0
    for abbrev, aliases in BOOKS:
        source_name, book_payload = resolve_book(raw_data, aliases)
        chapters = to_chapter_matrix(book_payload)
        if not chapters:
            raise ValueError(f"{version_key}/{abbrev} has no chapters")
        if any(len(chapter) == 0 for chapter in chapters):
            raise ValueError(f"{version_key}/{abbrev} has empty chapter(s)")

        out_payload = {
            "abbrev": abbrev,
            "name": source_name,
            "chapters": chapters,
        }
        ensure_utf8_clean(version_key, abbrev, out_payload)

        output_path = version_dir / f"{abbrev}.json"
        output_path.write_text(
            json.dumps(out_payload, ensure_ascii=False, separators=(",", ":")),
            encoding="utf-8",
        )
        written += 1

    if written != 66:
        raise ValueError(f"{version_key} wrote {written} files; expected 66")

    print(f"[ok] {version_key}: generated {written} books at {version_dir}")


def main():
    for version, source in VERSION_SOURCES.items():
        generate_version(version, source)
    print("[done] English Bible data generation completed.")


if __name__ == "__main__":
    main()
