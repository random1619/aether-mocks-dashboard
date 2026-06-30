#!/usr/bin/env python3
"""
Batch-update all mock HTML files to replace hardcoded inline colors
with CSS variable references, so the warm palette and dark mode work correctly.
"""
import os
import re
import glob

PUBLIC_DIR = os.path.join(os.path.dirname(__file__), "public")

# All hardcoded colors that should become CSS variable references
COLOR_REPLACEMENTS = {
    # Welcome screen title / headings
    'color: #0f172a': 'color: var(--text-main)',
    'color:#0f172a': 'color:var(--text-main)',
    # Subtitle / muted text
    'color: #64748b': 'color: var(--text-muted)',
    'color:#64748b': 'color:var(--text-muted)',
    # Detail item backgrounds
    'background: #f8fafc': 'background: var(--bg-color)',
    'background:#f8fafc': 'background:var(--bg-color)',
    # Detail item borders
    'border: 1px solid #e2e8f0': 'border: 1px solid var(--border-color)',
    'border:1px solid #e2e8f0': 'border:1px solid var(--border-color)',
    'border: 1px solid #e2e8f0;': 'border: 1px solid var(--border-color);',
    # Stat count colors (green)
    'color: #10b981': 'color: var(--success)',
    'color:#10b981': 'color:var(--success)',
    # Stat count colors (amber)
    'color: #f59e0b': 'color: var(--warning)',
    'color:#f59e0b': 'color:var(--warning)',
    # Stat count colors (gray)
    'color: #64748b;': 'color: var(--text-muted);',
    # Stat count colors (light gray)
    'color: #94a3b8': 'color: var(--text-muted)',
    'color:#94a3b8': 'color:var(--text-muted)',
    # Welcome screen background
    'background-color: #f8fafc': 'background-color: var(--bg-color)',
    'background-color:#f8fafc': 'background-color:var(--bg-color)',
    # Button primary color in welcome
    'color: #3b82f6': 'color: var(--primary)',
    'color:#3b82f6': 'color:var(--primary)',
    # Nav controls border
    'border-top: 1px solid #e2e8f0': 'border-top: 1px solid var(--border-color)',
    'border-top:1px solid #e2e8f0': 'border-top:1px solid var(--border-color)',
    # Exam container background
    'background: #f1f5f9': 'background: var(--bg-color)',
    'background:#f1f5f9': 'background:var(--bg-color)',
    # Settings panel inline
    'background: #f8fafc;': 'background: var(--bg-color);',
    'border: 1px solid #e2e8f0;': 'border: 1px solid var(--border-color);',
}


def fix_file(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    original = content

    for old, new in COLOR_REPLACEMENTS.items():
        content = content.replace(old, new)

    if content != original:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        return True
    return False


def main():
    # Find all HTML files in Static GK, English Madhyam, Oliiveboardd, The solver
    patterns = [
        os.path.join(PUBLIC_DIR, "static GK", "*.html"),
        os.path.join(PUBLIC_DIR, "English Madhyam", "**", "*.html"),
        os.path.join(PUBLIC_DIR, "Oliiveboardd", "**", "*.html"),
        os.path.join(PUBLIC_DIR, "The solver", "**", "*.html"),
        os.path.join(PUBLIC_DIR, "360 Mocks", "**", "*.html"),
        os.path.join(PUBLIC_DIR, "Pundiits", "**", "*.html"),
    ]

    files = set()
    for pattern in patterns:
        files.update(glob.glob(pattern, recursive=True))

    print(f"Found {len(files)} HTML files to process")

    fixed = 0
    for filepath in sorted(files):
        if fix_file(filepath):
            fixed += 1
            print(f"  Fixed: {os.path.relpath(filepath, PUBLIC_DIR)}")

    print(f"\nDone: {fixed} files updated out of {len(files)}")


if __name__ == "__main__":
    main()
