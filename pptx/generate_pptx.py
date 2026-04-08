#!/usr/bin/env python3
"""
OMA WebUI v2 발표자료 — Architectural Blueprint 테마
python-pptx로 생성
"""
from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
import os

# === Blueprint Theme Colors ===
BG = RGBColor(0x0D, 0x22, 0x40)        # #0D2240 Blueprint navy
GRID_FINE = RGBColor(0x64, 0xB4, 0xFF)  # #64B4FF @ 12%
GRID_MAJOR = RGBColor(0x64, 0xB4, 0xFF) # #64B4FF @ 22%
LINE = RGBColor(0x64, 0xC8, 0xFF)       # #64C8FF @ 60%
TEXT_DIM = RGBColor(0x64, 0xC8, 0xFF)   # dimension text
TEXT_TITLE = RGBColor(0x96, 0xDC, 0xFF)  # #96DCFF title
TEXT_WHITE = RGBColor(0xCC, 0xEC, 0xFF)  # bright white-blue
TEXT_MUTED = RGBColor(0x5A, 0x90, 0xC0)  # muted info
ACCENT = RGBColor(0xFF, 0xAA, 0x33)      # warm accent for highlights
SUCCESS = RGBColor(0x4E, 0xC9, 0x8B)     # green for completed
WARN = RGBColor(0xFF, 0xCC, 0x44)        # yellow for in-progress

SLIDE_W = Inches(13.333)
SLIDE_H = Inches(7.5)


def set_slide_bg(slide, color=BG):
    bg = slide.background
    fill = bg.fill
    fill.solid()
    fill.fore_color.rgb = color


def add_grid(slide):
    """Add blueprint grid lines"""
    # Major grid (every ~1.5 inches)
    for x in range(0, 14):
        left = Inches(x)
        line = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, left, Inches(0), Emu(8000), SLIDE_H)
        line.fill.background()
        line.line.color.rgb = GRID_MAJOR
        line.line.width = Emu(3000)
        line.line.fill.fore_color.rgb = GRID_MAJOR
        # Set transparency via alpha - approximate with thin lines
    for y in range(0, 8):
        top = Inches(y)
        line = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), top, SLIDE_W, Emu(8000))
        line.fill.background()
        line.line.color.rgb = GRID_MAJOR
        line.line.width = Emu(3000)


def add_stamp(slide, text="OMA WebUI v2\n2026-04-08\nDRAFT"):
    """Add circular blueprint stamp"""
    left = Inches(11.2)
    top = Inches(0.4)
    w = Inches(1.6)
    h = Inches(1.6)
    shape = slide.shapes.add_shape(MSO_SHAPE.OVAL, left, top, w, h)
    shape.fill.background()
    shape.line.color.rgb = LINE
    shape.line.width = Pt(2)
    tf = shape.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = text
    p.font.size = Pt(7)
    p.font.color.rgb = TEXT_DIM
    p.font.name = "Courier New"
    p.alignment = PP_ALIGN.CENTER
    tf.paragraphs[0].space_before = Pt(20)


def add_title_bar(slide, title, subtitle=None):
    """Bottom title bar — blueprint label style"""
    # Title bar background
    bar = slide.shapes.add_shape(
        MSO_SHAPE.RECTANGLE, Inches(0), Inches(6.3), SLIDE_W, Inches(1.2)
    )
    bar.fill.solid()
    bar.fill.fore_color.rgb = RGBColor(0x08, 0x18, 0x30)
    bar.line.fill.background()

    # Title text
    txBox = slide.shapes.add_textbox(Inches(0.6), Inches(6.35), Inches(10), Inches(0.55))
    tf = txBox.text_frame
    p = tf.paragraphs[0]
    p.text = title.upper()
    p.font.size = Pt(16)
    p.font.color.rgb = TEXT_TITLE
    p.font.name = "Courier New"
    p.font.bold = True
    p.font.letter_spacing = Pt(3)

    if subtitle:
        txBox2 = slide.shapes.add_textbox(Inches(0.6), Inches(6.9), Inches(10), Inches(0.4))
        tf2 = txBox2.text_frame
        p2 = tf2.paragraphs[0]
        p2.text = subtitle
        p2.font.size = Pt(9)
        p2.font.color.rgb = TEXT_MUTED
        p2.font.name = "Courier New"


