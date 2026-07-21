from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def replace_once(relative: str, before: str, after: str) -> None:
    path = ROOT / relative
    source = path.read_text(encoding="utf-8")
    count = source.count(before)
    if count != 1:
        raise RuntimeError(f"Expected one match in {relative}, found {count}")
    path.write_text(source.replace(before, after, 1), encoding="utf-8")


for relative in [
    "next-zeo/app/admin/(dashboard)/settings/page.tsx",
    "next-zeo/app/admin/(dashboard)/director/page.tsx",
]:
    replace_once(
        relative,
        "        setError(null);\n        setLoadedSuccessfully(false);\n        (async () => {",
        "        (async () => {",
    )
    replace_once(
        relative,
        "onClick={() => { setLoading(true); setLoadAttempt(value => value + 1); }}",
        "onClick={() => { setError(null); setLoadedSuccessfully(false); setLoading(true); setLoadAttempt(value => value + 1); }}",
    )

Path(__file__).unlink()
print("Refined admin load safety state handling")
