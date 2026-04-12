#!/usr/bin/env bash
# check-ownership.sh — 팀 소유권 기반 파일 수정 제한 (v3.4)
# PreToolUse hook (matcher: "Edit|Write")
# hotfix/ 브랜치에서는 소유권 제한 완화
#
# 모드 판별 (TEAM_NAME 환경변수 기준):
#   환경변수 있음 → 팀 워커 모드: 해당 팀 소유 + shared만 허용
#   환경변수 없음 → 리드 모드: 활성 팀(.team 파일) 소유 파일 차단, 나머지 허용

export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8

# stdin에서 hook 입력 읽기
INPUT=$(cat 2>/dev/null || true)

# hotfix 브랜치면 소유권 제한 완화
current_branch=$(git branch --show-current 2>/dev/null || echo "")
if [[ "$current_branch" == hotfix/* ]]; then
  exit 0
fi

# tool_input에서 file_path 추출
file_path=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty' 2>/dev/null)
if [[ -z "$file_path" ]]; then
  exit 0
fi

# null byte, newline, 제어문자 제거 (context poisoning 방어)
file_path=$(printf '%s' "$file_path" | tr -d '\0\n\r' | tr -d '[:cntrl:]')

# Windows 경로 정규화 (cwd 제거보다 먼저 수행)
file_path=$(printf '%s' "$file_path" | tr '\\' '/')

# 상대 경로로 정규화
cwd=$(echo "$INPUT" | jq -r '.cwd // empty' 2>/dev/null)
cwd=$(printf '%s' "$cwd" | tr '\\' '/')
if [[ -n "$cwd" && "$file_path" == "$cwd/"* ]]; then
  file_path="${file_path#$cwd/}"
fi
# 드라이브 레터로 남은 절대경로 처리
if [[ "$file_path" == [A-Z]:/* ]]; then
  local_cwd=$(pwd | tr '\\' '/')
  if [[ "$file_path" == "$local_cwd/"* ]]; then
    file_path="${file_path#$local_cwd/}"
  fi
fi

# leading slash 제거 (방어적 정규화)
file_path="${file_path#/}"

# ownership.json 읽기
OWNERSHIP_FILE=".flowset/ownership.json"
if [[ ! -f "$OWNERSHIP_FILE" ]]; then
  exit 0
fi

# --- 공유 파일 체크 (모든 모드 공통, 최우선) ---
_match_glob() {
  # ownership 패턴을 bash 패턴 매칭으로 검사
  # ** → * 로 치환 (bash [[ ]] 에서 *는 /를 포함한 모든 문자 매칭)
  local file="$1" pattern="$2"
  pattern="${pattern//$'\r'/}"
  local bash_pattern="${pattern//\*\*/*}"
  [[ "$file" == $bash_pattern ]]
}

shared_files=$(jq -r '.shared[]? // empty' "$OWNERSHIP_FILE" 2>/dev/null)
while IFS= read -r pattern; do
  [[ -z "$pattern" ]] && continue
  if _match_glob "$file_path" "$pattern"; then
    exit 0
  fi
done <<< "$shared_files"

# --- 모드 판별: TEAM_NAME 환경변수 직접 체크 (resolve-team.sh 폴백 사용 안 함) ---
if [[ -n "${TEAM_NAME:-}" ]]; then
  # ========== 팀 워커 모드 ==========
  # 해당 팀 소유 파일 + shared만 허용 (기존 로직)

  team_patterns=$(jq -r --arg team "$TEAM_NAME" '
    .teams[$team] |
    if type == "array" then .[]
    else .owns[]?
    end
  ' "$OWNERSHIP_FILE" 2>/dev/null)
  if [[ -z "$team_patterns" ]]; then
    echo "[ownership] WARNING: team '$TEAM_NAME' not found in ownership.json" >&2
    exit 0
  fi

  allowed=false
  while IFS= read -r pattern; do
    [[ -z "$pattern" ]] && continue
    if _match_glob "$file_path" "$pattern"; then
      allowed=true
      break
    fi
  done <<< "$team_patterns"

  if [[ "$allowed" == "true" ]]; then
    exit 0
  fi

  jq -n \
    --arg team "$TEAM_NAME" \
    --arg path "$file_path" \
    '{
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason: ("[ownership] \($team) 팀은 \($path) 파일을 수정할 수 없습니다. 팀 소유 디렉토리만 수정 가능합니다.")
      }
    }'

else
  # ========== 리드 모드 (TEAM_NAME 환경변수 없음) ==========
  # 활성 팀(.team 파일 존재)의 소유 파일만 차단, 나머지 허용

  # 활성 팀이 없으면 pass
  if [[ ! -d ".flowset/teams" ]]; then
    exit 0
  fi

  # 활성 팀 목록 수집 (.team 파일 내용 = 팀명)
  active_teams=()
  for f in .flowset/teams/*.team; do
    [[ -f "$f" ]] || continue
    local_basename=$(basename "$f" .team)
    [[ "$local_basename" =~ ^[0-9]+$ ]] && continue
    local_content=$(tr -d '[:space:]' < "$f" 2>/dev/null)
    [[ -n "$local_content" ]] && active_teams+=("$local_content")
  done

  if [[ ${#active_teams[@]} -eq 0 ]]; then
    exit 0
  fi

  # 활성 팀의 소유 경로와 매칭 체크
  for team in "${active_teams[@]}"; do
    team_patterns=$(jq -r --arg team "$team" '
      .teams[$team] |
      if type == "array" then .[]
      else .owns[]?
      end
    ' "$OWNERSHIP_FILE" 2>/dev/null)

    while IFS= read -r pattern; do
      [[ -z "$pattern" ]] && continue
      if _match_glob "$file_path" "$pattern"; then
        jq -n \
          --arg team "$team" \
          --arg path "$file_path" \
          '{
            hookSpecificOutput: {
              hookEventName: "PreToolUse",
              permissionDecision: "deny",
              permissionDecisionReason: ("[ownership] \($path) 파일은 활성 팀 \($team)의 소유입니다. 리드가 직접 수정할 수 없습니다.")
            }
          }'
        exit 0
      fi
    done <<< "$team_patterns"
  done

  # 어떤 활성 팀에도 매칭 안 됨 → 허용
  exit 0
fi
