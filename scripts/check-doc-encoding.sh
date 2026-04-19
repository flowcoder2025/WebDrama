#!/usr/bin/env bash

export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8
export PYTHONUTF8=1
export PYTHONIOENCODING=utf-8
[[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]] && chcp.com 65001 > /dev/null 2>&1

set -euo pipefail

python3 "$(dirname "$0")/check-doc-encoding.py"
