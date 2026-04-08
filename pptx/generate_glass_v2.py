#!/usr/bin/env python3
"""
OMA WebUI v2 — Glassmorphism v2
본편 12장 + Appendix 7장 = 19장
모든 슬라이드에 발표 스크립트(노트) 포함
"""
from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE
from pptx.oxml.ns import qn
from lxml import etree
import os, textwrap

# === Colors ===
BG_DEEP = RGBColor(0x0F, 0x0F, 0x2D)
GLASS_BG = RGBColor(0xFF, 0xFF, 0xFF)
GLASS_BORDER = RGBColor(0xFF, 0xFF, 0xFF)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
SOFT_WHITE = RGBColor(0xE0, 0xE0, 0xF0)
CYAN = RGBColor(0x67, 0xE8, 0xF9)
VIOLET = RGBColor(0xA7, 0x8B, 0xFA)
MUTED = RGBColor(0x99, 0x99, 0xBB)
SUCCESS_G = RGBColor(0x6E, 0xE7, 0xB7)
WARN_G = RGBColor(0xFD, 0xE0, 0x68)
CORAL_G = RGBColor(0xFF, 0x8B, 0x8B)

# === Helpers ===
def set_dark_bg(slide):
    slide.background.fill.solid()
    slide.background.fill.fore_color.rgb = BG_DEEP

def add_glow(slide, l, t, w, h, color):
    shape = slide.shapes.add_shape(MSO_SHAPE.OVAL, Inches(l), Inches(t), Inches(w), Inches(h))
    shape.fill.solid(); shape.fill.fore_color.rgb = color; shape.line.fill.background()
    for sf in shape._element.spPr.iter(qn('a:srgbClr')):
        etree.SubElement(sf, qn('a:alpha')).set('val', '15000'); break

def setup(slide):
    set_dark_bg(slide)
    add_glow(slide, -2, -1, 6, 6, RGBColor(0x6B, 0x21, 0xA8))
    add_glow(slide, 8, 3, 7, 5, RGBColor(0x1E, 0x3A, 0x5F))
    add_glow(slide, 4, -2, 5, 4, RGBColor(0x3B, 0x09, 0x6B))

def glass(slide, l, t, w, h, op=18):
    shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(l), Inches(t), Inches(w), Inches(h))
    shape.fill.solid(); shape.fill.fore_color.rgb = GLASS_BG
    shape.line.color.rgb = GLASS_BORDER; shape.line.width = Pt(0.75)
    for sf in shape._element.spPr.iter(qn('a:srgbClr')):
        etree.SubElement(sf, qn('a:alpha')).set('val', str(op * 1000)); break
    ln = shape._element.spPr.find(qn('a:ln'))
    if ln is not None:
        for sf in ln.iter(qn('a:srgbClr')):
            etree.SubElement(sf, qn('a:alpha')).set('val', '25000'); break
    shape.adjustments[0] = 0.06
    return shape

def txt(slide, l, t, w, h, text, sz=14, c=WHITE, b=False, al=PP_ALIGN.LEFT, fn="Segoe UI"):
    tb = slide.shapes.add_textbox(Inches(l), Inches(t), Inches(w), Inches(h))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = text; p.font.size = Pt(sz); p.font.color.rgb = c
    p.font.bold = b; p.font.name = fn; p.alignment = al
    return tf

def ginfo(slide, l, t, w, h, title, lines, accent=CYAN, op=18):
    glass(slide, l, t, w, h, op)
    txt(slide, l+0.25, t+0.2, w-0.5, 0.35, title, 16, accent, True, fn="Segoe UI Light")
    y = t + 0.6
    for line in lines:
        txt(slide, l+0.25, y, w-0.5, 0.22, line, 10, SOFT_WHITE); y += 0.24

def gstat(slide, l, t, w, h, num, label, accent=CYAN, op=18):
    glass(slide, l, t, w, h, op)
    txt(slide, l+0.25, t+h*0.12, w-0.5, h*0.5, str(num), 52, WHITE, True, fn="Segoe UI Light")
    txt(slide, l+0.25, t+h*0.62, w-0.5, h*0.3, label, 11, accent)

def note(slide, text):
    """Add speaker notes"""
    slide.notes_slide.notes_text_frame.text = textwrap.dedent(text).strip()

# ============================================================
prs = Presentation()
prs.slide_width = Emu(12192000); prs.slide_height = Emu(6858000)
blank = prs.slide_layouts[6]

# ====================== SLIDE 1: Title ======================
s = prs.slides.add_slide(blank); setup(s)
glass(s, 0.8, 1.2, 7.5, 4.5, 12)
txt(s, 1.3, 1.8, 6.5, 1, "Oracle Migration", 44, WHITE, True, fn="Segoe UI Light")
txt(s, 1.3, 2.8, 6.5, 0.8, "Accelerator", 44, CYAN, True, fn="Segoe UI Light")
txt(s, 1.3, 3.8, 6.5, 0.5, "WebUI v2 — 현황 및 로드맵", 18, SOFT_WHITE, fn="Segoe UI Light")
txt(s, 1.3, 4.5, 6.5, 0.4, "Oracle→PostgreSQL 마이그레이션을 가속하는 통합 UI", 11, MUTED)
gstat(s, 9, 1.2, 3.5, 1.3, "25", "Pages", CYAN)
gstat(s, 9, 2.65, 3.5, 1.3, "23", "Features", VIOLET)
gstat(s, 9, 4.1, 3.5, 1.3, "4", "Docs", SUCCESS_G)
note(s, """
    안녕하세요. Oracle Migration Accelerator WebUI v2 현황을 공유드리겠습니다.
    OMA는 Oracle에서 PostgreSQL로의 마이그레이션을 가속하는 통합 UI입니다.
    현재 25개 페이지, 23개 기능, 4개 통합 문서가 완성된 상태입니다.
    약 10분간 구현된 기능과 앞으로의 작업에 대해 말씀드리겠습니다.
""")

