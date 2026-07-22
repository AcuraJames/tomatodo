# Skill: Test, Document, Commit

## Purpose
Automated workflow for running tests, updating TEST.md with new test cases, and committing changes.

## Steps

### 1. Run Tests
```bash
npm test
```
All tests must pass before proceeding.

### 2. Update TEST.md
If new features or fixes were added, update `TEST.md` with corresponding manual test cases:
- Describe the scenario clearly
- Include expected behavior
- Group by feature area

### 3. Commit
```bash
git add -A
git commit -m "<type>: <description>"
```

Commit types:
- `fix:` — bug fixes
- `feat:` — new features
- `test:` — adding/updating tests
- `docs:` — documentation changes
- `refactor:` — code refactoring

Never push unless explicitly asked.
