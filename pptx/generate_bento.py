#!/usr/bin/env python3
"""
OMA WebUI v2 발표자료 — Bento Grid 테마
Apple-inspired modular grid layout
"""
from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
import os

# === Bento Grid Theme Colors ===
BG = RGBColor(0xF8, 0xF8, 0xF2)           # Off-white
DARK = RGBColor(0x1A, 0x1A, 0x2E)          # Deep navy (anchor cells)
ACCENT_YELLOW = RGBColor(0xE8, 0xFF, 0x3B)  # Bright yellow
ACCENT_CORAL = RGBColor(0xFF, 0x6B, 0x6B)   # Coral red
ACCENT_TEAL = RGBColor(0x4E, 0xCD, 0xC4)    # Teal
ACCENT_WARM = RGBColor(0xFF, 0xE6, 0x6D)    # Warm yellow
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
BLACK = RGBColor(0x1A, 0x1A, 0x1A)
GRAY = RGBColor(0x6B, 0x6B, 0x7B)
LIGHT_GRAY = RGBColor(0xE8, 0xE8, 0xE0)

# Grid constants
GAP = 0.12  # gap between cells in inches


def set_slide_bg(slide, color=BG):
    bg = slide.background
    fill = bg.fill
    fill.solid()
    fill.fore_color.rgb = color


def add_cell(slide, left, top, width, height, bg_color=WHITE, corner_radius=12):
    """Add a Bento cell (rounded rectangle)"""
    shape = slide.shapes.add_shape(
        MSO_SHAPE.ROUNDED_RECTANGLE,
        Inches(left), Inches(top), Inches(width), Inches(height)
    )
    shape.fill.solid()
    shape.fill.fore_color.rgb = bg_color
    shape.line.fill.background()
    # Adjust corner radius
    shape.adjustments[0] = min(0.08, 0.5 / max(width, height))
    return shape


def add_text(slide, left, top, width, height, text, font_size=14, color=BLACK,
             bold=False, align=PP_ALIGN.LEFT, font_name="Inter"):
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


def add_multiline(slide, left, top, width, height, lines, font_size=11, color=BLACK,
                  line_spacing=1.2, font_name="Inter"):
    txBox = slide.shapes.add_textbox(Inches(left), Inches(top), Inches(width), Inches(height))
    tf = txBox.text_frame
    tf.word_wrap = True
    for i, (text, sz, clr, bld) in enumerate(lines):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.text = text
        p.font.size = Pt(sz)
        p.font.color.rgb = clr
        p.font.bold = bld
        p.font.name = font_name
        p.space_after = Pt(3)
    return tf


def add_stat_cell(slide, left, top, width, height, number, label, bg_color=DARK,
                  num_color=WHITE, label_color=None):
    """Large stat number cell"""
    add_cell(slide, left, top, width, height, bg_color)
    add_text(slide, left + 0.25, top + height * 0.15, width - 0.5, height * 0.5,
             str(number), font_size=48, color=num_color, bold=True)
    add_text(slide, left + 0.25, top + height * 0.6, width - 0.5, height * 0.3,
             label, font_size=12, color=label_color or RGBColor(0x99, 0x99, 0xAA))


def add_info_cell(slide, left, top, width, height, title, body_lines, bg_color=WHITE,
                  title_color=BLACK, body_color=GRAY, title_size=16):
    """Info cell with title and body"""
    add_cell(slide, left, top, width, height, bg_color)
    add_text(slide, left + 0.25, top + 0.2, width - 0.5, 0.35,
             title, font_size=title_size, color=title_color, bold=True)
    y = top + 0.55
    for line in body_lines:
        add_text(slide, left + 0.25, y, width - 0.5, 0.22,
                 line, font_size=10, color=body_color)
        y += 0.22


def add_tag(slide, left, top, text, bg_color=ACCENT_TEAL, text_color=BLACK):
    """Small tag/badge"""
    shape = slide.shapes.add_shape(
        MSO_SHAPE.ROUNDED_RECTANGLE, Inches(left), Inches(top), Inches(len(text) * 0.08 + 0.3), Inches(0.25)
    )
    shape.fill.solid()
    shape.fill.fore_color.rgb = bg_color
    shape.line.fill.background()
    shape.adjustments[0] = 0.5
    tf = shape.text_frame
    tf.word_wrap = False
    p = tf.paragraphs[0]
    p.text = text
    p.font.size = Pt(8)
    p.font.color.rgb = text_color
    p.font.bold = True
    p.font.name = "Inter"
    p.alignment = PP_ALIGN.CENTER


