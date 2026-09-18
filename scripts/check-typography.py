#!/usr/bin/env python3
"""Reject new raw font sizes so website typography stays on named tokens."""

from __future__ import annotations

import re
import subprocess
import sys


RAW_SIZE = re.compile(
    r"(?:font-size|fontSize)\s*:\s*(?:\d+(?:\.\d+)?(?:px|rem|em)\b|clamp\()"
)
SOURCE_PATHS = tuple(
    f":(glob)**/*{suffix}"
    for suffix in (".css", ".html", ".js", ".jsx", ".ts", ".tsx")
)


def git_diff(*args: str) -> str:
    result = subprocess.run(
        ["git", "diff", "--unified=0", *args, "--", *SOURCE_PATHS],
        check=False,
        capture_output=True,
        text=True,
    )
    return result.stdout


working_diff = git_diff("HEAD")
diff = working_diff or git_diff("HEAD^", "HEAD")
violations: list[str] = []
current_file = ""

for line in diff.splitlines():
    if line.startswith("+++ b/"):
        current_file = line[6:]
    elif line.startswith("+") and not line.startswith("+++") and RAW_SIZE.search(line):
        violations.append(f"{current_file}: {line[1:].strip()}")

if violations:
    print("New typography must use a named CSS token, not a numeric font size:")
    for violation in violations:
        print(f"- {violation}")
    print("Use one of the --type-* roles documented in docs/typography.md.")
    sys.exit(1)

print("Typography check passed: no new raw font-size declarations.")
