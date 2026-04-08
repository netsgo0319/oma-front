#!/usr/bin/env python3
"""
OMA WebUI v2 발표자료 — Glassmorphism 테마
Premium, tech, frosted-glass cards on deep gradient
"""
from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE
from pptx.oxml.ns import qn
from lxml import etree
import os

# === Glassmorphism Colors ===
BG_DEEP = RGBColor(0x0F, 0x0F, 0x2D)
BG_PURPLE = RGBColor(0x1A, 0x1A, 0x4E)
GLASS_BG = RGBColor(0xFF, 0xFF, 0xFF)      # 15-20% opacity
GLASS_BORDER = RGBColor(0xFF, 0xFF, 0xFF)   # 25% opacity
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
SOFT_WHITE = RGBColor(0xE0, 0xE0, 0xF0)
CYAN = RGBColor(0x67, 0xE8, 0xF9)
VIOLET = RGBColor(0xA7, 0x8B, 0xFA)
MUTED = RGBColor(0x99, 0x99, 0xBB)
SUCCESS_G = RGBColor(0x6E, 0xE7, 0xB7)
WARN_G = RGBColor(0xFD, 0xE0, 0x68)
CORAL_G = RGBColor(0xFF, 0x8B, 0x8B)


def set_dark_bg(slide):
    bg = slide.background
    fill = bg.fill
    fill.solid()
    fill.fore_color.rgb = BG_DEEP


def add_glow_blob(slide, left, top, width, height, color):
    """Add a soft glow ellipse behind cards"""
    shape = slide.shapes.add_shape(MSO_SHAPE.OVAL, Inches(left), Inches(top), Inches(width), Inches(height))
    shape.fill.solid()
    shape.fill.fore_color.rgb = color
    shape.line.fill.background()
    # Set transparency
    spPr = shape._element.spPr
    sf = spPr.find(qn('a:solidFill'))
    if sf is None:
        fill_elem = spPr.find(qn('a:ln'))
        sf = spPr.find('./' + qn('a:solidFill'))
    # Access fill element directly
    fill_elem = shape._element.spPr
    for sf in fill_elem.iter(qn('a:srgbClr')):
        alpha = etree.SubElement(sf, qn('a:alpha'))
        alpha.set('val', '15000')  # 15% opacity
        break


def add_glass_card(slide, left, top, width, height, opacity_pct=18):
    """Frosted glass card"""
    shape = slide.shapes.add_shape(
        MSO_SHAPE.ROUNDED_RECTANGLE,
        Inches(left), Inches(top), Inches(width), Inches(height)
    )
    shape.fill.solid()
    shape.fill.fore_color.rgb = GLASS_BG
    shape.line.color.rgb = GLASS_BORDER
    shape.line.width = Pt(0.75)

    # Set fill transparency
    spPr = shape._element.spPr
    for sf in spPr.iter(qn('a:srgbClr')):
        alpha = etree.SubElement(sf, qn('a:alpha'))
        alpha.set('val', str(opacity_pct * 1000))
        break

    # Set line transparency
    ln = spPr.find(qn('a:ln'))
    if ln is not None:
        for sf in ln.iter(qn('a:srgbClr')):
            alpha = etree.SubElement(sf, qn('a:alpha'))
            alpha.set('val', '25000')
            break

    shape.adjustments[0] = 0.06
    return shape


def add_text(slide, left, top, width, height, text, font_size=14, color=WHITE,
             bold=False, align=PP_ALIGN.LEFT, font_name="Segoe UI"):
    txBox = slide.shapes.add_textbox(Inches(left), Inches(top), Inches(width), Inches(height))
    tf = txBox.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = text
    p.font.size = Pt(font_size)
    p.font.color.rgb = color
    p.font.bold = bold
    p.font.name = font_name
    p.alignment = align
    return tf


def add_glass_info(slide, left, top, width, height, title, lines, accent=CYAN, opacity=18):
    """Glass card with title and body lines"""
    add_glass_card(slide, left, top, width, height, opacity)
    add_text(slide, left + 0.25, top + 0.2, width - 0.5, 0.35,
             title, font_size=16, color=accent, bold=True, font_name="Segoe UI Light")
    y = top + 0.6
    for line in lines:
        add_text(slide, left + 0.25, y, width - 0.5, 0.22,
                 line, font_size=10, color=SOFT_WHITE)
        y += 0.24