# Grid positions helper
# 12-col grid on 13.333" slide, with margins
ML = 0.5   # margin left
MT = 0.4   # margin top for content (below title area)
CW = 3.0   # standard cell width (4-col span)
CH = 2.4   # standard cell height


# ============================================================
prs = Presentation()
prs.slide_width = Emu(12192000)
prs.slide_height = Emu(6858000)
blank = prs.slide_layouts[6]

# ----------------------------------------------------------
# SLIDE 1: Title
# ----------------------------------------------------------
s = prs.slides.add_slide(blank)
set_slide_bg(s)

# Big dark anchor cell
add_cell(s, 0.5, 0.5, 8, 6.3, DARK)
add_text(s, 1, 1.5, 7, 1, "Oracle Migration", font_size=42, color=WHITE, bold=True)
add_text(s, 1, 2.5, 7, 1, "Accelerator", font_size=42, color=ACCENT_YELLOW, bold=True)
add_text(s, 1, 3.6, 7, 0.5, "WebUI v2 — 현황 및 로드맵", font_size=18, color=RGBColor(0x99, 0x99, 0xAA))
add_text(s, 1, 4.5, 7, 0.4, "Oracle→PostgreSQL 마이그레이션을 가속하는 통합 UI", font_size=12, color=RGBColor(0x77, 0x77, 0x88))

# Right column cells
add_stat_cell(s, 8.7, 0.5, 4, 2.0, "25", "Pages", ACCENT_TEAL, BLACK, BLACK)
add_stat_cell(s, 8.7, 2.6, 4, 2.0, "23", "Features", ACCENT_YELLOW, BLACK, BLACK)
add_stat_cell(s, 8.7, 4.7, 4, 2.1, "4", "Docs", ACCENT_CORAL, WHITE, RGBColor(0xFF, 0xCC, 0xCC))

# ----------------------------------------------------------
# SLIDE 2: Problem
# ----------------------------------------------------------
s = prs.slides.add_slide(blank)
set_slide_bg(s)

# Title area
add_text(s, 0.5, 0.3, 12, 0.5, "왜 OMA WebUI가 필요한가?", font_size=28, color=BLACK, bold=True)
add_text(s, 0.5, 0.85, 12, 0.3, "Oracle→PostgreSQL 마이그레이션의 자동화 과제", font_size=12, color=GRAY)

# Bento grid
add_stat_cell(s, 0.5, 1.4, 4, 2.2, "65%", "DMS 자동 변환율", DARK, ACCENT_YELLOW, RGBColor(0x99, 0x99, 0xAA))

add_info_cell(s, 4.6, 1.4, 4, 2.2, "나머지 35%는?",
              ["AI 에이전트로 ~30% 추가 변환", "수동 검토로 최종 ~5% 처리", "PL/SQL, DBMS_SQL 등 복잡 구문"],
              ACCENT_CORAL, WHITE, RGBColor(0xFF, 0xDD, 0xDD))

add_info_cell(s, 8.7, 1.4, 4, 2.2, "앱 마이그레이션",
              ["MyBatis XML 내 Oracle SQL", "수백~수천 건 변환 필요", "별도 도구/프로세스 부재"],
              ACCENT_WARM, BLACK, RGBColor(0x66, 0x55, 0x22))

# Bottom row — wide cell
add_info_cell(s, 0.5, 3.75, 12.2, 2.9, "해결: 3단계 통합 파이프라인",
              ["", ""], BG)
# Three sub-boxes
add_cell(s, 0.7, 4.4, 3.8, 2.0, WHITE)
add_text(s, 0.95, 4.55, 3.3, 0.3, "① DB 스키마 변환", font_size=14, color=BLACK, bold=True)
add_text(s, 0.95, 4.95, 3.3, 1.0, "DMS SC + AI Agent\n스키마/프로시저/함수 변환\nAssessment → 리트라이 → 검증", font_size=10, color=GRAY)

add_cell(s, 4.65, 4.4, 3.8, 2.0, WHITE)
add_text(s, 4.9, 4.55, 3.3, 0.3, "② 앱 SQL 변환", font_size=14, color=BLACK, bold=True)
add_text(s, 4.9, 4.95, 3.3, 1.0, "MyBatis XML 파싱\nsqlglot + AI 폴백\n런타임 로그 수집 → 병합", font_size=10, color=GRAY)

