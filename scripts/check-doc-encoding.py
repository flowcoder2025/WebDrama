#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""WebDrama 문서 인코딩 lint.

모든 section sign(U+00A7)은 치환 대상. 이중 표기 예외 없음.
standards.md 5장 규약 준수 검증.
"""
import re
import sys
from pathlib import Path

FORBIDDEN_CHARS = set([
    '\u00a7',  # section sign
    '\u00b7',  # middle dot
    '\u2013', '\u2014', '\u2026',
    '\u2190', '\u2192', '\u2194',
    '\u2264', '\u2265',
    '\u2605', '\u2606', '\u2b50', '\u2728',
    '\u2713', '\u2714', '\u2717',
    '\u26a0', '\u2705', '\u274c',
    '\u25b6', '\u25bc', '\u25b3',
    '\u2022',
])

EMOJI_RANGES = [
    (0x1F300, 0x1F5FF), (0x1F600, 0x1F64F), (0x1F680, 0x1F6FF),
    (0x1F700, 0x1F77F), (0x1F780, 0x1F7FF), (0x1F800, 0x1F8FF),
    (0x1F900, 0x1F9FF), (0x1FA00, 0x1FA6F), (0x1FA70, 0x1FAFF),
    (0x2600, 0x26FF), (0x2700, 0x27BF), (0x2B00, 0x2BFF),
]
BOX_DRAWING_RANGE = (0x2500, 0x257F)

CHECKBOX_PATTERN = re.compile(r'\[[\sxX]\]')

WHITELIST_PATHS = {
    'docs/standards.md',
    '.flowset/requirements.md',
}

EXCLUDED_DIRS = {'_archive', '.git', 'node_modules'}
LEGACY_DIR_PATTERN = re.compile(r'_v\d+$|_legacy$')


def is_emoji(c):
    cp = ord(c)
    return any(start <= cp <= end for start, end in EMOJI_RANGES)


def is_box_drawing(c):
    cp = ord(c)
    return BOX_DRAWING_RANGE[0] <= cp <= BOX_DRAWING_RANGE[1]


def check_line(line):
    line_masked = CHECKBOX_PATTERN.sub('', line)
    violations = []
    for c in line_masked:
        if c in FORBIDDEN_CHARS:
            violations.append((c, f'U+{ord(c):04X} forbidden'))
        elif is_emoji(c):
            violations.append((c, f'U+{ord(c):04X} emoji'))
        elif is_box_drawing(c):
            violations.append((c, f'U+{ord(c):04X} box-drawing'))
    return violations


def check_file(path, rel_path):
    rel = rel_path.replace('\\', '/')
    if rel in WHITELIST_PATHS:
        return []
    try:
        text = path.read_text(encoding='utf-8')
    except (UnicodeDecodeError, OSError) as e:
        return [(0, f'READ_ERROR: {e}')]
    violations = []
    for i, line in enumerate(text.splitlines(), 1):
        for ch, msg in check_line(line):
            violations.append((i, f'{msg} {repr(ch)} in: {line.strip()[:80]}'))
    return violations


def main():
    root = Path('.')
    total = 0
    for path in root.rglob('*.md'):
        if any(part in EXCLUDED_DIRS for part in path.parts):
            continue
        if any(LEGACY_DIR_PATTERN.search(part) for part in path.parts):
            continue
        rel = str(path.relative_to(root))
        for line_no, msg in check_file(path, rel):
            print(f'{rel}:{line_no}: {msg}')
            total += 1
    if total:
        print(f'\nTotal violations: {total}', file=sys.stderr)
        return 1
    return 0


if __name__ == '__main__':
    sys.exit(main())