def add_text_block(slide, left, top, width, height, lines, font_size=10, color=TEXT_WHITE, bold_first=False):
    """Add a text block with multiple lines"""
    txBox = slide.shapes.add_textbox(Inches(left), Inches(top), Inches(width), Inches(height))
    tf = txBox.text_frame
    tf.word_wrap = True
    for i, line in enumerate(lines):
        if i == 0:
            p = tf.paragraphs[0]
        else:
            p = tf.add_paragraph()
        p.text = line
        p.font.size = Pt(font_size)
        p.font.color.rgb = color
        p.font.name = "Courier New"
        if bold_first and i == 0:
            p.font.bold = True
            p.font.size = Pt(font_size + 2)
        p.space_after = Pt(4)


def add_section_header(slide, text, left=0.6, top=0.5):
    txBox = slide.shapes.add_textbox(Inches(left), Inches(top), Inches(8), Inches(0.5))
    tf = txBox.text_frame
    p = tf.paragraphs[0]
    p.text = f"// {text}"
    p.font.size = Pt(11)
    p.font.color.rgb = TEXT_DIM
    p.font.name = "Courier New"
    p.font.italic = True


def add_box(slide, left, top, width, height, text_lines, header=None, accent_color=LINE):
    """Rounded rectangle box with optional header"""
    shape = slide.shapes.add_shape(
        MSO_SHAPE.ROUNDED_RECTANGLE, Inches(left), Inches(top), Inches(width), Inches(height)
    )
    shape.fill.background()
    shape.line.color.rgb = accent_color
    shape.line.width = Pt(1.2)

    y_offset = top + 0.15
    if header:
        txH = slide.shapes.add_textbox(Inches(left + 0.2), Inches(y_offset), Inches(width - 0.4), Inches(0.3))
        tf = txH.text_frame
        p = tf.paragraphs[0]
        p.text = header
        p.font.size = Pt(9)
        p.font.color.rgb = accent_color
        p.font.name = "Courier New"
        p.font.bold = True
        y_offset += 0.3

    for line in text_lines:
        txL = slide.shapes.add_textbox(Inches(left + 0.2), Inches(y_offset), Inches(width - 0.4), Inches(0.22))
        tf = txL.text_frame
        p = tf.paragraphs[0]
        p.text = line
        p.font.size = Pt(8)
        p.font.color.rgb = TEXT_WHITE
        p.font.name = "Courier New"
        y_offset += 0.22


def add_table(slide, left, top, width, rows_data, col_widths=None):
    """Add a table with blueprint styling"""
    num_rows = len(rows_data)
    num_cols = len(rows_data[0]) if rows_data else 0
    table_shape = slide.shapes.add_table(num_rows, num_cols, Inches(left), Inches(top), Inches(width), Inches(num_rows * 0.35))
    table = table_shape.table

    if col_widths:
        for i, w in enumerate(col_widths):
            table.columns[i].width = Inches(w)

    for r, row in enumerate(rows_data):
        for c, cell_text in enumerate(row):
            cell = table.cell(r, c)
            cell.text = str(cell_text)
            cell.fill.solid()
            if r == 0:
                cell.fill.fore_color.rgb = RGBColor(0x0A, 0x1C, 0x35)
            else:
                cell.fill.fore_color.rgb = RGBColor(0x0D, 0x22, 0x40)

            for paragraph in cell.text_frame.paragraphs:
                paragraph.font.size = Pt(8)
                paragraph.font.name = "Courier New"
                paragraph.font.color.rgb = TEXT_TITLE if r == 0 else TEXT_WHITE
                if r == 0:
                    paragraph.font.bold = True

            # Border
            from pptx.oxml.ns import qn
            tc = cell._tc
            tcPr = tc.get_or_add_tcPr()
            for border_name in ['a:lnL', 'a:lnR', 'a:lnT', 'a:lnB']:
                ln = tcPr.find(qn(border_name))
                if ln is None:
                    from lxml import etree
                    ln = etree.SubElement(tcPr, qn(border_name))
                ln.set('w', '6350')
                sf = ln.find(qn('a:solidFill'))
                if sf is None:
                    from lxml import etree
                    sf = etree.SubElement(ln, qn('a:solidFill'))
                srgb = sf.find(qn('a:srgbClr'))
                if srgb is None:
                    from lxml import etree
                    srgb = etree.SubElement(sf, qn('a:srgbClr'))
                srgb.set('val', '1A3A5C')


