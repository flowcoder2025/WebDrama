/**
 * 리서치 프롬프트 템플릿
 * creative 에이전트가 LLM 기반 리서치를 수행할 때 사용하는 프롬프트
 */

export function channelCollectorPrompt(genre: string, count: number): string {
  return `YouTube에서 "${genre}" 장르 웹드라마/애니메이션 채널을 분석해주세요.

조건:
- 상위 ${count}개 채널 선정 (구독자 수, 조회수 기준)
- 각 채널의 상위 5개 영상 메타데이터 수집

각 채널별 다음 정보를 JSON 형식으로 반환:
{
  "channelName": "채널명",
  "subscribers": 구독자수,
  "avgViews": 평균조회수,
  "uploadFrequency": "업로드 주기 (예: 주 2회)",
  "engagementRate": 참여율(좋아요+댓글/조회수 %),
  "topVideos": ["영상제목1", "영상제목2", ...]
}`;
}

export function storyPatternPrompt(genre: string): string {
  return `"${genre}" 장르 YouTube 웹드라마의 스토리 구조 패턴을 분석해주세요.

조회수 상위 작품들에서 공통으로 발견되는 패턴을 3개 이상 추출:
- 전체 스토리 구조 (기승전결, 3막, 에피소드 아크 등)
- 에피소드당 평균 길이
- 에피소드 수
- 출처 (어떤 채널/영상에서 추출)

JSON 형식:
{
  "genre": "${genre}",
  "structure": "구조 설명",
  "avgDuration": 초단위,
  "episodeCount": 에피소드수,
  "source": "출처"
}`;
}

export function visualPatternPrompt(genre: string): string {
  return `"${genre}" 장르 YouTube 웹드라마/애니메이션의 비주얼 스타일 패턴을 분석해주세요.

성공작에서 공통으로 사용하는 비주얼 요소:
- 화풍/스타일 (anime, realistic, 2.5D 등)
- 주요 색상 팔레트 (hex 코드)
- 구도 스타일 (클로즈업, 와이드샷 등)
- 썸네일 스타일

JSON 형식:
{
  "genre": "${genre}",
  "style": "화풍",
  "colorPalette": ["#hex1", "#hex2"],
  "composition": "구도 설명",
  "thumbnailStyle": "썸네일 스타일"
}`;
}

export function hookingPatternPrompt(): string {
  return `YouTube 웹드라마/애니메이션의 시청자 후킹 패턴을 분석해주세요.

3가지 유형별로 성공 사례를 분석:
1. opening — 첫 3초 오프닝 패턴 (시청자 이탈 방지)
2. cliffhanger — 영상 중간/끝 클리프행어 (시청 지속)
3. next-episode — 다음 에피소드 유도 (시리즈 시청)

각 유형별 JSON 형식:
{
  "type": "opening|cliffhanger|next-episode",
  "description": "패턴 설명",
  "examples": ["구체적 예시1", "예시2"]
}`;
}

export function trendKeywordPrompt(category: string): string {
  return `YouTube에서 "${category}" 카테고리의 현재 트렌드 키워드를 분석해주세요.

각 키워드별:
- 예상 월간 검색량
- 경쟁도 (low/medium/high)
- 현재 트렌딩 여부

JSON 형식:
{
  "keyword": "키워드",
  "searchVolume": 월간검색량,
  "competition": "low|medium|high",
  "trending": true|false
}`;
}
