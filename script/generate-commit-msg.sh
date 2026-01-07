#!/bin/bash
# generate-commit-msg.sh
# 오케스트레이션: git diff 수집 → Claude 에이전트 호출 → 사용자 입력 처리 → 커밋 실행

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROMPT_FILE="$SCRIPT_DIR/agents/commit-msg-prompt.txt"
SCHEMA_FILE="$SCRIPT_DIR/agents/commit-msg-schema.json"

# 기본 언어 설정
TITLE_LANG="en"
MESSAGE_LANG="ko"

# 옵션 파싱
while [[ $# -gt 0 ]]; do
    case $1 in
        --title-lang)
            TITLE_LANG="$2"
            shift 2
            ;;
        --message-lang)
            MESSAGE_LANG="$2"
            shift 2
            ;;
        --lang)
            TITLE_LANG="$2"
            MESSAGE_LANG="$2"
            shift 2
            ;;
        -h|--help)
            echo "Usage: $0 [options]"
            echo ""
            echo "Options:"
            echo "  --title-lang <en|ko>    Language for commit title (default: en)"
            echo "  --message-lang <en|ko>  Language for commit message (default: ko)"
            echo "  --lang <en|ko>          Set both title and message language"
            echo "  -h, --help              Show this help"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# Git 저장소 확인
if ! git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
    echo -e "${RED}Error: Not a git repository${NC}" >&2
    exit 1
fi

# Git 정보 수집
BRANCH=$(git branch --show-current)
DIFF=$(git diff HEAD 2>/dev/null || git diff)
UNTRACKED=$(git ls-files --others --exclude-standard)

# 변경사항 없으면 종료
if [ -z "$DIFF" ] && [ -z "$UNTRACKED" ]; then
    echo -e "${YELLOW}No changes to commit${NC}"
    exit 0
fi

# 세션 ID 저장 변수
SESSION_ID=""

# Claude 에이전트 호출 함수
call_agent() {
    local input="$1"
    local resume_flag=""

    if [ -n "$SESSION_ID" ]; then
        resume_flag="--resume $SESSION_ID"
    fi

    # Claude 호출 및 JSON 응답 받기 (JSON 스키마 강제)
    local response
    response=$(echo "$input" | claude -p \
        --model haiku \
        --output-format json \
        --json-schema "$(cat "$SCHEMA_FILE")" \
        --append-system-prompt "$(cat "$PROMPT_FILE")" \
        $resume_flag)

    # 세션 ID 추출 (첫 호출 시)
    if [ -z "$SESSION_ID" ]; then
        SESSION_ID=$(echo "$response" | jq -r '.session_id // empty' 2>/dev/null)
    fi

    # structured_output 필드에서 결과 추출
    echo "$response" | jq -c '.structured_output // empty' 2>/dev/null
}

# JSON에서 커밋 메시지 추출하여 표시
display_commits() {
    local json="$1"

    echo -e "\n${GREEN}=== Proposed Commits ===${NC}\n"

    # JSON 배열 파싱하여 표시
    local count
    count=$(echo "$json" | jq '.commits | length' 2>/dev/null)

    for ((i=0; i<count; i++)); do
        local files title message
        files=$(echo "$json" | jq -r ".commits[$i].files | join(\", \")" 2>/dev/null)
        title=$(echo "$json" | jq -r ".commits[$i].title" 2>/dev/null)
        message=$(echo "$json" | jq -r ".commits[$i].message" 2>/dev/null)

        echo -e "${CYAN}[$((i+1))]${NC} ${GREEN}$title${NC}"
        echo -e "    Files: $files"
        echo -e "    Message: $message"
        echo ""
    done
}

# 커밋 실행
execute_commits() {
    local json="$1"

    local count
    count=$(echo "$json" | jq '.commits | length' 2>/dev/null)

    for ((i=0; i<count; i++)); do
        local files title message
        files=$(echo "$json" | jq -r ".commits[$i].files[]" 2>/dev/null)
        title=$(echo "$json" | jq -r ".commits[$i].title" 2>/dev/null)
        message=$(echo "$json" | jq -r ".commits[$i].message" 2>/dev/null)

        # 파일 스테이징
        echo -e "${YELLOW}Staging files for commit $((i+1))...${NC}"
        while IFS= read -r file; do
            if [ -n "$file" ]; then
                # 파일이 존재하면 add, 삭제된 파일이면 rm으로 스테이징
                if [ -e "$file" ]; then
                    git add "$file"
                else
                    git rm --cached "$file" 2>/dev/null || git add -A "$file" 2>/dev/null || true
                fi
            fi
        done <<< "$files"

        # 커밋 실행
        echo -e "${GREEN}Committing: $title${NC}"
        if ! git commit -m "$title" -m "$message"; then
            echo -e "${RED}Commit failed. Aborting.${NC}" >&2
            exit 1
        fi

        echo ""
    done

    echo -e "${GREEN}All commits completed successfully!${NC}"
}

# 메인 로직
echo -e "${GREEN}Analyzing changes on branch: ${CYAN}$BRANCH${NC}"

# 첫 번째 에이전트 호출
INPUT="TITLE_LANG: $TITLE_LANG
MESSAGE_LANG: $MESSAGE_LANG
Branch: $BRANCH

Diff:
$DIFF

Untracked files:
$UNTRACKED"

COMMITS_JSON=$(call_agent "$INPUT")

# JSON 파싱 및 commits 배열 추출
if ! echo "$COMMITS_JSON" | jq -e '.commits' > /dev/null 2>&1; then
    echo -e "${RED}Failed to parse agent response${NC}" >&2
    echo "Raw response: $COMMITS_JSON"
    exit 1
fi

# 메인 루프
while true; do
    display_commits "$COMMITS_JSON"

    echo -e "${YELLOW}[y]${NC} Commit all  ${YELLOW}[n]${NC} Cancel  ${YELLOW}[text]${NC} Provide feedback"
    read -r -p "> " user_input

    case "$user_input" in
        y|Y)
            execute_commits "$COMMITS_JSON"
            break
            ;;
        n|N)
            echo -e "${YELLOW}Cancelled${NC}"
            exit 0
            ;;
        "")
            echo -e "${RED}Please enter y, n, or feedback text${NC}"
            ;;
        *)
            # 피드백으로 에이전트 재호출
            echo -e "${CYAN}Sending feedback to agent...${NC}"
            COMMITS_JSON=$(call_agent "$user_input")

            if ! echo "$COMMITS_JSON" | jq -e '.commits' > /dev/null 2>&1; then
                echo -e "${RED}Failed to parse agent response${NC}" >&2
                echo "Raw response: $COMMITS_JSON"
            fi
            ;;
    esac
done
