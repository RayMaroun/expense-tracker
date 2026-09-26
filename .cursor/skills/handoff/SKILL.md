---
name: handoff
description: Write docs/STATUS.md so that a fresh chat or a teammate can pick up the work cold.
disable-model-invocation: true
---

Write `docs/STATUS.md` describing the current state of the work, for someone who has not seen this chat.

Check the files and git (`git status`, `git log --oneline -5`) rather than relying on memory. Six short sections, under 40 lines in total:

1. **Done**: what is finished, with the commit id where there is one.
2. **In progress**: what is started and not finished, or "nothing".
3. **Next**: the next tasks, in order.
4. **Decisions**: choices made and why, one line each.
5. **Open questions**: what still needs a human decision.
6. **Where things are**: the files and folders a newcomer needs, and anything to avoid.

Change nothing else.