# ====================== SLIDE 2: Problem ======================
s = prs.slides.add_slide(blank); setup(s)
txt(s, 0.6, 0.3, 10, 0.5, "왜 OMA WebUI가 필요한가?", 28, WHITE, True, fn="Segoe UI Light")
txt(s, 0.6, 0.85, 10, 0.3, "Oracle→PostgreSQL 마이그레이션 자동화 과제", 12, MUTED)
gstat(s, 0.5, 1.4, 4, 2.2, "65%", "DMS 자동 변환율\n나머지 35%는 AI + 수동", CYAN)
ginfo(s, 4.65, 1.4, 4, 2.2, "앱 마이그레이션 과제", ["MyBatis XML 내 Oracle SQL", "수백~수천 건 변환 필요", "전용 도구 부재", "런타임 SQL 수집 필요"], CORAL_G)
ginfo(s, 8.8, 1.4, 3.8, 2.2, "데이터 복제", ["DMS Full Load + CDC", "테이블별 진행률 추적", "원본↔대상 검증"], VIOLET)
glass(s, 0.5, 3.85, 12.1, 2.7, 10)
txt(s, 0.8, 4.0, 10, 0.35, "해결: 3단계 통합 파이프라인", 18, WHITE, True, fn="Segoe UI Light")
ginfo(s, 0.7, 4.5, 3.6, 1.8, "① DB 스키마 변환", ["DMS SC + AI Agent", "Assessment → 리트라이", "스키마 검증"], CYAN, 12)
ginfo(s, 4.5, 4.5, 3.6, 1.8, "② 앱 SQL 변환", ["XML 파싱 + 런타임 수집", "sqlglot + AI 폴백", "XML 병합 → 테스트"], VIOLET, 12)
ginfo(s, 8.3, 4.5, 4.1, 1.8, "③ 데이터 복제", ["Full Load + CDC", "테이블별 모니터링", "데이터 일치성 검증"], SUCCESS_G, 12)
note(s, """
    먼저 왜 이 도구가 필요한지 말씀드리겠습니다.
    AWS DMS Schema Conversion의 자동 변환율은 약 65%입니다. 나머지 35%는 AI 에이전트와 수동 검토가 필요합니다.
    또한 MyBatis XML 내 Oracle 특화 SQL이 수백에서 수천 건 있는데, 이를 변환할 별도 도구가 없었습니다.
    OMA WebUI는 이 3단계 — DB 스키마, 앱 SQL, 데이터 복제 — 를 하나의 UI에서 통합 관리합니다.
""")

# ====================== SLIDE 3: Architecture ======================
s = prs.slides.add_slide(blank); setup(s)
txt(s, 0.6, 0.3, 10, 0.5, "시스템 아키텍처", 28, WHITE, True, fn="Segoe UI Light")
txt(s, 0.6, 0.85, 10, 0.3, "Frontend ←→ ALB ←→ 2 Backends ←→ AWS Services", 12, MUTED)
ginfo(s, 0.5, 1.4, 5.5, 2.2, "OMA WebUI (Frontend)", ["React 18 + TypeScript + Vite 8", "Tailwind CSS v4 (LiteLLM 디자인)", "25 Pages | 3 Preset | Mock 데이터", "/ → /project/:id/* 라우팅"], CYAN)
glass(s, 6.2, 1.4, 1.5, 2.2, 25)
txt(s, 6.3, 2.1, 1.3, 0.8, "ALB\npath\nrouting", 12, CYAN, True, al=PP_ALIGN.CENTER)
ginfo(s, 7.9, 1.4, 4.7, 1.0, "OMA_Strands_Graph :8000", ["FastAPI + Strands SDK | 9 Agents | 11 REST + WS"], SUCCESS_G)
ginfo(s, 7.9, 2.55, 4.7, 1.0, "strands-oracle-migration :8001", ["CLI only → FastAPI 래퍼 필요 | 5 Agents + sqlglot"], WARN_G)
ginfo(s, 0.5, 3.85, 4, 1.5, "AWS Services", ["Bedrock (Claude Sonnet)", "AgentCore Runtime", "DMS Schema Conversion"], VIOLET)
ginfo(s, 4.65, 3.85, 4, 1.5, "Infrastructure", ["ECS Fargate (백엔드 2개)", "S3 + CloudFront (프론트)", "ALB path-based routing"], CYAN)
ginfo(s, 8.8, 3.85, 3.8, 1.5, "BFF 미채택", ["백엔드 직접 수정 방식", "개발 속도 ↑, 비용 ↓", "API 클라이언트가 추상화"], MUTED)
note(s, """
    아키텍처입니다. 프론트엔드는 React 18 기반이고, 백엔드는 2개로 나뉩니다.
    OMA_Strands_Graph는 DB/데이터 마이그레이션을 담당하는 FastAPI 서버이고,
    strands-oracle-migration은 앱 SQL 변환을 담당하는데 현재 CLI만 있어서 FastAPI 래퍼가 필요합니다.
    ALB path-based routing으로 /api/db는 8000번, /api/app은 8001번으로 분기합니다.
    BFF는 채택하지 않았습니다. 현재 규모에서는 백엔드 직접 수정이 더 빠르고 비용 효율적입니다.
""")

# ====================== SLIDE 4: Project Management ======================
s = prs.slides.add_slide(blank); setup(s)
txt(s, 0.6, 0.3, 10, 0.5, "프로젝트 관리 체계", 28, WHITE, True, fn="Segoe UI Light")
txt(s, 0.6, 0.85, 10, 0.3, "멀티 프로젝트 + 테이블 스코프 선택 + 독립 환경", 12, MUTED)
gstat(s, 0.5, 1.4, 3.5, 2.5, "/", "프로젝트 목록\n카드 그리드 + 진행률", CYAN)
txt(s, 4.2, 2.2, 0.5, 0.5, "→", 32, VIOLET, True, al=PP_ALIGN.CENTER)
ginfo(s, 4.7, 1.4, 3.5, 2.5, "생성 2단계", ["Step 1: 이름 + 프리셋", "Step 2: 테이블 범위", "  전체 / 스키마 / 개별", "", "3,000 테이블 Oracle DB", "→ 300개씩 10개 프로젝트"], VIOLET)
txt(s, 8.4, 2.2, 0.5, 0.5, "→", 32, VIOLET, True, al=PP_ALIGN.CENTER)
ginfo(s, 8.9, 1.4, 3.7, 2.5, "/project/:id", ["독립 DB 설정", "독립 기능 토글", "독립 마이그레이션 상태", "독립 사이드바 메뉴"], SUCCESS_G)
x = 0.5
for name, desc, accent in [("프로젝트 A", "HR + SALES — 15개", CYAN), ("프로젝트 B", "FIN + INV — 13개", VIOLET), ("프로젝트 C", "CRM — 6개", CORAL_G), ("프로젝트 D", "COMMON — 3개", WARN_G)]:
    ginfo(s, x, 4.3, 3, 1.5, name, [desc], accent, 12); x += 3.1
