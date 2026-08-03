#!/usr/bin/env python3
"""Pick next orchestrator task and print a min-token prompt.

Canonical queue: docs/todo-orchestrator/queue.json
(Human-editable twin: queue.yaml — regenerate JSON after YAML edits.)

Usage:
  python3 scripts/todo-orchestrator-next.py
  python3 scripts/todo-orchestrator-next.py T-SRCH-01
  python3 scripts/todo-orchestrator-next.py --list
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
QUEUE = ROOT / "docs/todo-orchestrator/queue.json"


def load_tasks():
    data = json.loads(QUEUE.read_text())
    return data, data["tasks"]


def deps_done(task, by_id):
    for d in task.get("deps") or []:
        dep = by_id.get(d)
        if not dep or dep["status"] != "done":
            return False
    return True


def pick_next(tasks):
    by_id = {t["id"]: t for t in tasks}
    candidates = [t for t in tasks if t["status"] == "todo" and deps_done(t, by_id)]
    if not candidates:
        return None
    candidates.sort(key=lambda t: (t["priority"], t["id"]))
    return candidates[0]


def render_prompt(task) -> str:
    src = task["source"]
    acc = "\n".join(f"- {a}" for a in task.get("acceptance") or [])
    touch = ", ".join(task.get("touch") or []) or "(docs only)"
    deps = ", ".join(task.get("deps") or []) or "none"
    skill = task.get("skill") or "none"
    return f"""TASK {task['id']} | P{task['priority']} | SLA {task['sla']}
TITLE: {task['title']}
SKILL: skills/{skill}/SKILL.md
SOURCE: {src['file']} L{src['start']}-L{src['end']}   # read ONLY this range
TOUCH: {touch}
DEPS: {deps}
DO NOT: read other TODO docs; broaden scope; invent demo users; raw hex / bg-gray-*

ACCEPTANCE (PM Tester grades these only):
{acc}

DONE WHEN: all AC met + lint/typecheck/test green + VERDICT APPROVED from Reviewer and PM Tester.
"""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("task_id", nargs="?")
    ap.add_argument("--list", action="store_true")
    args = ap.parse_args()
    _, tasks = load_tasks()
    by_id = {t["id"]: t for t in tasks}

    if args.list:
        for t in sorted(tasks, key=lambda x: (x["priority"], x["id"])):
            print(f"{t['status']:7} P{t['priority']} {t['sla']} {t['id']:12} {t['title']}")
        return

    if args.task_id:
        task = by_id.get(args.task_id)
        if not task:
            print(f"Unknown task {args.task_id}", file=sys.stderr)
            sys.exit(2)
    else:
        task = pick_next(tasks)
        if not task:
            print("No runnable todo (all blocked/done/wont).", file=sys.stderr)
            sys.exit(3)

    print(render_prompt(task))


if __name__ == "__main__":
    main()