add_cell(s, 8.6, 4.4, 3.8, 2.0, WHITE)
add_text(s, 8.85, 4.55, 3.3, 0.3, "③ 데이터 복제", font_size=14, color=BLACK, bold=True)
add_text(s, 8.85, 4.95, 3.3, 1.0, "DMS Full Load + CDC\n테이블별 진행률 추적\n원본↔대상 데이터 검증", font_size=10, color=GRAY)

# ----------------------------------------------------------
# SLIDE 3: Architecture
# ----------------------------------------------------------
s = prs.slides.add_slide(blank)
set_slide_bg(s)
add_text(s, 0.5, 0.3, 12, 0.5, "시스템 아키텍처", font_size=28, color=BLACK, bold=True)
add_text(s, 0.5, 0.85, 12, 0.3, "Frontend ←→ ALB ←→ 2 Backends ←→ AWS Services", font_size=12, color=GRAY)

# Frontend box (wide)
add_info_cell(s, 0.5, 1.4, 6, 2.2, "OMA WebUI (Frontend)",
              ["React 18 + TypeScript + Vite 8", "Tailwind CSS v4 (LiteLLM 디자인)", "25 Pages | 3 Preset | Mock 데이터",
               "React Router: / → /project/:id/*"],
              DARK, ACCENT_YELLOW, RGBColor(0xBB, 0xBB, 0xCC))

# ALB
add_cell(s, 6.6, 1.4, 1.4, 2.2, ACCENT_TEAL)
add_text(s, 6.7, 2.0, 1.2, 0.8, "ALB\npath\nrouting", font_size=11, color=BLACK, bold=True, align=PP_ALIGN.CENTER)

# Backend 1
add_info_cell(s, 8.1, 1.4, 4.6, 1.0, "OMA_Strands_Graph :8000",
              ["FastAPI + Strands SDK | 9 Agents | 11 REST + WS"],
              WHITE, ACCENT_TEAL, GRAY)

# Backend 2
add_info_cell(s, 8.1, 2.55, 4.6, 1.0, "strands-oracle-migration :8001",
              ["CLI only → FastAPI 래퍼 필요 | 5 Agents + sqlglot"],
              WHITE, ACCENT_CORAL, GRAY)

# AWS row
add_info_cell(s, 0.5, 3.8, 4, 1.5, "AWS Services",
              ["Bedrock (Claude Sonnet)", "AgentCore Runtime", "DMS Schema Conversion"],
              ACCENT_WARM, BLACK, RGBColor(0x55, 0x44, 0x11))

add_info_cell(s, 4.6, 3.8, 4, 1.5, "Infrastructure",
              ["ECS Fargate (백엔드 2개)", "S3 + CloudFront (프론트)", "ALB (path-based routing)"],
              WHITE, BLACK, GRAY)

add_info_cell(s, 8.7, 3.8, 4, 1.5, "의사결정: BFF 미채택",
              ["BFF 대신 백엔드 직접 수정", "개발 속도 ↑, 인프라 비용 ↓", "API 클라이언트가 추상화 담당"],
              RGBColor(0xF0, 0xF0, 0xE8), BLACK, GRAY)

# Bottom note
add_text(s, 0.5, 5.6, 12, 0.3, "/api/db-* → :8000  |  /api/app-* → :8001  |  / → S3 (React SPA)", font_size=10, color=GRAY, align=PP_ALIGN.CENTER)

# ----------------------------------------------------------
# SLIDE 4: Project Management
# ----------------------------------------------------------
s = prs.slides.add_slide(blank)
set_slide_bg(s)
add_text(s, 0.5, 0.3, 12, 0.5, "프로젝트 관리 체계", font_size=28, color=BLACK, bold=True)
add_text(s, 0.5, 0.85, 12, 0.3, "멀티 프로젝트 + 테이블 스코프 선택 + 독립 환경", font_size=12, color=GRAY)

# Flow: 3 cells
add_stat_cell(s, 0.5, 1.4, 3.8, 2.8, "/", "프로젝트 목록", DARK, ACCENT_YELLOW, RGBColor(0x99, 0x99, 0xAA))
add_text(s, 0.75, 3.1, 3.3, 0.8, "카드 그리드\n프로젝트별 진행률\n생성/복제/삭제", font_size=10, color=RGBColor(0x88, 0x88, 0x99))