note(s, """
    프로젝트를 나눈 핵심 이유는, Oracle DB에 테이블이 수천 개일 때 300개씩 잘라서 병렬로 마이그레이션하기 위해서입니다.
    루트 페이지에서 프로젝트 목록을 카드 그리드로 보고, 프로젝트를 생성할 때 2단계를 거칩니다.
    Step 1에서 이름과 기능 프리셋을 선택하고, Step 2에서 마이그레이션할 테이블 범위를 선택합니다.
    전체, 스키마 단위, 개별 테이블 단위로 선택 가능합니다.
    프로젝트에 진입하면 DB 설정, 기능 토글, 마이그레이션 상태가 모두 독립적으로 관리됩니다.
""")

# ====================== SLIDE 5: Feature Toggles ======================
s = prs.slides.add_slide(blank); setup(s)
txt(s, 0.6, 0.3, 10, 0.5, "기능 토글 시스템", 28, WHITE, True, fn="Segoe UI Light")
txt(s, 0.6, 0.85, 10, 0.3, "3단계 프리셋 — 사용자 수준별 UI 최적화", 12, MUTED)
gstat(s, 0.5, 1.4, 4, 2.5, "10", "Basic\n입문자 / POC", CYAN)
gstat(s, 4.65, 1.4, 4, 2.5, "17", "Standard (기본값)\n일반 마이그레이션", VIOLET)
gstat(s, 8.8, 1.4, 3.8, 2.5, "23", "Advanced\n전문가", CORAL_G)
ginfo(s, 0.5, 4.15, 6, 2.3, "동작 방식", ["설정 > 기능 관리에서 프리셋 선택 또는 개별 토글", "비활성 기능: 사이드바 자동 숨김", "URL 직접 접속 시 안내 + 원클릭 활성화", '"기능이 너무 많아 헷갈린다" → 필요한 것만'], CYAN)
ginfo(s, 6.65, 4.15, 6, 2.3, "카테고리", ["DB Migration: 5개 (Core 4 + Opt 1)", "App Migration: 7개 (Core 4 + Opt 3)", "Data Migration: 2개 (Core 2)", "Tools: 5개 (전부 Optional)", "Settings 내부: 3개 (전부 Optional)"], VIOLET)
note(s, """
    기능이 23개로 많아서 사용자가 헷갈릴 수 있다는 피드백이 있었습니다.
    이를 해결하기 위해 3단계 프리셋을 만들었습니다.
    Basic은 10개 필수 기능만, Standard는 17개로 디버깅 도구 포함, Advanced는 23개 전체입니다.
    프로젝트별로 프리셋이 독립 적용되고, 개별 토글도 가능합니다.
    비활성 기능은 사이드바에서 자동으로 숨겨지고, URL로 직접 접근하면 안내 페이지가 뜹니다.
""")

# ====================== SLIDE 6: DB Migration ======================
s = prs.slides.add_slide(blank); setup(s)
txt(s, 0.6, 0.3, 10, 0.5, "DB 마이그레이션 파이프라인", 28, WHITE, True, fn="Segoe UI Light")
txt(s, 0.6, 0.85, 10, 0.3, "DMS + AI 에이전트 협업 | AWS DMS vs OMA 확장", 12, MUTED)
txt(s, 0.5, 1.25, 3, 0.25, "SCHEMA CONVERSION", 9, CYAN, True)
y = 1.55
for num, name, badge, c in [("1","Pre-Assessment","AWS DMS",CYAN),("2","Schema Conversion","AWS DMS",CYAN),("3","Agent Remediation","OMA",VIOLET),("4","Schema Validation","OMA",VIOLET)]:
    glass(s, 0.5, y, 5.5, 0.5, 15); txt(s, 0.75, y+0.08, 0.4, 0.3, num, 14, WHITE, True); txt(s, 1.2, y+0.1, 2.8, 0.3, name, 12, SOFT_WHITE); txt(s, 4.5, y+0.12, 1.3, 0.25, badge, 8, c, True); y += 0.58
txt(s, 0.5, y+0.05, 3, 0.25, "DATA REPLICATION", 9, MUTED, True); y += 0.3
for num, name in [("5","DMS Replication Setup"),("6","Full Load & CDC")]:
    glass(s, 0.5, y, 5.5, 0.5, 10); txt(s, 0.75, y+0.08, 0.4, 0.3, num, 14, MUTED, True); txt(s, 1.2, y+0.1, 2.8, 0.3, name, 12, MUTED); txt(s, 4.5, y+0.12, 1.3, 0.25, "AWS DMS", 8, MUTED, True); y += 0.58
ginfo(s, 6.2, 1.25, 6.4, 3.2, "AI Agent Retry Flow (5/9)", ["Assessment: 변환 완료 / 실패 (2개 상태만)","","실패 → AI 에이전트 리트라이:","  Discovery → Schema Architect → Code Migrator","  → QA Verifier → Evaluator (GO/NO-GO)","","리트라이 초과 → 최종 실패 → 수동 검토","임계점수: 기본 80 (설정 변경 가능)"], VIOLET)
ginfo(s, 6.2, 4.65, 6.4, 1.7, "AWS DMS vs OMA 확장", ["Pre-Assessment, Schema Conversion → DMS 네이티브","Agent Remediation, Validation → OMA 확장","UI에서 배지로 출처 구분"], CYAN)
note(s, """
    DB 마이그레이션은 6단계 파이프라인입니다.
    앞 4단계가 스키마 변환이고, 뒤 2단계가 데이터 복제 설정입니다.
    Step 1-2는 AWS DMS 네이티브, Step 3-4는 OMA가 확장한 기능입니다.
    UI에서는 각 단계 옆에 배지로 출처를 구분합니다.
    Assessment 결과는 변환 완료와 실패, 2개 상태만 있습니다.
    실패 항목은 AI 에이전트 페이지로 넘겨서 최대 3회 리트라이합니다.
    Evaluator 점수가 80점 미만이면 리트라이하고, 횟수를 초과하면 최종 실패로 수동 검토 대상이 됩니다.
""")

