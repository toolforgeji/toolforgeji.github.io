#!/usr/bin/env python3
import os
import zipfile

# Files and directories to package into toolforge.zip
INCLUDE_PATHS = [
    'index.html',
    'about.html',
    'contact.html',
    '404.html',
    'tools.json',
    'sitemap.xml',
    'robots.txt',
    'README.md',
    'LICENSE',
    'manifest.webmanifest',
    'sw.js',
    'tools',
    'assets'
]

OUTPUT_ZIP = 'toolforge.zip'
ARTIFACT_DIR = '/.aistudio/artifacts/brain/c01acdd7-564f-48c5-b323-813ae942e55b'
ARTIFACT_ZIP = os.path.join(ARTIFACT_DIR, 'toolforge.zip')
PUBLIC_ZIP = os.path.join('assets', 'toolforge.zip')

def make_zip(dest_path):
    print(f"Creating zip at: {dest_path}")
    count = 0
    with zipfile.ZipFile(dest_path, 'w', zipfile.ZIP_DEFLATED) as zf:
        for item in INCLUDE_PATHS:
            if not os.path.exists(item):
                print(f"Warning: {item} does not exist, skipping.")
                continue
            if os.path.isfile(item):
                zf.write(item, item)
                count += 1
            elif os.path.isdir(item):
                for root, dirs, files in os.walk(item):
                    for file in files:
                        full_path = os.path.join(root, file)
                        # Avoid including zip inside itself
                        if full_path.endswith('.zip'):
                            continue
                        rel_path = os.path.relpath(full_path, '.')
                        zf.write(full_path, rel_path)
                        count += 1
    size_kb = os.path.getsize(dest_path) / 1024
    print(f"Added {count} files. Total archive size: {size_kb:.2f} KB")

if __name__ == '__main__':
    # 1. Create root zip
    make_zip(OUTPUT_ZIP)

    # 2. Copy to assets for in-browser download
    os.makedirs('assets', exist_ok=True)
    make_zip(PUBLIC_ZIP)

    # 3. Copy to artifacts directory
    if os.path.exists(ARTIFACT_DIR):
        make_zip(ARTIFACT_ZIP)