# Arrow
add_text(s, 4.4, 2.2, 0.5, 0.5, "→", font_size=32, color=GRAY, bold=True, align=PP_ALIGN.CENTER)

add_info_cell(s, 4.9, 1.4, 3.8, 2.8, "Step 1: 기본 정보",
              ["프로젝트 이름 입력", "기능 프리셋 선택", "Basic / Standard / Advanced", "", "Step 2: 테이블 범위", "전체 / 스키마 / 개별 선택"],
              WHITE, BLACK, GRAY, 14)

add_text(s, 8.8, 2.2, 0.5, 0.5, "→", font_size=32, color=GRAY, bold=True, align=PP_ALIGN.CENTER)

add_info_cell(s, 9.3, 1.4, 3.4, 2.8, "/project/:id",
              ["독립 설정 (DB, DMS)", "독립 기능 토글", "독립 마이그레이션 상태", "독립 사이드바 메뉴"],
              ACCENT_TEAL, BLACK, RGBColor(0x22, 0x55, 0x44), 14)

# Bottom: scope example
add_cell(s, 0.5, 4.5, 12.2, 2.0, WHITE)
add_text(s, 0.75, 4.65, 3, 0.3, "마이그레이션 스코프 예시", font_size=14, color=BLACK, bold=True)

scopes = [
    ("프로젝트 A", "HR + SALES", "15개 테이블", ACCENT_TEAL),
    ("프로젝트 B", "FIN + INV", "13개 테이블", ACCENT_YELLOW),
    ("프로젝트 C", "CRM", "6개 테이블", ACCENT_CORAL),
    ("프로젝트 D", "COMMON", "3개 테이블", ACCENT_WARM),
]
x = 0.75
for name, schemas, count, color in scopes:
    add_cell(s, x, 5.1, 2.8, 1.15, color)
    add_text(s, x + 0.15, 5.2, 2.5, 0.25, name, font_size=12, color=BLACK, bold=True)
    add_text(s, x + 0.15, 5.5, 2.5, 0.2, schemas, font_size=10, color=RGBColor(0x33, 0x33, 0x33))
    add_text(s, x + 0.15, 5.75, 2.5, 0.2, count, font_size=10, color=GRAY)
    x += 2.95

# ----------------------------------------------------------
# SLIDE 5: Feature Toggles
# ----------------------------------------------------------
s = prs.slides.add_slide(blank)
set_slide_bg(s)
add_text(s, 0.5, 0.3, 12, 0.5, "기능 토글 시스템", font_size=28, color=BLACK, bold=True)
add_text(s, 0.5, 0.85, 12, 0.3, "3단계 프리셋으로 사용자 수준별 UI 최적화", font_size=12, color=GRAY)

# 3 preset cards
add_stat_cell(s, 0.5, 1.4, 4, 2.5, "10", "Basic", ACCENT_TEAL, BLACK, RGBColor(0x22, 0x55, 0x44))
add_text(s, 0.75, 3.0, 3.5, 0.6, "입문자 / POC용\n필수 기능만 표시", font_size=10, color=RGBColor(0x22, 0x55, 0x44))

add_stat_cell(s, 4.6, 1.4, 4, 2.5, "17", "Standard (기본값)", DARK, ACCENT_YELLOW, RGBColor(0x99, 0x99, 0xAA))
add_text(s, 4.85, 3.0, 3.5, 0.6, "일반 마이그레이션\n필수 + 디버깅 도구", font_size=10, color=RGBColor(0x88, 0x88, 0x99))

add_stat_cell(s, 8.7, 1.4, 4, 2.5, "23", "Advanced", ACCENT_CORAL, WHITE, RGBColor(0xFF, 0xCC, 0xCC))
add_text(s, 8.95, 3.0, 3.5, 0.6, "전문가용\n모든 기능 활성화", font_size=10, color=RGBColor(0xFF, 0xCC, 0xCC))

# Bottom: how it works
add_info_cell(s, 0.5, 4.2, 6, 2.3, "동작 방식",
              ["설정 > 기능 관리에서 프리셋 선택 또는 개별 토글",
               "비활성 기능: 사이드바에서 자동 숨김",
               "URL 직접 접속 시 안내 페이지 + 원클릭 활성화",
               '목적: "기능이 너무 많아 헷갈린다" 해결'],
              WHITE, BLACK, GRAY)