# ====================== SLIDE 7: App Migration ======================
s = prs.slides.add_slide(blank); setup(s)
txt(s, 0.6, 0.3, 10, 0.5, "앱 마이그레이션 워크플로우", 28, WHITE, True, fn="Segoe UI Light")
txt(s, 0.6, 0.85, 10, 0.3, "MyBatis SQL 변환 7단계 | 런타임 로그 수집 + AI Agent", 12, MUTED)
colors = [CYAN, WARN_G, CYAN, VIOLET, CORAL_G, CYAN, SUCCESS_G]
y = 1.35
for i, (num, name, desc) in enumerate([("1","Mapper 탐색","XML 구조 분석"),("2","SQL 추출","정적 + 런타임 로그"),("3","SQL 필터링","35+ Oracle 패턴"),("4","쿼리 변환","sqlglot + AI Agent"),("5","수동 검토","실패 SQL 수정"),("6","XML 병합","Mapper 재조립"),("7","테스트 지원","AOP 에러 수집")]):
    glass(s, 0.5, y, 5.5, 0.58, 15); txt(s, 0.75, y+0.08, 0.4, 0.3, num, 14, colors[i], True); txt(s, 1.2, y+0.08, 2.5, 0.25, name, 13, WHITE, True); txt(s, 3.8, y+0.1, 2, 0.25, desc, 10, MUTED); y += 0.66
ginfo(s, 6.2, 1.35, 6.4, 1.8, "런타임 로그 수집 (신규)", ["AOP/Interceptor로 실제 실행 SQL 수집","정적 추출로 잡히지 않는 비즈니스 SQL","로그 소스: AOP, stdout, S3, CloudWatch"], WARN_G)
ginfo(s, 6.2, 3.35, 6.4, 1.5, "변환 예시", ["NVL → COALESCE | DECODE → CASE WHEN","CONNECT BY → WITH RECURSIVE","ROWNUM → LIMIT | (+) → LEFT JOIN"], SUCCESS_G)
ginfo(s, 6.2, 5.05, 6.4, 1.3, "에러 복구", ["Query Rewrite 실패 → Manual Review CTA","수동 수정 후 XML 병합 → 테스트 검증"], CORAL_G)
note(s, """
    앱 마이그레이션은 7단계입니다.
    핵심은 Step 2의 SQL 추출인데, 기존 정적 XML 파싱에 더해 런타임 로그 수집 기능을 추가했습니다.
    몽키테스트나 실제 서비스 로그에서 AOP/Interceptor로 실행된 SQL을 수집하면,
    정적 분석으로는 잡히지 않는 동적 SQL 패턴까지 커버할 수 있습니다.
    Step 4에서 AI 에이전트가 Oracle SQL을 PostgreSQL로 변환하고,
    실패하면 Manual Review 페이지로 연결되는 CTA 버튼이 있습니다.
    대표적 변환 예시로 NVL은 COALESCE로, CONNECT BY는 WITH RECURSIVE로 바뀝니다.
""")

# ====================== SLIDE 8: UX ======================
s = prs.slides.add_slide(blank); setup(s)
txt(s, 0.6, 0.3, 10, 0.5, "UX 개선 사항", 28, WHITE, True, fn="Segoe UI Light")
txt(s, 0.6, 0.85, 10, 0.3, "워크플로우 가시성 | 온보딩 | 디자인 리뉴얼", 12, MUTED)
for title, lines, accent, l, t, w, h in [
    ("워크플로우 위치", ["Step X/10 진행률 바","클릭으로 다른 단계 이동"], CYAN, 0.5,1.4,6,2.2),
    ("온보딩 모달", ["첫 방문 시 3단계 설정 가이드","필수 vs 선택 구분"], VIOLET, 6.65,1.4,6,2.2),
    ("마이그레이션 범위", ["설정에서 테이블 조회/수정","대시보드에 스코프 요약"], SUCCESS_G, 0.5,3.8,4,2.5),
    ("LiteLLM 디자인", ["인디고 브랜드, 220px 사이드바","13px 폰트, minimal shadow"], CYAN, 4.65,3.8,4,2.5),
    ("배지 가독성", ["destructive 배지 대비 개선","라이트모드 foreground 수정"], CORAL_G, 8.8,3.8,3.8,2.5)]:
    ginfo(s, l, t, w, h, title, lines, accent)
note(s, """
    UX 개선은 크게 5가지입니다.
    첫째, 각 기능 페이지 상단에 워크플로우 위치를 Step X/10 형태로 표시합니다.
    둘째, 첫 방문 시 온보딩 모달로 필수 설정 3단계를 안내합니다.
    셋째, 프로젝트 설정에서 마이그레이션 범위를 조회하고 수정할 수 있습니다.
    넷째, LiteLLM 스타일 디자인을 적용해서 compact하고 professional한 느낌으로 바꿨습니다.
    다섯째, 라이트 모드에서 빨간 배지의 글자가 안 보이던 문제를 수정했습니다.
""")