def add_glass_stat(slide, left, top, width, height, number, label, accent=CYAN, opacity=18):
    """Glass card with large stat"""
    add_glass_card(slide, left, top, width, height, opacity)
    add_text(slide, left + 0.25, top + height * 0.12, width - 0.5, height * 0.5,
             str(number), font_size=52, color=WHITE, bold=True, font_name="Segoe UI Light")
    add_text(slide, left + 0.25, top + height * 0.62, width - 0.5, height * 0.3,
             label, font_size=11, color=accent)


def setup_slide(slide):
    """Common slide setup: dark bg + glow blobs"""
    set_dark_bg(slide)
    add_glow_blob(slide, -2, -1, 6, 6, RGBColor(0x6B, 0x21, 0xA8))
    add_glow_blob(slide, 8, 3, 7, 5, RGBColor(0x1E, 0x3A, 0x5F))
    add_glow_blob(slide, 4, -2, 5, 4, RGBColor(0x3B, 0x09, 0x6B))


# ============================================================
prs = Presentation()
prs.slide_width = Emu(12192000)
prs.slide_height = Emu(6858000)
blank = prs.slide_layouts[6]

# ----------------------------------------------------------
# SLIDE 1: Title
# ----------------------------------------------------------
s = prs.slides.add_slide(blank)
setup_slide(s)

add_glass_card(s, 0.8, 1.2, 7.5, 4.5, 12)
add_text(s, 1.3, 1.8, 6.5, 1, "Oracle Migration", font_size=44, color=WHITE, bold=True, font_name="Segoe UI Light")
add_text(s, 1.3, 2.8, 6.5, 0.8, "Accelerator", font_size=44, color=CYAN, bold=True, font_name="Segoe UI Light")
add_text(s, 1.3, 3.8, 6.5, 0.5, "WebUI v2 — 현황 및 로드맵", font_size=18, color=SOFT_WHITE, font_name="Segoe UI Light")
add_text(s, 1.3, 4.5, 6.5, 0.4, "Oracle→PostgreSQL 마이그레이션을 가속하는 통합 UI", font_size=11, color=MUTED)

add_glass_stat(s, 9, 1.2, 3.5, 1.3, "25", "Pages", CYAN)
add_glass_stat(s, 9, 2.65, 3.5, 1.3, "23", "Features", VIOLET)
add_glass_stat(s, 9, 4.1, 3.5, 1.3, "4", "Docs", SUCCESS_G)

# ----------------------------------------------------------
# SLIDE 2: Problem
# ----------------------------------------------------------
s = prs.slides.add_slide(blank)
setup_slide(s)
add_text(s, 0.6, 0.3, 10, 0.5, "왜 OMA WebUI가 필요한가?", font_size=28, color=WHITE, bold=True, font_name="Segoe UI Light")
add_text(s, 0.6, 0.85, 10, 0.3, "Oracle→PostgreSQL 마이그레이션 자동화 과제", font_size=12, color=MUTED)

add_glass_stat(s, 0.5, 1.4, 4, 2.2, "65%", "DMS 자동 변환율\n나머지 35%는 AI + 수동", CYAN)
add_glass_info(s, 4.65, 1.4, 4, 2.2, "앱 마이그레이션 과제",
               ["MyBatis XML 내 Oracle SQL", "수백~수천 건 변환 필요", "전용 도구 부재", "런타임 SQL 수집 필요"], CORAL_G)
add_glass_info(s, 8.8, 1.4, 3.8, 2.2, "데이터 복제",
               ["DMS Full Load + CDC", "테이블별 진행률 추적", "원본↔대상 검증"], VIOLET)

add_glass_card(s, 0.5, 3.85, 12.1, 2.7, 10)
add_text(s, 0.8, 4.0, 10, 0.35, "해결: 3단계 통합 파이프라인", font_size=18, color=WHITE, bold=True, font_name="Segoe UI Light")

add_glass_info(s, 0.7, 4.5, 3.6, 1.8, "① DB 스키마 변환",
               ["DMS SC + AI Agent", "Assessment → 리트라이", "스키마 검증"], CYAN, 12)
