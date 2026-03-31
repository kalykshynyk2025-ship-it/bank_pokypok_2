# bank_pokypok_2

MVP React-приложение для проекта «Банк покупок» с:

- квестом из 5 уровней;
- базовым каталогом;
- профилем с прогрессом и наградой;
- мультиязычностью (RU / EN / MAR);
- платежным блоком (интеграция через backend API).

## Запуск

```bash
npm install
npm run dev
```

## Сборка

```bash
npm run build
```

## Как подготовить репозиторий, чтобы PR не падал с `Failed to create PR`

Ниже — пошаговый чеклист, который нужно выполнить **в самом репозитории**.

### 1) Проверить, что это git-репозиторий и есть коммит

```bash
git rev-parse --is-inside-work-tree
git log --oneline -1
```

Если нет ни одного коммита — сделайте первый коммит.

### 2) Проверить, что есть удалённый origin

```bash
git remote -v
```

Если `origin` отсутствует (пустой вывод), добавьте его:

```bash
git remote add origin <SSH_или_HTTPS_URL_репозитория>
```

Примеры:

```bash
git remote add origin git@github.com:<org>/<repo>.git
# или
git remote add origin https://github.com/<org>/<repo>.git
```

### 3) Проверить права доступа к удалённому репозиторию

Для SSH:

```bash
ssh -T git@github.com
```

Для HTTPS убедитесь, что у токена есть `repo` scope (для private-репо).

### 4) Убедиться, что рабочая ветка не main/master

```bash
git branch --show-current
```

Если вы в `main`, создайте feature-ветку:

```bash
git checkout -b feature/<короткое-имя-задачи>
```

### 5) Закоммитить изменения

```bash
git add .
git commit -m "feat: <описание>"
```

Если коммитить нечего, PR создать нельзя.

### 6) Запушить ветку и проставить upstream

```bash
git push -u origin feature/<короткое-имя-задачи>
```

Без пуша PR-системе не из чего формировать diff.

### 7) Проверить, что target/base ветка существует

Обычно это `main` или `develop`.

```bash
git ls-remote --heads origin
```

Если базовой ветки нет, создание PR завершится ошибкой.

### 8) Проверить, что есть diff относительно base

```bash
git fetch origin
git log --oneline origin/main..HEAD
```

Если список пустой — нет изменений для PR.

### 9) Убедиться, что нет блокирующих политик репозитория

Проверьте в GitHub/GitLab:

- branch protection rules;
- required checks;
- restrictions на создание PR из fork/ветки.

### 10) Повторить создание PR

После шагов выше обычно ошибка `Failed to create PR` исчезает.

---

### Быстрая диагностика одной командой

```bash
git status --short --branch && git remote -v && git branch --show-current
```

Если в выводе нет `origin`, сначала исправьте шаг 2.


## Автоматическая проверка перед PR

Добавлен скрипт `scripts/pr-check.sh`, который валидирует ключевые шаги подготовки PR и падает с понятной ошибкой, если найден блокер.

### Использование

```bash
./scripts/pr-check.sh
```

По умолчанию скрипт сравнивает с `origin/main`.
Если у вас другая базовая ветка, передайте её первым аргументом:

```bash
./scripts/pr-check.sh develop
```