# ====================== SLIDE 9: Gap ======================
s = prs.slides.add_slide(blank); setup(s)
txt(s, 0.6, 0.3, 10, 0.5, "백엔드 갭 분석", 28, WHITE, True, fn="Segoe UI Light")
txt(s, 0.6, 0.85, 10, 0.3, "프론트 83개 API vs 백엔드 11개 → 72개 갭", 12, MUTED)
gstat(s, 0.5, 1.4, 3, 2.2, "72", "REST API 갭", CORAL_G)
gstat(s, 3.65, 1.4, 3, 2.2, "24", "앱 마이그레이션\n전체 신규", WARN_G)
gstat(s, 6.8, 1.4, 3, 2.2, "19", "프로젝트 관리\nMock 유지", VIOLET)
gstat(s, 9.95, 1.4, 2.7, 2.2, "7", "실시간\n스트림", CYAN)
ginfo(s, 0.5, 3.85, 6, 2.7, "노력 추정", ["P0 필수:  26일 (카탈로그, DMS, AI Agent, 앱 래퍼)","P1 중요:  23일 (스키마 검증, 도구, 인프라)","P2 보조:   7일 (프로젝트 서버 저장소)","","총 56일 = ~11주(1명) / ~7주(2명)","","최대 리스크: GAP-10 앱 마이그레이션 래퍼 (15일)"], WARN_G)
ginfo(s, 6.65, 3.85, 6, 2.7, "문서화 완료 (4개)", ["docs/01-backend-analysis.md","  두 백엔드 현재 기능 상세","docs/02-frontend-api-requirements.md","  프론트 필요 API 83개","docs/03-gap-analysis.md","  GAP-00~21 + 판단","docs/04-integration-guide.md","  5단계 통합 가이드"], SUCCESS_G)
note(s, """
    현재 프론트엔드는 83개 API를 필요로 하는데, 백엔드는 11개만 제공합니다. 72개 갭이 있습니다.
    가장 큰 갭은 앱 마이그레이션 24개 endpoint입니다. CLI만 있어서 FastAPI 래퍼를 새로 만들어야 합니다.
    프로젝트 관리 19개는 현재 localStorage로 Mock 처리 중이고, MVP에서는 이대로 유지할 수 있습니다.
    총 노력은 56일, 2명 기준 약 7주입니다. P0 필수만 해도 26일입니다.
    이 내용은 docs 하위 4개 문서에 상세히 정리되어 있습니다.
""")

# ====================== SLIDE 10: Roadmap ======================
s = prs.slides.add_slide(blank); setup(s)
txt(s, 0.6, 0.3, 10, 0.5, "통합 로드맵", 28, WHITE, True, fn="Segoe UI Light")
txt(s, 0.6, 0.85, 10, 0.3, "5단계 | 총 7주 (2인 기준)", 12, MUTED)
y = 1.35
for name, dur, title, desc, accent in [
    ("Phase 1","1주","기반 구축 + 카탈로그","API 클라이언트, 테이블 카탈로그, Dashboard",CYAN),
    ("Phase 2","2주","DB Migration 핵심","DMS 파이프라인, Assessment, AI Agent (WS)",VIOLET),
    ("Phase 3","2주","App Migration ★","FastAPI 래퍼 24 endpoint (최대 리스크)",CORAL_G),
    ("Phase 4","1주","수동 검토 + 테스트","Manual Review, XML Merge, AOP",WARN_G),
    ("Phase 5","1주","도구 + 설정","SQL 실행기, 로그, 보고서, KB",MUTED)]:
    glass(s, 0.5, y, 12.1, 0.85, 15); txt(s, 0.8, y+0.08, 2, 0.3, f"{name} ({dur})", 13, accent, True); txt(s, 3.3, y+0.08, 3.5, 0.3, title, 14, WHITE, True); txt(s, 0.8, y+0.42, 11.5, 0.3, desc, 10, SOFT_WHITE); y += 0.95
txt(s, 0.5, y+0.15, 12, 0.4, "▶ Phase 1 완료 시 첫 E2E 데모  |  ▶ Phase 3 최대 리스크  |  ▶ Phase 4-5 병렬 가능", 11, WARN_G, True, al=PP_ALIGN.CENTER)
note(s, """
    통합 로드맵은 5단계, 총 7주입니다.
    Phase 1에서 API 클라이언트와 테이블 카탈로그 API를 구축하면 첫 End-to-End 데모가 가능합니다.
    Phase 2에서 DMS 파이프라인과 AI 에이전트 실시간 연동을 합니다.
    Phase 3이 최대 리스크입니다. strands-oracle-migration CLI를 FastAPI로 래핑해야 하는데, 24개 endpoint가 필요합니다.
    Phase 4-5는 병렬로 진행 가능하고, 도구와 설정 연동은 상대적으로 단순합니다.
""")

# ====================== SLIDE 11: Tech Stack ======================
s = prs.slides.add_slide(blank); setup(s)
txt(s, 0.6, 0.3, 10, 0.5, "기술 스택 & 산출물", 28, WHITE, True, fn="Segoe UI Light")
ginfo(s, 0.5, 1.1, 4, 3, "Frontend", ["React 18 + TypeScript","Vite 8 (빌드 < 1초)","Tailwind CSS v4","React Router v6","Recharts (차트)","Lucide React (아이콘)"], CYAN)
ginfo(s, 4.65, 1.1, 4, 3, "Backend", ["OMA_Strands_Graph","  FastAPI + Strands SDK","strands-oracle-migration","  CLI + sqlglot","AI: Bedrock (Claude)","Runtime: AgentCore"], VIOLET)
ginfo(s, 8.8, 1.1, 3.8, 3, "Deliverables", ["25개 페이지 프론트엔드","프로젝트 관리 + 기능 토글","마이그레이션 스코프","4개 통합 문서","GitHub Repo"], SUCCESS_G)
ginfo(s, 0.5, 4.3, 12.1, 2.1, "Infrastructure", ["ECS Fargate: 백엔드 2개  |  ALB: path-based routing  |  S3 + CloudFront: 프론트","DMS: Schema Conversion + Data Replication  |  Bedrock + AgentCore: AI","Oracle RDS (소스)  |  PostgreSQL RDS (타겟)"], CYAN)
note(s, """
    기술 스택입니다.
    프론트엔드는 React 18에 Vite로 빌드하면 1초 이내입니다.
    백엔드는 FastAPI 기반과 CLI 기반 2개이고, AI는 Amazon Bedrock의 Claude Sonnet을 사용합니다.
    산출물로는 25개 페이지 프론트엔드, 프로젝트 관리 시스템, 기능 토글, 4개 통합 문서가 있고
    GitHub Private Repo에 모두 관리되고 있습니다.
""")