add_info_cell(s, 6.6, 4.2, 6.1, 2.3, "카테고리별 분류",
              ["DB Migration: 5개 (Core 4 + Optional 1)",
               "App Migration: 7개 (Core 4 + Optional 3)",
               "Data Migration: 2개 (Core 2)",
               "Tools: 5개 (전부 Optional)",
               "Settings 내부: 3개 (전부 Optional)"],
              RGBColor(0xF0, 0xF0, 0xE8), BLACK, GRAY)

# ----------------------------------------------------------
# SLIDE 6: DB Migration
# ----------------------------------------------------------
s = prs.slides.add_slide(blank)
set_slide_bg(s)
add_text(s, 0.5, 0.3, 12, 0.5, "DB 마이그레이션 파이프라인", font_size=28, color=BLACK, bold=True)
add_text(s, 0.5, 0.85, 12, 0.3, "DMS + AI 에이전트 협업 | AWS DMS vs OMA 확장 구분", font_size=12, color=GRAY)

# Schema Conversion section
add_text(s, 0.5, 1.3, 3, 0.3, "SCHEMA CONVERSION", font_size=10, color=ACCENT_TEAL, bold=True)
sc_steps = [
    ("1", "Pre-Assessment", "AWS DMS", ACCENT_TEAL),
    ("2", "Schema Conversion", "AWS DMS", ACCENT_TEAL),
    ("3", "Agent Remediation", "OMA", ACCENT_WARM),
    ("4", "Schema Validation", "OMA", ACCENT_WARM),
]
y = 1.65
for num, name, badge, color in sc_steps:
    add_cell(s, 0.5, y, 5.5, 0.55, WHITE)
    add_text(s, 0.7, y + 0.1, 0.3, 0.3, num, font_size=14, color=BLACK, bold=True)
    add_text(s, 1.1, y + 0.12, 2.5, 0.3, name, font_size=12, color=BLACK)
    add_tag(s, 4.5, y + 0.15, badge, color, BLACK)
    y += 0.65

# Data Replication section
add_text(s, 0.5, y + 0.05, 3, 0.3, "DATA REPLICATION", font_size=10, color=GRAY, bold=True)
y += 0.35
dr_steps = [
    ("5", "DMS Replication Setup", "AWS DMS", RGBColor(0xDD, 0xDD, 0xDD)),
    ("6", "Full Load & CDC", "AWS DMS", RGBColor(0xDD, 0xDD, 0xDD)),
]
for num, name, badge, color in dr_steps:
    add_cell(s, 0.5, y, 5.5, 0.55, WHITE)
    add_text(s, 0.7, y + 0.1, 0.3, 0.3, num, font_size=14, color=GRAY, bold=True)
    add_text(s, 1.1, y + 0.12, 2.5, 0.3, name, font_size=12, color=GRAY)
    add_tag(s, 4.5, y + 0.15, badge, color, BLACK)
    y += 0.65

# Right: AI Agent flow
add_info_cell(s, 6.2, 1.3, 6.5, 3.2, "AI Agent Retry Flow (5/9 에이전트)",
              ["Assessment 결과: 변환 완료 / 실패 (2개 상태만)",
               "",
               "실패 항목 → AI 에이전트 리트라이:",
               "  Discovery → Schema Architect → Code Migrator",
               "  → QA Verifier → Evaluator (GO/NO-GO)",
               "",
               "리트라이 횟수 초과 → 최종 실패 → 수동 검토",
               "Evaluator 임계점수: 기본 80 (설정 변경 가능)"],
              DARK, ACCENT_YELLOW, RGBColor(0xBB, 0xBB, 0xCC))

add_info_cell(s, 6.2, 4.7, 6.5, 1.8, "AWS DMS vs OMA 확장",
              ["Pre-Assessment, Schema Conversion → AWS DMS 네이티브",
               "Agent Remediation, Validation → OMA 확장 기능",
               "UI에서 배지로 출처 구분 (파란=DMS, 주황=OMA)"],
              WHITE, BLACK, GRAY)

# ----------------------------------------------------------
# SLIDE 7: App Migration
# ----------------------------------------------------------
s = prs.slides.add_slide(blank)
set_slide_bg(s)
add_text(s, 0.5, 0.3, 12, 0.5, "앱 마이그레이션 워크플로우", font_size=28, color=BLACK, bold=True)
add_text(s, 0.5, 0.85, 12, 0.3, "MyBatis SQL 변환 7단계 | 런타임 로그 수집 + AI Agent", font_size=12, color=GRAY)