add_glass_info(s, 4.5, 4.5, 3.6, 1.8, "② 앱 SQL 변환",
               ["XML 파싱 + 런타임 수집", "sqlglot + AI 폴백", "XML 병합 → 테스트"], VIOLET, 12)
add_glass_info(s, 8.3, 4.5, 4.1, 1.8, "③ 데이터 복제",
               ["Full Load + CDC", "테이블별 모니터링", "데이터 일치성 검증"], SUCCESS_G, 12)

# ----------------------------------------------------------
# SLIDE 3: Architecture
# ----------------------------------------------------------
s = prs.slides.add_slide(blank)
setup_slide(s)
add_text(s, 0.6, 0.3, 10, 0.5, "시스템 아키텍처", font_size=28, color=WHITE, bold=True, font_name="Segoe UI Light")
add_text(s, 0.6, 0.85, 10, 0.3, "Frontend ←→ ALB ←→ 2 Backends ←→ AWS Services", font_size=12, color=MUTED)

add_glass_info(s, 0.5, 1.4, 5.5, 2.2, "OMA WebUI (Frontend)",
               ["React 18 + TypeScript + Vite 8", "Tailwind CSS v4 (LiteLLM 디자인)",
                "25 Pages | 3 Preset | Mock 데이터", "/ → /project/:id/* 라우팅"], CYAN)

add_glass_card(s, 6.2, 1.4, 1.5, 2.2, 25)
add_text(s, 6.3, 2.1, 1.3, 0.8, "ALB\npath\nrouting", font_size=12, color=CYAN, bold=True, align=PP_ALIGN.CENTER)

add_glass_info(s, 7.9, 1.4, 4.7, 1.0, "OMA_Strands_Graph :8000",
               ["FastAPI + Strands SDK | 9 Agents | 11 REST + WS"], SUCCESS_G)
add_glass_info(s, 7.9, 2.55, 4.7, 1.0, "strands-oracle-migration :8001",
               ["CLI only → FastAPI 래퍼 필요 | 5 Agents + sqlglot"], WARN_G)

add_glass_info(s, 0.5, 3.85, 4, 1.5, "AWS Services",
               ["Bedrock (Claude Sonnet)", "AgentCore Runtime", "DMS Schema Conversion"], VIOLET)
add_glass_info(s, 4.65, 3.85, 4, 1.5, "Infrastructure",
               ["ECS Fargate (백엔드 2개)", "S3 + CloudFront (프론트)", "ALB path-based routing"], CYAN)
add_glass_info(s, 8.8, 3.85, 3.8, 1.5, "BFF 미채택",
               ["백엔드 직접 수정 방식", "개발 속도 ↑, 비용 ↓", "API 클라이언트가 추상화"], MUTED)

# ----------------------------------------------------------
# SLIDE 4: Project Management
# ----------------------------------------------------------
s = prs.slides.add_slide(blank)
setup_slide(s)
add_text(s, 0.6, 0.3, 10, 0.5, "프로젝트 관리 체계", font_size=28, color=WHITE, bold=True, font_name="Segoe UI Light")
add_text(s, 0.6, 0.85, 10, 0.3, "멀티 프로젝트 + 테이블 스코프 선택 + 독립 환경", font_size=12, color=MUTED)

add_glass_stat(s, 0.5, 1.4, 3.5, 2.5, "/", "프로젝트 목록\n카드 그리드 + 진행률", CYAN)
add_text(s, 4.2, 2.2, 0.5, 0.5, "→", font_size=32, color=VIOLET, bold=True, align=PP_ALIGN.CENTER)
add_glass_info(s, 4.7, 1.4, 3.5, 2.5, "생성 2단계",
               ["Step 1: 이름 + 프리셋", "Step 2: 테이블 범위", "  전체 / 스키마 / 개별",
                "", "3,000 테이블 Oracle DB", "→ 300개씩 10개 프로젝트"], VIOLET)
add_text(s, 8.4, 2.2, 0.5, 0.5, "→", font_size=32, color=VIOLET, bold=True, align=PP_ALIGN.CENTER)
add_glass_info(s, 8.9, 1.4, 3.7, 2.5, "/project/:id",
               ["독립 DB 설정", "독립 기능 토글", "독립 마이그레이션 상태", "독립 사이드바 메뉴"], SUCCESS_G)