# ============================================================
# BUILD PRESENTATION
# ============================================================

prs = Presentation()
prs.slide_width = Emu(12192000)   # 13.333 inches
prs.slide_height = Emu(6858000)   # 7.5 inches
blank_layout = prs.slide_layouts[6]  # blank

# ----------------------------------------------------------
# SLIDE 1: Title
# ----------------------------------------------------------
slide = prs.slides.add_slide(blank_layout)
set_slide_bg(slide)
add_grid(slide)
add_stamp(slide, "OMA WebUI v2\n2026-04-08\nVER 1.0")

# Center title
txBox = slide.shapes.add_textbox(Inches(1), Inches(2.2), Inches(10), Inches(1))
tf = txBox.text_frame
p = tf.paragraphs[0]
p.text = "ORACLE MIGRATION ACCELERATOR"
p.font.size = Pt(28)
p.font.color.rgb = TEXT_TITLE
p.font.name = "Courier New"
p.font.bold = True
p.font.letter_spacing = Pt(4)
p.alignment = PP_ALIGN.LEFT

p2 = tf.add_paragraph()
p2.text = "WebUI v2 — 현황 및 로드맵"
p2.font.size = Pt(16)
p2.font.color.rgb = TEXT_DIM
p2.font.name = "Courier New"
p2.space_before = Pt(12)

p3 = tf.add_paragraph()
p3.text = "Oracle → PostgreSQL 마이그레이션을 가속하는 통합 UI"
p3.font.size = Pt(10)
p3.font.color.rgb = TEXT_MUTED
p3.font.name = "Courier New"
p3.space_before = Pt(20)

add_title_bar(slide, "OMA WebUI v2 PRESENTATION", "2026-04-08 | Architectural Blueprint Theme")

# ----------------------------------------------------------
# SLIDE 2: Problem Definition
# ----------------------------------------------------------
slide = prs.slides.add_slide(blank_layout)
set_slide_bg(slide)
add_grid(slide)
add_stamp(slide)
add_section_header(slide, "PROBLEM DEFINITION")

add_text_block(slide, 0.6, 1.2, 5.5, 4, [
    "왜 OMA WebUI가 필요한가?",
    "",
    "■ Oracle DB 수천 개 테이블 → PostgreSQL 전환",
    "  수작업으로는 수개월~수년 소요",
    "",
    "■ AWS DMS Schema Conversion 자동 변환율: ~65%",
    "  나머지 35%: AI 에이전트 + 수동 검토 필요",
    "",
    "■ 앱 마이그레이션 (MyBatis SQL) 별도 도구 부재",
    "  XML Mapper 내 Oracle 특화 SQL 수백~수천 건",
    "",
    "■ 3단계 파이프라인을 하나의 UI에서 통합 관리",
    "  DB 스키마 → 앱 SQL → 데이터 복제",
], font_size=9, bold_first=True)

# Right side: flow diagram
add_box(slide, 7, 1.2, 4.8, 1.2, [
    "DMS SC → 65% 자동 변환",
    "AI Agent → 추가 30% 변환",
    "수동 검토 → 최종 5%",
], header="DB SCHEMA CONVERSION", accent_color=SUCCESS)

add_box(slide, 7, 2.7, 4.8, 1.2, [
    "Mapper XML 파싱 → SQL 추출",
    "sqlglot + AI Agent → 쿼리 변환",
    "XML 병합 → 테스트 검증",
], header="APP SQL MIGRATION", accent_color=ACCENT)

add_box(slide, 7, 4.2, 4.8, 1.0, [
    "DMS Full Load + CDC",
    "원본↔대상 데이터 검증",
], header="DATA REPLICATION", accent_color=TEXT_DIM)

add_title_bar(slide, "PROBLEM DEFINITION", "Oracle→PostgreSQL 마이그레이션의 자동화 과제")

# ----------------------------------------------------------
# SLIDE 3: Architecture
# ----------------------------------------------------------
slide = prs.slides.add_slide(blank_layout)
set_slide_bg(slide)
add_grid(slide)
add_stamp(slide)
add_section_header(slide, "SYSTEM ARCHITECTURE")

