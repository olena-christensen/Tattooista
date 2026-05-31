#!/usr/bin/env bash
# One-time: create the Tattooista label set on GitHub.
# Requires the GitHub CLI, authenticated: `gh auth status`.
# Run from anywhere inside the repo:  bash scripts/setup-github-labels.sh
#
# `--force` updates a label if it already exists, so this is safe to re-run.
set -euo pipefail

create() { gh label create "$1" --color "$2" --description "$3" --force; }

# Type
create "type:bug"        "d73a4a" "Something is broken or behaving unexpectedly"
create "type:feature"    "0e8a16" "New page, component, model, or capability"
create "type:chore"      "fef2c0" "Tooling, docs, refactor — no user-facing behavior"

# Priority
create "priority:high"   "b60205" "Do this next"
create "priority:medium" "fbca04" "Soon"
create "priority:low"    "c2e0c6" "Eventually"

# Area (match the tags used in .claude/bugs + .claude/features docs)
create "area:tenant"     "5319e7" "Multi-tenant / studioId scoping"
create "area:auth"       "0052cc" "Login, register, sessions, NextAuth"
create "area:db"         "006b75" "Prisma, schema, seed, migrations"
create "area:images"     "1d76db" "image-utils, wallpapers, gallery, avatars"
create "area:ui"         "bfd4f2" "Styling, layout, components"
create "area:platform"   "d4c5f9" "Platform landing / marketing, non-tenant"

echo "Done. View: gh label list"
