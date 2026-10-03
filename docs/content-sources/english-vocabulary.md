# English vocabulary pack provenance

The `english-1-vocabulary` pack is derived from the `ky`-tagged entries in the open-source [ECDICT](https://github.com/skywind3000/ECDICT) database. ECDICT is distributed under the MIT License. The checked-in pack selects 1,000 single-word entries by the available BNC/contemporary frequency rank and retains the dictionary's phonetic, part-of-speech, Chinese meaning, English definition, inflection and exam-category metadata.

The `ky` tag and corpus ranks are source metadata. Personal Learning OS does not describe the list as an official or exhaustive examination vocabulary list. The high/medium/low tiers are local ordering bands within this selected pack, not official frequency claims.

ECDICT does not consistently provide examples, collocations, synonyms or antonyms. Those fields remain empty when the source has no data; the build script does not fabricate them. User familiarity, favorites and review dates are stored as personal overlays and are not part of the content pack.

Regenerate with:

```text
python scripts/build-english-vocabulary-pack.py path/to/ecdict.csv
```

The source CSV is intentionally not stored in this repository. The output manifest includes a SHA-256 checksum of the selected items.