# 7 steps in bento cells
steps_app = [
    ("1", "Mapper 탐색", "XML 구조 분석", 0.5, 1.4, 3.8, 1.3, WHITE),
    ("2", "SQL 추출", "정적 + 런타임 로그", 4.4, 1.4, 3.8, 1.3, ACCENT_WARM),
    ("3", "SQL 필터링", "35+ Oracle 패턴", 8.3, 1.4, 4.4, 1.3, WHITE),
    ("4", "쿼리 변환", "sqlglot + AI Agent", 0.5, 2.85, 5.7, 1.3, DARK),
    ("5", "수동 검토", "실패 SQL 수정", 6.3, 2.85, 3, 1.3, ACCENT_CORAL),
    ("6", "XML 병합", "Mapper 재조립", 9.4, 2.85, 3.3, 1.3, WHITE),
    ("7", "테스트 지원", "AOP 에러 수집", 0.5, 4.3, 3.8, 1.3, WHITE),
]

for num, name, desc, l, t, w, h, bg in steps_app:
    add_cell(s, l, t, w, h, bg)
    tc = BLACK if bg != DARK else ACCENT_YELLOW
    dc = GRAY if bg != DARK else RGBColor(0xAA, 0xAA, 0xBB)
    if bg == ACCENT_CORAL:
        tc = WHITE
        dc = RGBColor(0xFF, 0xDD, 0xDD)
    add_text(s, l + 0.2, t + 0.15, w - 0.4, 0.3, f"Step {num}", font_size=10, color=dc)
    add_text(s, l + 0.2, t + 0.4, w - 0.4, 0.3, name, font_size=16, color=tc, bold=True)
    add_text(s, l + 0.2, t + 0.8, w - 0.4, 0.3, desc, font_size=11, color=dc)

# Highlights
add_info_cell(s, 4.4, 4.3, 4.3, 2.1, "런타임 로그 수집 (신규)",
              ["AOP/Interceptor로 서버 로그에서",
               "실제 실행된 MyBatis SQL 수집",
               "정적 추출 + 런타임 수집 = 완전한 커버리지"],
              ACCENT_TEAL, BLACK, RGBColor(0x22, 0x55, 0x44))

add_info_cell(s, 8.8, 4.3, 3.9, 2.1, "에러 복구 경로",
              ["Query Rewrite 실패",
               "→ Manual Review CTA 버튼",
               "→ 수동 수정 후 XML 병합",
               "→ 테스트 검증"],
              WHITE, ACCENT_CORAL, GRAY)

# ----------------------------------------------------------
# SLIDE 8: UX
# ----------------------------------------------------------
s = prs.slides.add_slide(blank)
set_slide_bg(s)
add_text(s, 0.5, 0.3, 12, 0.5, "UX 개선 사항", font_size=28, color=BLACK, bold=True)
add_text(s, 0.5, 0.85, 12, 0.3, "사용자 혼란 요소 제거 | 워크플로우 가시성 | 디자인 리뉴얼", font_size=12, color=GRAY)

ux_items = [
    ("워크플로우 위치", "Step X/10 진행률 바\n클릭으로 다른 단계 이동", ACCENT_TEAL, 0.5, 1.4, 6, 2.2),
    ("온보딩 모달", "첫 방문 시 3단계 설정 가이드\n필수 vs 선택 구분", ACCENT_WARM, 6.6, 1.4, 6.1, 2.2),
    ("마이그레이션 범위", "설정에서 테이블 조회/수정\n대시보드에 스코프 요약", WHITE, 0.5, 3.75, 4, 2.7),
    ("LiteLLM 디자인", "인디고 브랜드, 220px 사이드바\n13px 폰트, minimal shadow", WHITE, 4.6, 3.75, 4, 2.7),
    ("배지 수정", "destructive 배지 텍스트\n가독성 수정 (대비 개선)", WHITE, 8.7, 3.75, 4, 2.7),
]

for title, desc, bg, l, t, w, h in ux_items:
    tc = BLACK if bg != DARK else WHITE
    add_info_cell(s, l, t, w, h, title, desc.split('\n'), bg, tc, GRAY)

# ----------------------------------------------------------
# SLIDE 9: Gap Analysis
# ----------------------------------------------------------
s = prs.slides.add_slide(blank)
set_slide_bg(s)
add_text(s, 0.5, 0.3, 12, 0.5, "백엔드 갭 분석", font_size=28, color=BLACK, bold=True)
add_text(s, 0.5, 0.85, 12, 0.3, "프론트엔드 83개 API 요구 vs 백엔드 11개 제공", font_size=12, color=GRAY)