# Architecture boxes
add_box(slide, 0.6, 1.2, 3.5, 1.8, [
    "React 18 + TypeScript + Vite 8",
    "Tailwind CSS v4 (LiteLLM 디자인)",
    "React Router v6",
    "ProjectContext + FeatureFlags",
    "25개 페이지 | Mock 데이터",
], header="OMA WebUI (Frontend)", accent_color=TEXT_TITLE)

add_box(slide, 4.6, 1.2, 3.5, 1.8, [
    "FastAPI + Strands Agents SDK",
    "9 AI Agents (Bedrock Claude)",
    "11 REST + 1 WebSocket",
    "Oracle + PostgreSQL 직접 접근",
], header="OMA_Strands_Graph :8000", accent_color=SUCCESS)

add_box(slide, 8.6, 1.2, 3.5, 1.8, [
    "CLI Only (HTTP API 없음)",
    "5 AI Agents + sqlglot",
    "35+ Oracle 패턴 감지",
    "FastAPI 래퍼 필요 (신규)",
], header="strands-oracle-migration :8001", accent_color=WARN)

# Bottom: AWS services
add_box(slide, 0.6, 3.5, 5, 1.2, [
    "Bedrock (Claude Sonnet) | AgentCore Runtime",
    "DMS Schema Conversion | S3 Artifacts",
], header="AWS SERVICES", accent_color=TEXT_DIM)

# Decision note
add_box(slide, 6.2, 3.5, 5.8, 1.2, [
    "BFF 대신 백엔드 직접 수정 방식 채택",
    "ALB path-based routing: /api/db-* → :8000, /api/app-* → :8001",
    "→ 개발 속도 ↑, 인프라 비용 ↓, 서비스 2개 유지",
], header="ARCHITECTURE DECISION", accent_color=ACCENT)

add_title_bar(slide, "SYSTEM ARCHITECTURE", "Frontend ←→ ALB ←→ 2 Backends ←→ AWS Services")

# ----------------------------------------------------------
# SLIDE 4: Project Management
# ----------------------------------------------------------
slide = prs.slides.add_slide(blank_layout)
set_slide_bg(slide)
add_grid(slide)
add_stamp(slide)
add_section_header(slide, "PROJECT MANAGEMENT")

add_text_block(slide, 0.6, 1.2, 5, 2, [
    "멀티 프로젝트 + 마이그레이션 스코프",
    "",
    "■ 프로젝트 목록 대시보드 (루트 /)",
    "  → 카드 그리드, 프로젝트별 진행률 표시",
    "",
    "■ 프로젝트 진입 (/project/:id)",
    "  → 독립 설정, 메뉴, 상태",
    "",
    "■ 2단계 생성 프로세스:",
    "  Step 1: 이름 + 기능 프리셋 선택",
    "  Step 2: 테이블 범위 선택",
], font_size=9, bold_first=True)

# Scope selection box
add_box(slide, 6.5, 1.2, 5.5, 2.5, [
    "전체 테이블  — DB 내 모든 테이블 포함",
    "스키마 단위  — HR, SALES, FIN 등 선택",
    "테이블 직접  — 개별 테이블 체크박스",
    "",
    "예: 3,000 테이블 Oracle DB",
    "  → 300개씩 10개 프로젝트로 분할",
    "  → 병렬 마이그레이션 수행",
], header="MIGRATION SCOPE SELECTION", accent_color=SUCCESS)

add_box(slide, 6.5, 4.0, 5.5, 1.5, [
    "프로젝트별 독립: DB 접속, DMS 설정",
    "프로젝트별 독립: 에이전트 파라미터",
    "프로젝트별 독립: 기능 토글 프리셋",
    "프로젝트별 독립: 마이그레이션 진행 상태",
], header="PER-PROJECT ISOLATION", accent_color=TEXT_DIM)

add_title_bar(slide, "PROJECT MANAGEMENT", "프로젝트 목록 → 스코프 선택 → 독립 환경 진입")

# ----------------------------------------------------------
# SLIDE 5: Feature Toggles
# ----------------------------------------------------------
slide = prs.slides.add_slide(blank_layout)
set_slide_bg(slide)
add_grid(slide)
add_stamp(slide)
add_section_header(slide, "FEATURE TOGGLE SYSTEM")

