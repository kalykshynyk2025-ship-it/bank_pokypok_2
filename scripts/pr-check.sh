#!/usr/bin/env bash
set -euo pipefail

BASE_BRANCH="${1:-main}"
CURRENT_BRANCH="$(git branch --show-current 2>/dev/null || true)"

PASS_COUNT=0
WARN_COUNT=0

pass() {
  PASS_COUNT=$((PASS_COUNT + 1))
  printf '✅ %s\n' "$1"
}

warn() {
  WARN_COUNT=$((WARN_COUNT + 1))
  printf '⚠️  %s\n' "$1"
}

fail() {
  printf '❌ %s\n' "$1"
  exit 1
}

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || fail "Команда '$1' не найдена в PATH."
}

require_cmd git

printf 'Проверка готовности к PR (base: %s)\n\n' "$BASE_BRANCH"

# 1) Проверить, что это git-репозиторий и есть коммит
if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  pass "Это git-репозиторий."
else
  fail "Текущая директория не является git-репозиторием."
fi

if git rev-parse HEAD >/dev/null 2>&1; then
  pass "В репозитории есть хотя бы один коммит."
else
  fail "Нет ни одного коммита. Сделайте initial commit."
fi

# 2) Проверить, что есть удалённый origin
if git remote get-url origin >/dev/null 2>&1; then
  ORIGIN_URL="$(git remote get-url origin)"
  pass "Найден origin: ${ORIGIN_URL}"
else
  fail "Не найден remote 'origin'. Добавьте: git remote add origin <url>."
fi

# 3) Проверить права доступа к удалённому репозиторию (мягкая проверка)
if git ls-remote --exit-code origin >/dev/null 2>&1; then
  pass "Доступ к origin подтверждён (git ls-remote успешен)."
else
  fail "Нет доступа к origin (проверьте SSH ключ/токен/права)."
fi

# 4) Убедиться, что рабочая ветка не main/master
if [[ -z "$CURRENT_BRANCH" ]]; then
  fail "Не удалось определить текущую ветку (detached HEAD?)."
elif [[ "$CURRENT_BRANCH" == "main" || "$CURRENT_BRANCH" == "master" ]]; then
  fail "Вы на '${CURRENT_BRANCH}'. Создайте feature-ветку перед PR."
else
  pass "Рабочая ветка подходит для PR: ${CURRENT_BRANCH}"
fi

# 5) Проверка, что есть staged/committed изменения (не пустой diff к origin/base)
if git diff --quiet && git diff --cached --quiet; then
  warn "Незакоммиченных изменений нет — это нормально, если всё уже закоммичено."
else
  pass "Есть локальные изменения (working tree/staging)."
fi

# 6) Проверить upstream и push-готовность ветки
if git rev-parse --abbrev-ref --symbolic-full-name '@{u}' >/dev/null 2>&1; then
  UPSTREAM="$(git rev-parse --abbrev-ref --symbolic-full-name '@{u}')"
  pass "Upstream настроен: ${UPSTREAM}"
else
  fail "Upstream не настроен. Выполните: git push -u origin ${CURRENT_BRANCH}"
fi

# 7) Проверить, что target/base ветка существует
if git show-ref --verify --quiet "refs/remotes/origin/${BASE_BRANCH}"; then
  pass "Базовая ветка origin/${BASE_BRANCH} существует локально."
else
  if git ls-remote --exit-code --heads origin "${BASE_BRANCH}" >/dev/null 2>&1; then
    pass "Базовая ветка origin/${BASE_BRANCH} существует на remote."
  else
    fail "Базовая ветка '${BASE_BRANCH}' не найдена на origin."
  fi
fi

# 8) Проверить, что есть diff относительно base
if git fetch origin "${BASE_BRANCH}" --quiet >/dev/null 2>&1; then
  pass "fetch origin/${BASE_BRANCH} выполнен."
else
  warn "Не удалось обновить origin/${BASE_BRANCH}; продолжаем с локальными данными."
fi

AHEAD_COMMITS="$(git rev-list --count "origin/${BASE_BRANCH}..HEAD" 2>/dev/null || echo 0)"
if [[ "$AHEAD_COMMITS" -gt 0 ]]; then
  pass "Есть коммиты для PR: ${AHEAD_COMMITS}"
else
  fail "Нет новых коммитов относительно origin/${BASE_BRANCH}. PR будет пустым."
fi

# 9) Косвенно проверить блокирующие политики
if [[ -n "${GITHUB_ACTIONS:-}" || -n "${CI:-}" ]]; then
  warn "Проверка branch protection/required checks выполняется в UI GitHub/GitLab."
else
  warn "Проверьте branch protection и required checks в UI перед созданием PR."
fi

# 10) Финальный статус
printf '\nИтог: %s успешных проверок, %s предупреждений.\n' "$PASS_COUNT" "$WARN_COUNT"
printf 'Репозиторий готов к созданию PR.\n'