# 4 gap summary cells
add_stat_cell(s, 0.5, 1.4, 3, 2.2, "72", "REST API 갭", DARK, ACCENT_CORAL, RGBColor(0x99, 0x99, 0xAA))
add_stat_cell(s, 3.6, 1.4, 3, 2.2, "24", "앱 마이그레이션\n전체 신규", ACCENT_CORAL, WHITE, RGBColor(0xFF, 0xDD, 0xDD))
add_stat_cell(s, 6.7, 1.4, 3, 2.2, "19", "프로젝트 관리\nMock 유지", ACCENT_WARM, BLACK, RGBColor(0x55, 0x44, 0x11))
add_stat_cell(s, 9.8, 1.4, 2.9, 2.2, "7", "실시간 스트림\n부분 매칭", ACCENT_TEAL, BLACK, RGBColor(0x22, 0x55, 0x44))

# Effort estimate
add_info_cell(s, 0.5, 3.8, 6, 2.7, "노력 추정",
              ["P0 필수:  26일 (카탈로그, DMS, AI Agent, 앱 래퍼)",
               "P1 중요:  23일 (스키마 검증, 도구, 인프라)",
               "P2 보조:   7일 (프로젝트 서버 저장소)",
               "",
               "총 56일 = ~11주 (1명) / ~7주 (2명)",
               "",
               "최대 리스크: GAP-10 앱 마이그레이션 FastAPI 래퍼 (15일)"],
              DARK, ACCENT_YELLOW, RGBColor(0xBB, 0xBB, 0xCC))

add_info_cell(s, 6.6, 3.8, 6.1, 2.7, "문서화 완료",
              ["docs/01-backend-analysis.md",
               "  → 두 백엔드 현재 기능 상세",
               "docs/02-frontend-api-requirements.md",
               "  → 프론트 필요 API 83개",
               "docs/03-gap-analysis.md",
               "  → GAP-00~21 상세 + 판단",
               "docs/04-integration-guide.md",
               "  → 5단계 통합 가이드"],
              WHITE, BLACK, GRAY)

# ----------------------------------------------------------
# SLIDE 10: Roadmap
# ----------------------------------------------------------
s = prs.slides.add_slide(blank)
set_slide_bg(s)
add_text(s, 0.5, 0.3, 12, 0.5, "통합 로드맵", font_size=28, color=BLACK, bold=True)
add_text(s, 0.5, 0.85, 12, 0.3, "5단계 통합 계획 | 총 7주 (2인 기준)", font_size=12, color=GRAY)

phases = [
    ("Phase 1", "1주", "기반 구축 + 카탈로그", "API 클라이언트, 테이블 카탈로그, Dashboard", ACCENT_TEAL),
    ("Phase 2", "2주", "DB Migration 핵심", "DMS 파이프라인, Assessment, AI Agent (WS)", DARK),
    ("Phase 3", "2주", "App Migration ★", "FastAPI 래퍼 24개 endpoint (최대 리스크)", ACCENT_CORAL),
    ("Phase 4", "1주", "수동 검토 + 테스트", "Manual Review, XML Merge, AOP", ACCENT_WARM),
    ("Phase 5", "1주", "도구 + 설정", "SQL 실행기, 로그, 보고서, KB, 설정 API", RGBColor(0xE8, 0xE8, 0xE0)),
]

y = 1.4
for name, dur, title, desc, bg in phases:
    tc = BLACK if bg not in (DARK, ACCENT_CORAL) else WHITE
    dc = GRAY if bg not in (DARK, ACCENT_CORAL) else RGBColor(0xBB, 0xBB, 0xCC)
    if bg == ACCENT_CORAL:
        dc = RGBColor(0xFF, 0xDD, 0xDD)

    add_cell(s, 0.5, y, 12.2, 0.9, bg)
    add_text(s, 0.75, y + 0.1, 1.5, 0.3, f"{name}", font_size=14, color=tc, bold=True)
    add_text(s, 2.3, y + 0.12, 0.8, 0.3, dur, font_size=11, color=dc)
    add_text(s, 3.3, y + 0.12, 3, 0.3, title, font_size=13, color=tc, bold=True)
    add_text(s, 0.75, y + 0.5, 11.5, 0.3, desc, font_size=10, color=dc)
    y += 1.0