add_table(slide, 0.6, 1.2, 5, [
    ["프리셋", "기능 수", "대상 사용자", "특징"],
    ["Basic", "10개", "입문자 / POC", "필수 기능만"],
    ["Standard", "17개", "일반 (기본값)", "필수 + 도구"],
    ["Advanced", "23개", "전문가", "모든 기능"],
], col_widths=[1.2, 0.8, 1.3, 1.7])

add_text_block(slide, 0.6, 3.2, 5, 2.5, [
    "동작 방식:",
    "",
    "■ 설정 > 기능 관리 페이지에서 선택",
    "■ 프리셋 선택 → 자동 플래그 설정",
    "■ 개별 토글로 세밀 조정 가능",
    "■ 비활성 기능: 사이드바 자동 숨김",
    "■ URL 직접 접속 시 안내 페이지 표시",
], font_size=9)

# Right: category breakdown
add_box(slide, 6.5, 1.2, 5.5, 1.0, [
    "DMS 실행/결과, AI 스키마, 스키마 검증",
    "SQL 추출/필터링, 쿼리 변환, XML 병합, 데이터 실행/검증",
], header="CORE (항상 활성) — 10개", accent_color=SUCCESS)

add_box(slide, 6.5, 2.5, 5.5, 1.0, [
    "대시보드, SQL 실행기, 로그 뷰어, 변환 보고서",
    "지식 베이스, Mapper 탐색, 수동 검토, 테스트 지원",
], header="STANDARD 추가 — +7개", accent_color=ACCENT)

add_box(slide, 6.5, 3.8, 5.5, 0.9, [
    "변환 컨텍스트, 에이전트 로그, 고급 에이전트 설정",
    "DMS 설정, 클라우드 스토리지 옵션",
], header="ADVANCED 추가 — +6개", accent_color=WARN)

add_title_bar(slide, "FEATURE TOGGLE SYSTEM", "3단계 프리셋 (Basic / Standard / Advanced) — 사용자 수준별 UI 최적화")

# ----------------------------------------------------------
# SLIDE 6: DB Migration
# ----------------------------------------------------------
slide = prs.slides.add_slide(blank_layout)
set_slide_bg(slide)
add_grid(slide)
add_stamp(slide)
add_section_header(slide, "DB MIGRATION PIPELINE")

# Pipeline steps
steps = [
    ("1", "Pre-Assessment", "AWS DMS", SUCCESS),
    ("2", "Schema Conversion", "AWS DMS", SUCCESS),
    ("3", "Agent Remediation", "OMA", ACCENT),
    ("4", "Schema Validation", "OMA", ACCENT),
    ("5", "DMS Replication Setup", "AWS DMS", TEXT_DIM),
    ("6", "Full Load & CDC", "AWS DMS", TEXT_DIM),
]

y = 1.2
# Section header
txH = slide.shapes.add_textbox(Inches(0.6), Inches(y), Inches(5), Inches(0.3))
tf = txH.text_frame
p = tf.paragraphs[0]
p.text = "─── SCHEMA CONVERSION (Step 1-4) ───"
p.font.size = Pt(8)
p.font.color.rgb = TEXT_DIM
p.font.name = "Courier New"
y += 0.35

for num, name, badge, color in steps[:4]:
    add_box(slide, 0.6, y, 5.5, 0.5, [f"Step {num}: {name}  [{badge}]"], accent_color=color)
    y += 0.6

txH2 = slide.shapes.add_textbox(Inches(0.6), Inches(y), Inches(5), Inches(0.3))
tf2 = txH2.text_frame
p2 = tf2.paragraphs[0]
p2.text = "─── DATA REPLICATION (Step 5-6) ───"
p2.font.size = Pt(8)
p2.font.color.rgb = TEXT_DIM
p2.font.name = "Courier New"
y += 0.35

for num, name, badge, color in steps[4:]:
    add_box(slide, 0.6, y, 5.5, 0.5, [f"Step {num}: {name}  [{badge}]"], accent_color=color)
    y += 0.6

# Right: Agent pipeline
add_box(slide, 6.8, 1.2, 5, 3, [
    "Assessment 결과: 변환 완료 / 실패",
    "(Agent Needed 상태 제거)",
    "",
    "실패 항목 → AI 에이전트 리트라이:",
    "  Discovery → Schema Architect",
    "  → Code Migrator → QA Verifier",
    "  → Evaluator (GO/NO-GO)",
    "",
    "리트라이 횟수 초과 → 최종 실패",
    "→ 수동 검토 필요",
], header="AI AGENT RETRY FLOW (5/9)", accent_color=ACCENT)

