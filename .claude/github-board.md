# GitHub board — cheat sheet

The board is **GitHub Projects** (Board view). Issues are the cards; the
`.claude/features/` and `.claude/bugs/` docs hold the deep context. An issue
`#42` maps to doc slug `42-<short-name>`.

## One-time

```bash
gh auth status                       # must be logged in
bash scripts/setup-github-labels.sh  # create the label set
```

Find your project number (shown in the Project URL, or):

```bash
gh project list --owner @me
```

Set these once per shell (replace with yours):

```bash
export GH_PROJECT=1          # your project number
export GH_OWNER=@me          # or your org/login
```

## File an issue (creates the card)

Easiest from the web (uses the Bug/Feature templates). From the terminal:

```bash
gh issue create --title "[Bug]: portfolio leaks across studios" \
  --label "type:bug,area:tenant,priority:high" --body "…"
```

Add it to the board (if the auto-add workflow isn't on):

```bash
gh project item-add "$GH_PROJECT" --owner "$GH_OWNER" \
  --url "$(gh issue view <#> --json url -q .url)"
```

## Work it

```bash
# Bugs go through the skill, which names the doc <issue#>-<slug>:
/bug 42

# Features: build via /feature, then doc lives at .claude/features/42-<slug>.md
```

Reference the issue in commits/PRs so the board auto-moves to Done:

```bash
git commit -m "Fix portfolio studio leak

Closes #42"
```

`Closes #42` / `Fixes #42` in the PR or merge commit closes the issue, and the
"Issue closed → Done" / "PR merged → Done" workflows move the card.

## Triage / view

```bash
gh issue list --label "type:bug" --state open
gh project item-list "$GH_PROJECT" --owner "$GH_OWNER"
```

> The board is the overview; the `.claude/` doc is the depth. Keep the issue
> number in the doc and the doc reference in the issue so they stay linked.
