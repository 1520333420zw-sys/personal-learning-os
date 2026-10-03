"""Build the checked-in English I vocabulary pack from the MIT-licensed ECDICT CSV.

Usage: python scripts/build-english-vocabulary-pack.py path/to/ecdict.csv
The source CSV itself is not committed. See docs/content-sources/english-vocabulary.md.
"""

from __future__ import annotations

import csv
import hashlib
import json
import re
import sys
from pathlib import Path


LIMIT = 1000
VERSION = "2026.10-english-vocabulary-1"
OUTPUT = Path("public/content/english/vocabulary-v1.json")


def positive_int(value: str) -> int:
    try:
        parsed = int(value)
        return parsed if parsed > 0 else 1_000_000
    except (TypeError, ValueError):
        return 1_000_000


def clean_lines(value: str) -> list[str]:
    return [re.sub(r"\s+", " ", line).strip() for line in (value or "").splitlines() if line.strip() and not line.startswith("[网络]")]


def word_family(exchange: str) -> list[str]:
    values = []
    for item in (exchange or "").split("/"):
        if ":" in item:
            value = item.split(":", 1)[1].strip()
            if value and value not in values:
                values.append(value)
    return values[:8]


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit("Pass the ECDICT CSV path")
    rows = []
    with open(sys.argv[1], encoding="utf-8", newline="") as source:
        for row in csv.DictReader(source):
            word = (row.get("word") or "").strip().lower()
            tags = (row.get("tag") or "").split()
            meanings = clean_lines(row.get("translation") or "")
            if "ky" not in tags or not re.fullmatch(r"[a-z][a-z'-]{1,28}", word) or not meanings:
                continue
            rank = min(positive_int(row.get("frq") or ""), positive_int(row.get("bnc") or ""))
            rows.append((rank, word, row, meanings))
    rows.sort(key=lambda item: (item[0], item[1]))
    selected = rows[:LIMIT]
    entries = []
    for index, (rank, word, row, meanings) in enumerate(selected):
        tier = "high" if index < 300 else "medium" if index < 700 else "low"
        difficulty = "easy" if index < 250 else "medium" if index < 750 else "hard"
        definitions = clean_lines(row.get("definition") or "")
        slug = word.replace("'", "-")
        entries.append({
            "id": f"en-vocab-{slug}",
            "word": word,
            "phonetic": (row.get("phonetic") or "").strip(),
            "partOfSpeech": (row.get("pos") or "").strip(),
            "meanings": meanings[:4],
            "commonMeaningsInExam": meanings[:2],
            "definition": definitions[0] if definitions else "",
            "collocations": [],
            "wordFamily": word_family(row.get("exchange") or ""),
            "example": "",
            "synonyms": [],
            "antonyms": [],
            "difficulty": difficulty,
            "frequencyTier": tier,
            "frequencyRank": None if rank == 1_000_000 else rank,
            "tags": sorted(set(tags)),
            "sourceCategory": "ECDICT:ky",
            "contentPackVersion": VERSION,
        })
    payload = {"packId": "english-1-vocabulary", "version": VERSION, "subject": "subject-english", "locale": "zh-CN", "publishedAt": "2026-10-03", "source": "ECDICT (MIT)", "itemCount": len(entries), "items": entries}
    digest = hashlib.sha256(json.dumps(payload["items"], ensure_ascii=False, separators=(",", ":")).encode()).hexdigest()
    payload["checksum"] = f"sha256:{digest}"
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"Wrote {len(entries)} entries to {OUTPUT} ({payload['checksum']})")


if __name__ == "__main__":
    main()