add_title_bar(slide, "DB MIGRATION PIPELINE", "DMS + AI 에이전트 협업 | AWS DMS 네이티브 vs OMA 확장 구분")

# ----------------------------------------------------------
# SLIDE 7: App Migration
# ----------------------------------------------------------
slide = prs.slides.add_slide(blank_layout)
set_slide_bg(slide)
add_grid(slide)
add_stamp(slide)
add_section_header(slide, "APP MIGRATION WORKFLOW")

app_steps = [
    ("1", "Mapper 파일 탐색", "MyBatis XML 구조 분석"),
    ("2", "SQL 추출", "정적 파싱 + 런타임 로그 수집 (AOP)"),
    ("3", "SQL 필터링", "Oracle 특화 SQL 분류 (35+ 패턴)"),
    ("4", "쿼리 변환 (AI)", "sqlglot + AI Agent 폴백"),
    ("5", "수동 검토", "실패 SQL 수동 수정 + 테스트"),
    ("6", "XML 병합", "변환 SQL → 원본 Mapper 병합"),
    ("7", "테스트 지원", "Spring AOP 에러 수집 + 자동 수정"),
]

y = 1.2
for num, name, desc in app_steps:
    add_box(slide, 0.6, y, 5.5, 0.55, [f"{desc}"], header=f"Step {num}: {name}", accent_color=LINE)
    y += 0.65

# Right highlights
add_box(slide, 6.8, 1.2, 5, 1.5, [
    "AOP/Interceptor로 서버 로그에서",
    "실제 실행된 MyBatis SQL 수집",
    "",
    "정적 추출로 잡히지 않는",
    "비즈니스 SQL 패턴 확인 가능",
], header="NEW: 런타임 로그 수집", accent_color=ACCENT)

add_box(slide, 6.8, 3.0, 5, 1.5, [
    "NVL → COALESCE",
    "DECODE → CASE WHEN",
    "CONNECT BY → WITH RECURSIVE",
    "ROWNUM → LIMIT",
    "(+) → LEFT/RIGHT JOIN",
], header="Oracle→PG 변환 예시", accent_color=SUCCESS)

add_box(slide, 6.8, 4.8, 5, 0.8, [
    "Query Rewrite 실패 → Manual Review CTA",
    "에러 복구 경로 명시화",
], header="ERROR RECOVERY", accent_color=WARN)

add_title_bar(slide, "APP MIGRATION WORKFLOW", "MyBatis SQL 변환 7단계 | 런타임 로그 수집 + AI Agent + 에러 복구")

# ----------------------------------------------------------
# SLIDE 8: UX Improvements
# ----------------------------------------------------------
slide = prs.slides.add_slide(blank_layout)
set_slide_bg(slide)
add_grid(slide)
add_stamp(slide)
add_section_header(slide, "UX IMPROVEMENTS")

improvements = [
    ("워크플로우 위치 표시", "각 페이지 상단 'Step X/10' 진행률 바\n클릭으로 다른 단계 이동 가능", SUCCESS),
    ("온보딩 모달", "첫 방문 시 3단계 설정 가이드\n필수(프로젝트 설정) vs 선택(에이전트/테스트) 구분", ACCENT),
    ("마이그레이션 범위 관리", "프로젝트 설정에서 테이블 목록 조회/수정\n대시보드에 현재 스코프 요약 표시", TEXT_DIM),
    ("LiteLLM 디자인 적용", "인디고 브랜드, 220px compact 사이드바\n13px 폰트, 최소 그림자, professional 톤", LINE),
]