# Scope examples
scopes = [
    ("프로젝트 A", "HR + SALES — 15개", CYAN),
    ("프로젝트 B", "FIN + INV — 13개", VIOLET),
    ("프로젝트 C", "CRM — 6개", CORAL_G),
    ("프로젝트 D", "COMMON — 3개", WARN_G),
]
x = 0.5
for name, desc, accent in scopes:
    add_glass_info(s, x, 4.3, 3, 1.5, name, [desc], accent, 12)
    x += 3.1

# ----------------------------------------------------------
# SLIDE 5: Feature Toggles
# ----------------------------------------------------------
s = prs.slides.add_slide(blank)
setup_slide(s)
add_text(s, 0.6, 0.3, 10, 0.5, "기능 토글 시스템", font_size=28, color=WHITE, bold=True, font_name="Segoe UI Light")
add_text(s, 0.6, 0.85, 10, 0.3, "3단계 프리셋 — 사용자 수준별 UI 최적화", font_size=12, color=MUTED)

add_glass_stat(s, 0.5, 1.4, 4, 2.5, "10", "Basic\n입문자 / POC", CYAN)
add_glass_stat(s, 4.65, 1.4, 4, 2.5, "17", "Standard (기본값)\n일반 마이그레이션", VIOLET)
add_glass_stat(s, 8.8, 1.4, 3.8, 2.5, "23", "Advanced\n전문가", CORAL_G)

add_glass_info(s, 0.5, 4.15, 6, 2.3, "동작 방식",
               ["설정 > 기능 관리에서 프리셋 선택 또는 개별 토글",
                "비활성 기능: 사이드바 자동 숨김",
                "URL 직접 접속 시 안내 + 원클릭 활성화",
                '"기능이 너무 많아 헷갈린다" → 필요한 것만'], CYAN)
add_glass_info(s, 6.65, 4.15, 6, 2.3, "카테고리",
               ["DB Migration: 5개 (Core 4 + Opt 1)",
                "App Migration: 7개 (Core 4 + Opt 3)",
                "Data Migration: 2개 (Core 2)",
                "Tools: 5개 (전부 Optional)",
                "Settings 내부: 3개 (전부 Optional)"], VIOLET)

# ----------------------------------------------------------
# SLIDE 6: DB Migration
# ----------------------------------------------------------
s = prs.slides.add_slide(blank)
setup_slide(s)
add_text(s, 0.6, 0.3, 10, 0.5, "DB 마이그레이션 파이프라인", font_size=28, color=WHITE, bold=True, font_name="Segoe UI Light")
add_text(s, 0.6, 0.85, 10, 0.3, "DMS + AI 에이전트 협업 | AWS DMS vs OMA 확장", font_size=12, color=MUTED)

add_text(s, 0.5, 1.25, 3, 0.25, "SCHEMA CONVERSION", font_size=9, color=CYAN, bold=True)
steps = [
    ("1", "Pre-Assessment", "AWS DMS", CYAN),
    ("2", "Schema Conversion", "AWS DMS", CYAN),
    ("3", "Agent Remediation", "OMA", VIOLET),
    ("4", "Schema Validation", "OMA", VIOLET),
]
y = 1.55
for num, name, badge, color in steps:
    add_glass_card(s, 0.5, y, 5.5, 0.5, 15)
    add_text(s, 0.75, y + 0.08, 0.4, 0.3, num, font_size=14, color=WHITE, bold=True)
    add_text(s, 1.2, y + 0.1, 2.8, 0.3, name, font_size=12, color=SOFT_WHITE)
    add_text(s, 4.5, y + 0.12, 1.3, 0.25, badge, font_size=8, color=color, bold=True)
    y += 0.58

