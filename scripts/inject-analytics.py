#!/usr/bin/env python3
"""
Inject the Google Tag Manager snippet into every HTML page of the site.

- Idempotent: running it twice changes nothing.
- Pages that already have the block get it refreshed (so changing the ID
  below updates every page in one run).
- New HTML files (e.g. a new tool in tools/) get the tag automatically.

Usage:
  python3 scripts/inject-analytics.py            # write changes
  python3 scripts/inject-analytics.py --check    # exit 1 if any page needs changes
"""
import os
import re
import sys

GTM_ID = os.environ.get("GTM_ID", "GTM-NKMX6S6T")

START = "<!-- ToolForge analytics:start -->"
END = "<!-- ToolForge analytics:end -->"

SNIPPET = f"""{START}
    <script async src="https://www.googletagmanager.com/gtm.js?id={GTM_ID}"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){{dataLayer.push(arguments);}}
      gtag('js', new Date());
    </script>
    {END}"""

BLOCK_RE = re.compile(re.escape(START) + r".*?" + re.escape(END), re.S)
HEAD_RE = re.compile(r"<head\b[^>]*>", re.I)
SKIP_DIRS = {".git", "node_modules", "dist", ".github", "scripts"}

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))


def html_files():
    for dirpath, dirnames, filenames in os.walk(ROOT):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
        for name in filenames:
            if name.lower().endswith(".html"):
                yield os.path.join(dirpath, name)


def process(path, write):
    with open(path, encoding="utf-8") as f:
        original = f.read()

    if BLOCK_RE.search(original):
        updated = BLOCK_RE.sub(SNIPPET, original, count=1)
    else:
        m = HEAD_RE.search(original)
        if not m:
            print(f"SKIP (no <head>): {os.path.relpath(path, ROOT)}")
            return False
        nl = "\n"
        insert_at = m.end()
        updated = original[:insert_at] + nl + "    " + SNIPPET + original[insert_at:]

    if updated == original:
        return False

    if write:
        with open(path, "w", encoding="utf-8", newline="") as f:
            f.write(updated)
    print(f"{'UPDATED' if write else 'NEEDS UPDATE'}: {os.path.relpath(path, ROOT)}")
    return True


def main():
    check = "--check" in sys.argv
    changed = 0
    total = 0
    for path in sorted(html_files()):
        total += 1
        if process(path, write=not check):
            changed += 1
    print(f"\n{total} HTML files scanned, {changed} need the analytics tag {'(check mode, nothing written)' if check else 'updated'}.")
    if check and changed:
        sys.exit(1)


if __name__ == "__main__":
    main()