y = 1.2
for i, (title, desc, color) in enumerate(improvements):
    col = 0.6 if i % 2 == 0 else 6.5
    row_y = y + (i // 2) * 2.2
    add_box(slide, col, row_y, 5.5, 1.8, desc.split('\n'), header=title, accent_color=color)

add_title_bar(slide, "UX IMPROVEMENTS", "사용자 혼란 요소 제거 | 워크플로우 가시성 | LiteLLM 디자인")

# ----------------------------------------------------------
# SLIDE 9: Gap Analysis
# ----------------------------------------------------------
slide = prs.slides.add_slide(blank_layout)
set_slide_bg(slide)
add_grid(slide)
add_stamp(slide)
add_section_header(slide, "BACKEND GAP ANALYSIS")

add_table(slide, 0.6, 1.2, 11, [
    ["구분", "프론트 요구", "백엔드 제공", "갭", "비고"],
    ["REST API", "83개", "11개", "72개", "OMA_Strands_Graph 11개만 존재"],
    ["앱 마이그레이션", "24개", "0개", "전체 신규", "CLI만 존재, FastAPI 래퍼 필요"],
    ["프로젝트 관리", "19개", "0개", "Mock 유지", "localStorage로 MVP 대응"],
    ["실시간 스트림", "7개", "1개 (WS)", "부분 매칭", "SSE 4개 + WS 1개 추가 필요"],
], col_widths=[2, 1.5, 1.5, 1.5, 4.5])

add_box(slide, 0.6, 3.6, 5.5, 2, [
    "P0 필수:  26일 (테이블 카탈로그, DMS,",
    "         AI 에이전트, 앱 마이그레이션 래퍼)",
    "P1 중요:  23일 (스키마 검증, 도구, 인프라)",
    "P2 보조:   7일 (프로젝트 서버 저장소)",
    "",
    "총 56일 = 약 11주 (1명) / 7주 (2명)",
], header="EFFORT ESTIMATE", accent_color=WARN)

add_box(slide, 6.8, 3.6, 5, 2, [
    "docs/01-backend-analysis.md",
    "  → 백엔드 현재 기능 상세",
    "docs/02-frontend-api-requirements.md",
    "  → 프론트 필요 API 83개 명세",
    "docs/03-gap-analysis.md",
    "  → GAP-00~21 상세 + 판단",
    "docs/04-integration-guide.md",
    "  → 5단계 통합 가이드",
], header="문서화 완료 (4개)", accent_color=SUCCESS)

add_title_bar(slide, "BACKEND GAP ANALYSIS", "프론트엔드 83개 API 요구 vs 백엔드 11개 제공 → 72개 갭")

# ----------------------------------------------------------
# SLIDE 10: Roadmap
# ----------------------------------------------------------
slide = prs.slides.add_slide(blank_layout)
set_slide_bg(slide)
add_grid(slide)
add_stamp(slide)
add_section_header(slide, "INTEGRATION ROADMAP")

phases = [
    ("Phase 1", "1주", "기반 구축 + 카탈로그 + Dashboard", "API 클라이언트, 테이블 카탈로그 3개 API, Dashboard 집계", SUCCESS),
    ("Phase 2", "2주", "DB Migration 핵심", "DMS 파이프라인, Assessment, AI Agent 실시간 (WebSocket)", LINE),
    ("Phase 3", "2주", "App Migration (최대 리스크)", "FastAPI 래퍼 24개 endpoint 신규 구축, SSE 스트리밍", WARN),
    ("Phase 4", "1주", "수동 검토 + 테스트", "Manual Review, XML Merge, AOP 테스트 연동", TEXT_DIM),
    ("Phase 5", "1주", "도구 + 설정 연동", "SQL 실행기, 로그, 보고서, 지식 베이스, 설정 API", TEXT_DIM),
]

y = 1.2
for name, duration, title, desc, color in phases:
    add_box(slide, 0.6, y, 11, 0.85, [desc], header=f"{name} ({duration}) — {title}", accent_color=color)
    y += 1.0

# Milestone note
add_text_block(slide, 0.6, y + 0.2, 11, 0.8, [
    "▶ Phase 1 완료 시 첫 End-to-End 데모 가능",
    "▶ Phase 3이 최대 리스크: strands-oracle-migration CLI → FastAPI HTTP 래퍼 신규 구축",
    "▶ 총 7주 (2인 기준) | Phase 4-5는 병렬 가능",
], font_size=9, color=ACCENT)

add_title_bar(slide, "INTEGRATION ROADMAP", "5단계 통합 계획 | 총 7주 | Phase 1 완료 시 첫 E2E 데모")

# ----------------------------------------------------------
# SLIDE 11: Tech Stack & Deliverables
# ----------------------------------------------------------
slide = prs.slides.add_slide(blank_layout)
set_slide_bg(slide)
add_grid(slide)
add_stamp(slide)
add_section_header(slide, "TECH STACK & DELIVERABLES")

add_box(slide, 0.6, 1.2, 5.5, 2.5, [
    "React 18 + TypeScript",
    "Vite 8 (빌드 < 1초)",
    "Tailwind CSS v4",
    "React Router v6",
    "Recharts (차트)",
    "Lucide React (아이콘)",
    "shadcn/ui 스타일 컴포넌트",
], header="FRONTEND", accent_color=TEXT_TITLE)

add_box(slide, 0.6, 4.0, 5.5, 1.5, [
    "OMA_Strands_Graph: FastAPI + Strands SDK",
    "strands-oracle-migration: Python CLI + sqlglot",
    "AI: Amazon Bedrock (Claude Sonnet)",
    "Runtime: AgentCore",
], header="BACKEND", accent_color=SUCCESS)

add_box(slide, 6.8, 1.2, 5, 2.5, [
    "■ 25개 페이지 프론트엔드 (빌드 성공)",
    "■ 프로젝트 관리 + 기능 토글 시스템",
    "■ 마이그레이션 스코프 선택 (테이블 단위)",
    "■ AWS 정합성 보정 + LiteLLM 디자인",
    "■ 4개 통합 문서 (docs/)",
    "■ GitHub Private Repo",
    "■ Dev 서버 운영 중 (CloudFront)",
], header="DELIVERABLES", accent_color=ACCENT)

add_box(slide, 6.8, 4.0, 5, 1.5, [
    "ECS Fargate (백엔드 2개)",
    "ALB (path-based routing)",
    "S3 + CloudFront (프론트엔드)",
    "DMS, Bedrock, AgentCore",
], header="INFRASTRUCTURE", accent_color=TEXT_DIM)

add_title_bar(slide, "TECH STACK & DELIVERABLES", "React + Tailwind + Vite | 25 Pages | 4 Docs | GitHub Repo")

# ----------------------------------------------------------
# SLIDE 12: Next Steps & Q&A
# ----------------------------------------------------------
slide = prs.slides.add_slide(blank_layout)
set_slide_bg(slide)
add_grid(slide)
add_stamp(slide, "OMA WebUI v2\nQ&A\nTHANK YOU")
add_section_header(slide, "NEXT STEPS & Q&A")

add_box(slide, 0.6, 1.2, 5.5, 2.2, [
    "1. Phase 1 착수: API 클라이언트 + 카탈로그 API",
    "2. OMA_Strands_Graph에 프론트 전용 endpoint 추가",
    "3. strands-oracle-migration FastAPI 래퍼 설계",
    "4. E2E 데모 환경 구축 (Oracle + PG + DMS)",
], header="IMMEDIATE ACTIONS", accent_color=SUCCESS)

add_box(slide, 0.6, 3.8, 5.5, 1.8, [
    "■ 프로젝트 관리: localStorage vs 서버 저장소?",
    "■ FastAPI 래퍼: 담당 팀/리소스 할당?",
    "■ 배포: CloudFront + S3 vs ECS?",
    "■ 인증: Cognito / IAM Identity Center?",
], header="DISCUSSION POINTS", accent_color=WARN)

# Right: large Q&A
txBox = slide.shapes.add_textbox(Inches(7), Inches(2), Inches(4), Inches(2))
tf = txBox.text_frame
p = tf.paragraphs[0]
p.text = "Q & A"
p.font.size = Pt(48)
p.font.color.rgb = TEXT_TITLE
p.font.name = "Courier New"
p.font.bold = True
p.alignment = PP_ALIGN.CENTER

p2 = tf.add_paragraph()
p2.text = "질문 및 논의"
p2.font.size = Pt(14)
p2.font.color.rgb = TEXT_DIM
p2.font.name = "Courier New"
p2.alignment = PP_ALIGN.CENTER

add_title_bar(slide, "NEXT STEPS & Q&A", "즉시 가능한 액션 + 논의 포인트")

# ----------------------------------------------------------
# SAVE
# ----------------------------------------------------------
output_path = os.path.join(os.path.dirname(__file__), "OMA_WebUI_v2_Presentation.pptx")
prs.save(output_path)
print(f"Saved: {output_path}")
print(f"Slides: {len(prs.slides)}")