# ====================== SLIDE 12: Q&A ======================
s = prs.slides.add_slide(blank); setup(s)
glass(s, 0.8, 0.5, 7, 6.2, 12)
txt(s, 1.5, 1.5, 6, 1.5, "Q & A", 64, WHITE, True, fn="Segoe UI Light")
txt(s, 1.5, 3.2, 6, 0.5, "질문 및 논의", 18, MUTED, fn="Segoe UI Light")
ginfo(s, 8.2, 0.5, 4.4, 3, "Immediate Actions", ["1. Phase 1 착수","   API 클라이언트 + 카탈로그","2. OMA_Strands_Graph 수정","   프론트 전용 endpoint","3. FastAPI 래퍼 설계","   strands-oracle-migration"], SUCCESS_G)
ginfo(s, 8.2, 3.65, 4.4, 3.15, "Discussion Points", ["프로젝트 관리:","  localStorage vs 서버?","FastAPI 래퍼:","  담당 팀/리소스?","배포:","  CloudFront vs ECS?","인증:","  Cognito / IAM IdC?"], WARN_G)
note(s, """
    이상으로 OMA WebUI v2 현황 공유를 마치겠습니다.
    즉시 가능한 액션으로는 Phase 1 착수, OMA_Strands_Graph에 프론트 전용 endpoint 추가,
    그리고 strands-oracle-migration FastAPI 래퍼 설계 시작이 있습니다.
    논의 포인트로는 프로젝트 관리 저장소 전환 시점, FastAPI 래퍼 담당 팀,
    배포 환경과 인증 방식에 대해 의견을 구하고 싶습니다.
    질문 있으시면 말씀해주세요. 다음 슬라이드부터는 Appendix로, 상세 질문 시 참고용입니다.
""")

# ========================== APPENDIX ==========================

def appendix_slide(title, subtitle):
    s = prs.slides.add_slide(blank); setup(s)
    txt(s, 0.6, 0.2, 10, 0.4, f"APPENDIX — {title}", 22, WHITE, True, fn="Segoe UI Light")
    txt(s, 0.6, 0.65, 10, 0.25, subtitle, 11, MUTED)
    return s

# --- A: Backend Comparison ---
s = appendix_slide("A. 백엔드 상세 비교", "Slide 3 보충 | docs/01-backend-analysis.md")
rows = [("항목","OMA_Strands_Graph","strands-oracle-migration"),("역할","DB/데이터 마이그레이션","앱(SQL) 마이그레이션"),("프레임워크","FastAPI + Strands SDK","CLI only (HTTP API 없음)"),("에이전트","9개","5개"),("API","11 REST + 1 WS (25 이벤트)","0 (FastAPI 래퍼 필요)"),("DB 접근","Oracle + PG 직접","query_store 파일"),("AI","Bedrock via AgentCore","Bedrock + sqlglot")]
y = 1.1
for i, (k, v1, v2) in enumerate(rows):
    op = 20 if i == 0 else 12
    ac = CYAN if i == 0 else SOFT_WHITE
    glass(s, 0.5, y, 12.1, 0.45, op)
    txt(s, 0.7, y+0.07, 2.5, 0.3, k, 10, ac, i==0)
    txt(s, 3.5, y+0.07, 4, 0.3, v1, 10, ac if i==0 else SUCCESS_G)
    txt(s, 7.8, y+0.07, 4.5, 0.3, v2, 10, ac if i==0 else WARN_G)
    y += 0.5
ginfo(s, 0.5, y+0.2, 12.1, 1.5, '예상 질문: "두 백엔드를 왜 합치지 않나?"', ["역할이 다름. DB 스키마 변환(DDL)과 앱 SQL 변환(DML)은 파이프라인 분리.","ALB path-based routing으로 프론트에서는 하나처럼 보임.","나중에 합칠 필요성이 생기면 BFF 레이어 도입 가능."], VIOLET)
note(s, """
    [Appendix A] 두 백엔드 비교입니다.
    OMA_Strands_Graph는 FastAPI로 11개 API와 WebSocket을 제공하고,
    strands-oracle-migration은 CLI만 있어서 HTTP API가 전혀 없습니다.
    두 백엔드를 합치지 않은 이유는 역할이 다르기 때문입니다.
    DB 스키마 변환과 앱 SQL 변환은 완전히 다른 파이프라인이고,
    ALB에서 path 기반으로 라우팅하면 프론트에서는 하나처럼 보입니다.
""")

# --- B: Gap Full List ---
s = appendix_slide("B. 갭 분석 전체 목록", "Slide 9 보충 | docs/03-gap-analysis.md")
gaps = [("GAP","영역","판단","우선순위","노력"),
    ("00","테이블 카탈로그","신규 추가","P0","2일"),("01-03","프로젝트 CRUD/설정/토글","Mock 유지","P2","4일"),
    ("04","Dashboard 집계","신규 추가","P0","2일"),("05","DMS 파이프라인","기존 수정","P0","4일"),
    ("06","Assessment 결과","신규 추가","P0","2일"),("07","AI 에이전트","WS 활용","P0","3일"),
    ("08-09","스키마 검증/컨텍스트","신규 추가","P1","4일"),("10","앱 마이그레이션 전체","전체 신규","P0","15일"),
    ("11-12","데이터 이관/검증","신규 추가","P1","4일"),("13-17","도구 5종","신규 추가","P1-P2","7일"),
    ("18","실시간 스트리밍","WS 확장","P0","3일"),("19-21","CORS/인증/에러","신규 추가","P1","3일")]
y = 1.0
for i, row in enumerate(gaps):
    op = 20 if i == 0 else 12
    ac = CYAN if i == 0 else SOFT_WHITE
    glass(s, 0.5, y, 12.1, 0.4, op)
    txt(s, 0.7, y+0.05, 1.2, 0.25, row[0], 9, ac, i==0)
    txt(s, 2, y+0.05, 3.5, 0.25, row[1], 9, ac, i==0)
    txt(s, 5.5, y+0.05, 2, 0.25, row[2], 9, ac if i==0 else (WARN_G if "신규" in row[2] else SUCCESS_G))
    txt(s, 7.8, y+0.05, 1, 0.25, row[3], 9, ac if i==0 else (CORAL_G if "P0" in row[3] else MUTED))
    txt(s, 9, y+0.05, 1, 0.25, row[4], 9, ac)
    y += 0.42
