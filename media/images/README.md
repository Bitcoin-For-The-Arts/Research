# Images

Hero art, section headers, and motif illustrations for **Bitcoin for the Arts Research** reports.

See [`../README.md`](../README.md) for the labeling standard — in particular, the AI-generated imagery disclosure policy.

## Current hero images (v1 reports)

| File | Used by | Live |
|---|---|---|
| [`State-of-Funding-2026.jpg`](State-of-Funding-2026.jpg) | *The State of Arts Funding 2026* | [report](https://bitcoinforthearts.org/research/state-of-arts-funding-2026) |
| [`ARPA-Cliff.jpg`](ARPA-Cliff.jpg) | *The ARPA Cliff* | [report](https://bitcoinforthearts.org/research/the-arpa-cliff) |
| [`Sound-Money-For-Sound-Arts.jpg`](Sound-Money-For-Sound-Arts.jpg) | *Sound Money for the Arts* | [report](https://bitcoinforthearts.org/research/sound-money-for-the-arts) |
| [`Art-funding-outlook.jpg`](Art-funding-outlook.jpg) | Portal / cross-report illustration — arts funding outlook | [portal](https://bitcoinforthearts.org/research) |
| [`1_Sound-Money-Better-Art.jpg`](1_Sound-Money-Better-Art.jpg) | Companion image — *Sound Money, Better Art* education + research crossover | — |

These files are the canonical originals. The live Next.js app at [`Bitcoin-For-The-Arts/Bitcoin-For-The-Arts`](https://github.com/Bitcoin-For-The-Arts/Bitcoin-For-The-Arts) currently ships byte-identical copies at `public/` for runtime serving on Vercel.

## AI-generated imagery disclosure

The hero images above are stylized illustrations created with AI assistance to depict the **already-verified** subject matter of each report (classical-sculpture / cliff-edge / sound-money motifs). They do not contain or imply data that has not been independently sourced through the report's primary-source citations in [`../../data/reports/`](../../data/reports/).

When future images are added, follow the disclosure convention in [`../README.md`](../README.md): every AI-generated image carries a sibling `.notes.txt` file recording generator, prompt summary, date, depicted concept, and the citation IDs of the verified data being depicted.

## How to add a new image

1. Place the file in this folder using the naming pattern `<report-slug>-hero.<ext>` for hero art, or `<report-slug>-section-<n>.<ext>` for section headers.
2. If the image is AI-generated, add the sibling `.notes.txt` as described above.
3. Update this README's table.
4. Open a pull request per [`../../CONTRIBUTING.md`](../../CONTRIBUTING.md).