add_text(s, 0.5, y + 0.05, 3, 0.25, "DATA REPLICATION", font_size=9, color=MUTED, bold=True)
y += 0.3
for num, name, badge in [("5", "DMS Replication Setup", "AWS DMS"), ("6", "Full Load & CDC", "AWS DMS")]:
    add_glass_card(s, 0.5, y, 5.5, 0.5, 10)
    add_text(s, 0.75, y + 0.08, 0.4, 0.3, num, font_size=14, color=MUTED, bold=True)
    add_text(s, 1.2, y + 0.1, 2.8, 0.3, name, font_size=12, color=MUTED)
    add_text(s, 4.5, y + 0.12, 1.3, 0.25, badge, font_size=8, color=MUTED, bold=True)
    y += 0.58

add_glass_info(s, 6.2, 1.25, 6.4, 3.2, "AI Agent Retry Flow (5/9)",
               ["Assessment 결과: 변환 완료 / 실패 (2개 상태만)", "",
                "실패 항목 → AI 에이전트 리트라이:",
                "  Discovery → Schema Architect → Code Migrator",
                "  → QA Verifier → Evaluator (GO/NO-GO)", "",
                "리트라이 초과 → 최종 실패 → 수동 검토",
                "Evaluator 임계점수: 기본 80 (설정 변경 가능)"], VIOLET)

add_glass_info(s, 6.2, 4.65, 6.4, 1.7, "AWS DMS vs OMA 확장",
               ["Pre-Assessment, Schema Conversion → DMS 네이티브",
                "Agent Remediation, Validation → OMA 확장",
                "UI에서 배지로 출처 구분"], CYAN)

# ----------------------------------------------------------
# SLIDE 7: App Migration
# ----------------------------------------------------------
s = prs.slides.add_slide(blank)
setup_slide(s)
add_text(s, 0.6, 0.3, 10, 0.5, "앱 마이그레이션 워크플로우", font_size=28, color=WHITE, bold=True, font_name="Segoe UI Light")
add_text(s, 0.6, 0.85, 10, 0.3, "MyBatis SQL 변환 7단계 | 런타임 로그 수집 + AI Agent", font_size=12, color=MUTED)

app_steps = [
    ("1", "Mapper 탐색", "XML 구조 분석"),
    ("2", "SQL 추출", "정적 + 런타임 로그"),
    ("3", "SQL 필터링", "35+ Oracle 패턴"),
    ("4", "쿼리 변환", "sqlglot + AI Agent"),
    ("5", "수동 검토", "실패 SQL 수정"),
    ("6", "XML 병합", "Mapper 재조립"),
    ("7", "테스트 지원", "AOP 에러 수집"),
]

colors = [CYAN, WARN_G, CYAN, VIOLET, CORAL_G, CYAN, SUCCESS_G]
y = 1.35
for i, (num, name, desc) in enumerate(app_steps):
    add_glass_card(s, 0.5, y, 5.5, 0.58, 15)
    add_text(s, 0.75, y + 0.08, 0.4, 0.3, num, font_size=14, color=colors[i], bold=True)
    add_text(s, 1.2, y + 0.08, 2.5, 0.25, name, font_size=13, color=WHITE, bold=True)
    add_text(s, 3.8, y + 0.1, 2, 0.25, desc, font_size=10, color=MUTED)
    y += 0.66

add_glass_info(s, 6.2, 1.35, 6.4, 1.8, "런타임 로그 수집 (신규)",
               ["AOP/Interceptor로 실제 실행 SQL 수집",
                "정적 추출로 잡히지 않는 비즈니스 SQL",
                "로그 소스: AOP, stdout, S3, CloudWatch"], WARN_G)
add_glass_info(s, 6.2, 3.35, 6.4, 1.5, "변환 예시",
               ["NVL → COALESCE | DECODE → CASE WHEN",
                "CONNECT BY → WITH RECURSIVE",
                "ROWNUM → LIMIT | (+) → LEFT JOIN"], SUCCESS_G)
add_glass_info(s, 6.2, 5.05, 6.4, 1.3, "에러 복구",
               ["Query Rewrite 실패 → Manual Review CTA",
                "수동 수정 후 XML 병합 → 테스트 검증"], CORAL_G)

# ----------------------------------------------------------
# SLIDE 8: UX
# ----------------------------------------------------------
s = prs.slides.add_slide(blank)
setup_slide(s)
add_text(s, 0.6, 0.3, 10, 0.5, "UX 개선 사항", font_size=28, color=WHITE, bold=True, font_name="Segoe UI Light")
add_text(s, 0.6, 0.85, 10, 0.3, "워크플로우 가시성 | 온보딩 | 디자인 리뉴얼", font_size=12, color=MUTED)