ginfo(s, 0.5, y+0.1, 12.1, 1.0, "합계: P0 26일, P1 23일, P2 7일 → 총 56일 (2명 기준 ~7주)", ["최대 리스크: GAP-10 앱 마이그레이션 FastAPI 래퍼 (15일, 24 endpoint)"], WARN_G)
note(s, """
    [Appendix B] 전체 갭 목록입니다. GAP-00부터 21까지 있습니다.
    P0 필수가 26일로 카탈로그, DMS, AI 에이전트, 앱 마이그레이션 래퍼가 포함됩니다.
    가장 큰 건 GAP-10 앱 마이그레이션으로 혼자 15일입니다.
    프로젝트 관리 관련(GAP-01~03)은 MVP에서 Mock 유지로 판단했습니다.
""")

# --- C: AI Agent Detail ---
s = appendix_slide("C. AI 에이전트 파이프라인 상세", "Slide 6 보충 | 14개 에이전트")
ginfo(s, 0.5, 1.0, 6, 3.5, "DB 에이전트 (OMA_Strands_Graph) — 9개",
    ["Discovery       — 소스 DB 분석, 객체 탐색  [UI: O]",
     "Schema Architect — DDL 변환 설계  [UI: O]",
     "Code Migrator    — PL/SQL → PL/pgSQL  [UI: O]",
     "QA Verifier      — 변환 결과 검증  [UI: O]",
     "Evaluator        — GO/NO-GO 판정  [UI: O]",
     "Remediation      — 실패 객체 재시도  [내부]",
     "Report           — 변환 보고서 생성  [내부]",
     "Data Migrator    — 데이터 복제  [별도 페이지]",
     "Data Verifier    — 일치성 검증  [별도 페이지]"], CYAN)
ginfo(s, 6.65, 1.0, 6, 2.5, "앱 에이전트 (strands-oracle-migration) — 5개",
    ["TranslatorAgent   — sqlglot + AI 폴백",
     "ValidatorAgent    — EXPLAIN 검증",
     "ComparatorAgent   — Oracle↔PG 결과 비교",
     "FixerAgent        — 실패 SQL 자동 수정",
     "OrchestratorAgent — 전체 파이프라인 조율"], VIOLET)
ginfo(s, 6.65, 3.7, 6, 1.8, '예상 질문: "리트라이 횟수 결정?"', ["에이전트 설정 페이지에서 조정 (기본 3회)","Evaluator 임계점수 기본 80 미달 시 리트라이","Context Budget (토큰 한도)도 설정 가능"], WARN_G)
note(s, """
    [Appendix C] AI 에이전트 상세입니다.
    DB 마이그레이션에 9개, 앱 마이그레이션에 5개로 총 14개입니다.
    UI에는 DB 쪽 5개만 표시하고 나머지는 내부 또는 별도 페이지에서 처리합니다.
    리트라이 횟수는 에이전트 설정 페이지에서 조정 가능하고 기본 3회입니다.
""")

# --- D: CLI→API Wrapping ---
s = appendix_slide("D. CLI→API 래핑 상세", "Slide 7, 10 보충 | GAP-10")
mappings = [("CLI 기능","래핑 API","처리"),
    ("extract_sql_from_xml()","POST /api/app/extraction/execute","동기 (<30초)"),
    ("classify_sql()","POST /api/app/filtering/execute","동기"),
    ("TranslatorAgent.run()","POST /api/app/rewrite/execute","SSE 스트리밍"),
    ("_merge_mapper_xmls()","POST /api/app/merge/execute","동기"),
    ("compare_query_store()","POST /api/app/test/execute","동기")]
y = 1.0
for i, (cli, api, proc) in enumerate(mappings):
    op = 20 if i == 0 else 12
    ac = CYAN if i == 0 else SOFT_WHITE
    glass(s, 0.5, y, 12.1, 0.45, op)
    txt(s, 0.7, y+0.07, 3.5, 0.3, cli, 9, ac, i==0)
    txt(s, 4.3, y+0.07, 5, 0.3, api, 9, ac if i==0 else VIOLET)
    txt(s, 9.5, y+0.07, 2.5, 0.3, proc, 9, ac if i==0 else (WARN_G if "SSE" in proc else SUCCESS_G))
    y += 0.5
ginfo(s, 0.5, y+0.2, 12.1, 1.8, "SSE 스트리밍 패턴 (장시간 작업)", [
    "POST /api/app/rewrite/execute",
    "→ Content-Type: text/event-stream",
    'data: {"progress": 45, "current": "SQL-042", "status": "converting"}',
    'data: {"progress": 100, "status": "completed", "result": {...}}',
    "","예상 질문: CLI를 subprocess로 안 부르나?",
    "→ 상태 관리/에러 처리 어려움. FastAPI로 래핑하면 비동기/재시도 표준화 가능."], VIOLET)
note(s, """
    [Appendix D] CLI를 API로 래핑하는 상세입니다.
    5개 CLI 함수를 각각 FastAPI endpoint로 감쌉니다.
    대부분은 동기 처리인데, TranslatorAgent는 장시간 걸리므로 SSE 스트리밍으로 진행률을 전송합니다.
    subprocess로 직접 부르지 않는 이유는 상태 관리와 에러 처리가 어렵기 때문입니다.
""")

# --- E: Architecture Decision ---
s = appendix_slide("E. 아키텍처 의사결정: BFF vs 직접 수정", "Slide 3 보충")
rows = [("평가 기준","BFF 방식","백엔드 직접 수정 (채택)"),
    ("개발 속도","느림 (새 서비스)","빠름 (기존 코드 추가)"),
    ("유지보수","3개 서비스","2개 서비스"),
    ("데이터 흐름","프론트→BFF→백엔드","프론트→백엔드 직접"),
    ("유연성","BFF에서 응답 가공","API 설계에 의존"),
    ("인프라 비용","ECS 태스크 추가","추가 없음")]