# Milestone
add_text(s, 0.5, y + 0.15, 12, 0.5,
         "▶ Phase 1 완료 시 첫 E2E 데모  |  ▶ Phase 3이 최대 리스크  |  ▶ Phase 4-5는 병렬 가능",
         font_size=11, color=ACCENT_CORAL, bold=True, align=PP_ALIGN.CENTER)

# ----------------------------------------------------------
# SLIDE 11: Tech Stack
# ----------------------------------------------------------
s = prs.slides.add_slide(blank)
set_slide_bg(s)
add_text(s, 0.5, 0.3, 12, 0.5, "기술 스택 & 산출물", font_size=28, color=BLACK, bold=True)

add_info_cell(s, 0.5, 1.1, 4, 3, "Frontend",
              ["React 18 + TypeScript",
               "Vite 8 (빌드 < 1초)",
               "Tailwind CSS v4",
               "React Router v6",
               "Recharts (차트)",
               "Lucide React (아이콘)",
               "shadcn/ui 스타일"],
              DARK, ACCENT_TEAL, RGBColor(0xAA, 0xAA, 0xBB))

add_info_cell(s, 4.6, 1.1, 4, 3, "Backend",
              ["OMA_Strands_Graph",
               "  FastAPI + Strands SDK",
               "strands-oracle-migration",
               "  Python CLI + sqlglot",
               "AI: Bedrock (Claude Sonnet)",
               "Runtime: AgentCore"],
              WHITE, BLACK, GRAY)

add_info_cell(s, 8.7, 1.1, 4, 3, "Deliverables",
              ["25개 페이지 프론트엔드",
               "프로젝트 관리 + 기능 토글",
               "마이그레이션 스코프 선택",
               "AWS 정합성 보정",
               "4개 통합 문서 (docs/)",
               "GitHub Private Repo"],
              ACCENT_YELLOW, BLACK, RGBColor(0x44, 0x44, 0x11))

add_info_cell(s, 0.5, 4.3, 12.2, 2.1, "Infrastructure",
              ["ECS Fargate: 백엔드 2개  |  ALB: path-based routing  |  S3 + CloudFront: 프론트",
               "DMS: Schema Conversion + Data Replication  |  Bedrock + AgentCore: AI 에이전트",
               "Oracle RDS (소스)  |  PostgreSQL RDS (타겟)  |  DynamoDB (선택: 프로젝트 저장소)"],
              ACCENT_TEAL, BLACK, RGBColor(0x22, 0x55, 0x44))

# ----------------------------------------------------------
# SLIDE 12: Q&A
# ----------------------------------------------------------
s = prs.slides.add_slide(blank)
set_slide_bg(s)

# Big Q&A cell
add_cell(s, 0.5, 0.5, 7.5, 6.3, DARK)
add_text(s, 1.5, 1.5, 6, 1.5, "Q & A", font_size=64, color=WHITE, bold=True)
add_text(s, 1.5, 3.2, 6, 0.5, "질문 및 논의", font_size=18, color=RGBColor(0x88, 0x88, 0x99))

# Right column
add_info_cell(s, 8.2, 0.5, 4.5, 3, "Immediate Actions",
              ["1. Phase 1 착수",
               "   API 클라이언트 + 카탈로그 API",
               "2. OMA_Strands_Graph 수정",
               "   프론트 전용 endpoint 추가",
               "3. FastAPI 래퍼 설계",
               "   strands-oracle-migration 래핑"],
              ACCENT_TEAL, BLACK, RGBColor(0x22, 0x55, 0x44))

add_info_cell(s, 8.2, 3.65, 4.5, 3.15, "Discussion Points",
              ["프로젝트 관리:",
               "  localStorage vs 서버 저장소?",
               "FastAPI 래퍼:",
               "  담당 팀/리소스 할당?",
               "배포 환경:",
               "  CloudFront + S3 vs ECS?",
               "인증:",
               "  Cognito / IAM Identity Center?"],
              ACCENT_WARM, BLACK, RGBColor(0x55, 0x44, 0x11))

# ----------------------------------------------------------
# SAVE
# ----------------------------------------------------------
output_path = os.path.join(os.path.dirname(__file__), "OMA_WebUI_v2_BentoGrid.pptx")
prs.save(output_path)
print(f"Saved: {output_path}")
print(f"Slides: {len(prs.slides)}")