ux = [
    ("워크플로우 위치", ["Step X/10 진행률 바", "클릭으로 다른 단계 이동"], CYAN, 0.5, 1.4, 6, 2.2),
    ("온보딩 모달", ["첫 방문 시 3단계 설정 가이드", "필수 vs 선택 구분"], VIOLET, 6.65, 1.4, 6, 2.2),
    ("마이그레이션 범위", ["설정에서 테이블 조회/수정", "대시보드에 스코프 요약"], SUCCESS_G, 0.5, 3.8, 4, 2.5),
    ("LiteLLM 디자인", ["인디고 브랜드, 220px 사이드바", "13px 폰트, minimal shadow"], CYAN, 4.65, 3.8, 4, 2.5),
    ("배지 가독성", ["destructive 배지 대비 개선", "라이트모드 foreground 수정"], CORAL_G, 8.8, 3.8, 3.8, 2.5),
]
for title, lines, accent, l, t, w, h in ux:
    add_glass_info(s, l, t, w, h, title, lines, accent)

# ----------------------------------------------------------
# SLIDE 9: Gap
# ----------------------------------------------------------
s = prs.slides.add_slide(blank)
setup_slide(s)
add_text(s, 0.6, 0.3, 10, 0.5, "백엔드 갭 분석", font_size=28, color=WHITE, bold=True, font_name="Segoe UI Light")
add_text(s, 0.6, 0.85, 10, 0.3, "프론트 83개 API vs 백엔드 11개 → 72개 갭", font_size=12, color=MUTED)

add_glass_stat(s, 0.5, 1.4, 3, 2.2, "72", "REST API 갭", CORAL_G)
add_glass_stat(s, 3.65, 1.4, 3, 2.2, "24", "앱 마이그레이션\n전체 신규", WARN_G)
add_glass_stat(s, 6.8, 1.4, 3, 2.2, "19", "프로젝트 관리\nMock 유지", VIOLET)
add_glass_stat(s, 9.95, 1.4, 2.7, 2.2, "7", "실시간\n스트림", CYAN)

add_glass_info(s, 0.5, 3.85, 6, 2.7, "노력 추정",
               ["P0 필수:  26일 (카탈로그, DMS, AI Agent, 앱 래퍼)",
                "P1 중요:  23일 (스키마 검증, 도구, 인프라)",
                "P2 보조:   7일 (프로젝트 서버 저장소)", "",
                "총 56일 = ~11주(1명) / ~7주(2명)", "",
                "최대 리스크: GAP-10 앱 마이그레이션 래퍼 (15일)"], WARN_G)
add_glass_info(s, 6.65, 3.85, 6, 2.7, "문서화 완료 (4개)",
               ["docs/01-backend-analysis.md",
                "  두 백엔드 현재 기능 상세",
                "docs/02-frontend-api-requirements.md",
                "  프론트 필요 API 83개",
                "docs/03-gap-analysis.md",
                "  GAP-00~21 + 판단",
                "docs/04-integration-guide.md",
                "  5단계 통합 가이드"], SUCCESS_G)

# ----------------------------------------------------------
# SLIDE 10: Roadmap
# ----------------------------------------------------------
s = prs.slides.add_slide(blank)
setup_slide(s)
add_text(s, 0.6, 0.3, 10, 0.5, "통합 로드맵", font_size=28, color=WHITE, bold=True, font_name="Segoe UI Light")
add_text(s, 0.6, 0.85, 10, 0.3, "5단계 | 총 7주 (2인 기준)", font_size=12, color=MUTED)

phases = [
    ("Phase 1 (1주)", "기반 구축 + 카탈로그", "API 클라이언트, 테이블 카탈로그, Dashboard", CYAN),
    ("Phase 2 (2주)", "DB Migration 핵심", "DMS 파이프라인, Assessment, AI Agent (WS)", VIOLET),
    ("Phase 3 (2주)", "App Migration ★", "FastAPI 래퍼 24 endpoint (최대 리스크)", CORAL_G),
    ("Phase 4 (1주)", "수동 검토 + 테스트", "Manual Review, XML Merge, AOP", WARN_G),
    ("Phase 5 (1주)", "도구 + 설정", "SQL 실행기, 로그, 보고서, KB", MUTED),
]