y = 1.0
for i, (k, v1, v2) in enumerate(rows):
    op = 20 if i == 0 else 12
    glass(s, 0.5, y, 12.1, 0.45, op)
    ac = CYAN if i == 0 else SOFT_WHITE
    txt(s, 0.7, y+0.07, 2.5, 0.3, k, 10, ac, i==0)
    txt(s, 3.5, y+0.07, 4, 0.3, v1, 10, ac if i==0 else CORAL_G)
    txt(s, 7.8, y+0.07, 4.5, 0.3, v2, 10, ac if i==0 else SUCCESS_G)
    y += 0.5
ginfo(s, 0.5, y+0.2, 12.1, 1.5, '예상 질문: "나중에 BFF가 필요해지면?"', ["프론트엔드 API 클라이언트(src/lib/api/)가 추상화 레이어 역할.","BFF 도입 시 Base URL만 변경하면 됨.","현재 구조가 BFF 전환을 막지 않음."], VIOLET)
note(s, """
    [Appendix E] BFF vs 백엔드 직접 수정 의사결정입니다.
    BFF를 채택하지 않은 이유는 개발 속도, 유지보수, 인프라 비용 모두에서 직접 수정이 유리하기 때문입니다.
    나중에 BFF가 필요해지면 API 클라이언트의 Base URL만 바꾸면 되므로 전환 비용이 낮습니다.
""")

# --- F: Conversion Patterns ---
s = appendix_slide("F. Oracle→PostgreSQL 변환 패턴 예시", "Slide 6-7 보충")
patterns = [("Oracle","PostgreSQL","복잡도"),
    ("NVL(a, b)","COALESCE(a, b)","Low"),
    ("SYSDATE","CURRENT_TIMESTAMP","Low"),
    ("ROWNUM <= n","LIMIT n","Medium"),
    ("DECODE(a,b,c,d)","CASE WHEN a=b THEN c ELSE d","Medium"),
    ("CONNECT BY PRIOR","WITH RECURSIVE CTE","High"),
    ("(+) 아우터 조인","LEFT/RIGHT JOIN","Medium"),
    ("DBMS_LOB","PG Large Object API","High"),
    ("DBMS_SQL 동적","EXECUTE format()","High"),
    ("PL/SQL 패키지","스키마 + 함수 조합","High")]
y = 1.0
for i, (ora, pg, cplx) in enumerate(patterns):
    op = 20 if i == 0 else 12
    ac = CYAN if i == 0 else SOFT_WHITE
    glass(s, 0.5, y, 12.1, 0.43, op)
    txt(s, 0.7, y+0.06, 3.5, 0.28, ora, 9, ac, i==0)
    txt(s, 4.5, y+0.06, 5, 0.28, pg, 9, ac if i==0 else SUCCESS_G)
    cc = MUTED
    if cplx == "High": cc = CORAL_G
    elif cplx == "Medium": cc = WARN_G
    elif cplx == "Low": cc = SUCCESS_G
    txt(s, 10, y+0.06, 2, 0.28, cplx, 9, ac if i==0 else cc)
    y += 0.45
ginfo(s, 0.5, y+0.15, 12.1, 1.2, "변환 정확도", ["35+ Oracle 패턴 자동 감지 → sqlglot 결정론적 변환 우선, 실패 시 AI Agent 폴백","Mock 기준: 91.6% 자동 + AI 30% 추가 → 최종 ~98% (수동 2%)"], WARN_G)
note(s, """
    [Appendix F] 대표적인 Oracle→PostgreSQL 변환 패턴입니다.
    NVL은 COALESCE로, CONNECT BY는 WITH RECURSIVE로 바뀝니다.
    35개 이상 패턴을 자동 감지하고, sqlglot으로 먼저 시도한 뒤 실패하면 AI Agent가 처리합니다.
    Mock 데이터 기준 최종 변환율은 약 98%이고, 수동 검토는 2% 정도입니다.
""")

# --- G: Infrastructure ---
s = appendix_slide("G. 인프라 구성도", "Slide 11 보충 | docs/04-integration-guide.md")
ginfo(s, 0.5, 1.0, 12.1, 2.5, "배포 구조", [
    "/              → S3 (React SPA 정적 호스팅) via CloudFront",
    "/api/db-*      → ECS Fargate :8000 (OMA_Strands_Graph)",
    "/api/app-*     → ECS Fargate :8001 (strands-oracle-migration)",
    "/ws            → ECS Fargate :8000 (WebSocket)",
    "",
    "Oracle RDS (소스)  ←  DMS  →  PostgreSQL RDS (타겟)",
    "Bedrock + AgentCore  ←  AI 에이전트 호출",
    "S3  ←  마이그레이션 아티팩트 저장"], CYAN)
ginfo(s, 0.5, 3.7, 6, 2.6, '예상 질문: "ECS 대신 Lambda?"', [
    "AI 에이전트는 수 분~수십 분 실행",
    "Lambda 15분 제한에 걸림",
    "ECS Fargate가 적합",
    "",
    '예상 질문: "비용은?"',
    "ECS Fargate Spot 활용 가능",
    "AI 비용이 인프라 비용보다 큼 (Bedrock 토큰)"], VIOLET)
ginfo(s, 6.65, 3.7, 6, 2.6, "환경 변수 (프론트)", [
    "VITE_API_BASE_URL=https://alb.example.com/api",
    "VITE_WS_URL=wss://alb.example.com/ws",
    "VITE_USE_MOCK=false",
    "",
    "Mock→Real 전환:",
    "VITE_USE_MOCK=true → src/data/*.ts",
    "VITE_USE_MOCK=false → Real API 호출"], SUCCESS_G)
note(s, """
    [Appendix G] 인프라 구성도입니다.
    프론트엔드는 S3에 정적 호스팅하고 CloudFront로 배포합니다.
    API 요청은 ALB에서 path 기반으로 두 ECS 태스크로 분기합니다.
    Lambda 대신 ECS를 쓰는 이유는 AI 에이전트가 15분 이상 걸릴 수 있기 때문입니다.
    Mock에서 Real API로 전환은 환경 변수 하나로 제어합니다.
""")

# ============================================================
output_path = os.path.join(os.path.dirname(__file__), "OMA_WebUI_v2_Glassmorphism.pptx")
prs.save(output_path)
print(f"Saved: {output_path}")
print(f"Slides: {len(prs.slides)} (본편 12 + Appendix 7)")