y = 1.35
for name, title, desc, accent in phases:
    add_glass_card(s, 0.5, y, 12.1, 0.85, 15)
    add_text(s, 0.8, y + 0.08, 2, 0.3, name, font_size=13, color=accent, bold=True)
    add_text(s, 3, y + 0.08, 3.5, 0.3, title, font_size=14, color=WHITE, bold=True)
    add_text(s, 0.8, y + 0.42, 11.5, 0.3, desc, font_size=10, color=SOFT_WHITE)
    y += 0.95

add_text(s, 0.5, y + 0.15, 12, 0.4,
         "▶ Phase 1 완료 시 첫 E2E 데모  |  ▶ Phase 3이 최대 리스크  |  ▶ Phase 4-5 병렬 가능",
         font_size=11, color=WARN_G, bold=True, align=PP_ALIGN.CENTER)

# ----------------------------------------------------------
# SLIDE 11: Tech Stack
# ----------------------------------------------------------
s = prs.slides.add_slide(blank)
setup_slide(s)
add_text(s, 0.6, 0.3, 10, 0.5, "기술 스택 & 산출물", font_size=28, color=WHITE, bold=True, font_name="Segoe UI Light")

add_glass_info(s, 0.5, 1.1, 4, 3, "Frontend",
               ["React 18 + TypeScript", "Vite 8 (빌드 < 1초)", "Tailwind CSS v4",
                "React Router v6", "Recharts (차트)", "Lucide React (아이콘)"], CYAN)
add_glass_info(s, 4.65, 1.1, 4, 3, "Backend",
               ["OMA_Strands_Graph", "  FastAPI + Strands SDK", "strands-oracle-migration",
                "  CLI + sqlglot", "AI: Bedrock (Claude)", "Runtime: AgentCore"], VIOLET)
add_glass_info(s, 8.8, 1.1, 3.8, 3, "Deliverables",
               ["25개 페이지 프론트엔드", "프로젝트 관리 + 기능 토글", "마이그레이션 스코프",
                "4개 통합 문서", "GitHub Repo"], SUCCESS_G)

add_glass_info(s, 0.5, 4.3, 12.1, 2.1, "Infrastructure",
               ["ECS Fargate: 백엔드 2개  |  ALB: path-based routing  |  S3 + CloudFront: 프론트",
                "DMS: Schema Conversion + Data Replication  |  Bedrock + AgentCore: AI",
                "Oracle RDS (소스)  |  PostgreSQL RDS (타겟)"], CYAN)

# ----------------------------------------------------------
# SLIDE 12: Q&A
# ----------------------------------------------------------
s = prs.slides.add_slide(blank)
setup_slide(s)

add_glass_card(s, 0.8, 0.5, 7, 6.2, 12)
add_text(s, 1.5, 1.5, 6, 1.5, "Q & A", font_size=64, color=WHITE, bold=True, font_name="Segoe UI Light")
add_text(s, 1.5, 3.2, 6, 0.5, "질문 및 논의", font_size=18, color=MUTED, font_name="Segoe UI Light")

add_glass_info(s, 8.2, 0.5, 4.4, 3, "Immediate Actions",
               ["1. Phase 1 착수", "   API 클라이언트 + 카탈로그",
                "2. OMA_Strands_Graph 수정", "   프론트 전용 endpoint",
                "3. FastAPI 래퍼 설계", "   strands-oracle-migration"], SUCCESS_G)
add_glass_info(s, 8.2, 3.65, 4.4, 3.05, "Discussion Points",
               ["프로젝트 관리:", "  localStorage vs 서버?",
                "FastAPI 래퍼:", "  담당 팀/리소스?",
                "배포:", "  CloudFront vs ECS?",
                "인증:", "  Cognito / IAM IdC?"], WARN_G)

# SAVE
output_path = os.path.join(os.path.dirname(__file__), "OMA_WebUI_v2_Glassmorphism.pptx")
prs.save(output_path)
print(f"Saved: {output_path}")
print(f"Slides: {len(prs.slides)}")
