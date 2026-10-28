#!/usr/bin/env python3
"""Bind two independent blog reviews to one draft and its evidence/policies."""
import argparse
import hashlib
import json
from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
POLICIES = ["content/pages/about.md", "astro.config.mjs", ".claude/rules/blog-tone.md",
            ".claude/rules/blog-content-criteria.md", ".claude/skills/write-post/SKILL.md",
            ".claude/skills/review-structure/SKILL.md", ".claude/skills/review-writing/SKILL.md",
            ".claude/agents/review-structure.md", ".claude/agents/review-writing.md",
            "script/blog-review.py"]


def require(condition, message):
    if not condition:
        raise ValueError(message)


def digest(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def fingerprints(state):
    dependencies = {name: digest(ROOT / name) for name in POLICIES}
    dependencies["evidence"] = digest(state["evidence"])
    return {"draft_sha256": digest(state["draft"]),
            "policy_sha256": hashlib.sha256(json.dumps(dependencies, sort_keys=True).encode()).hexdigest()}


def metadata(path):
    # Psych is part of the Ruby runtime used by this Jekyll repository.
    ruby = '''require 'psych'; require 'json'; require 'date'
text = File.read(ARGV[0]); parts = text.split(/^---\\s*$\\n?/, 3)
abort 'Missing YAML frontmatter' unless parts.length == 3 && parts[0].strip.empty?
data = Psych.safe_load(parts[1], permitted_classes: [Date, Time], aliases: false)
abort 'Frontmatter must be a mapping' unless data.is_a?(Hash)
puts JSON.generate(data)
'''
    result = subprocess.run(["ruby", "-e", ruby, str(path)], capture_output=True, text=True)
    require(result.returncode == 0, "Invalid frontmatter: " + result.stderr.strip())
    data = json.loads(result.stdout)
    require(isinstance(data.get("title"), str) and data["title"].strip(), "title is required")
    require(bool(data.get("date")), "date is required")
    require(data.get("published") is False, "Draft must explicitly set published: false")


def validate_report(report, state, hashes):
    require(isinstance(report, dict), "Report must be an object")
    required = {"stage", "draft_sha256", "policy_sha256", "reviewer", "verdict", "findings"}
    require(set(report) == required, "Report fields must be exactly: " + ", ".join(sorted(required)))
    require(report["stage"] in ("structure", "writing"), "Unknown review stage")
    require(report["verdict"] in ("pass", "fail"), "Unknown review verdict")
    require(isinstance(report["reviewer"], str) and report["reviewer"].strip(), "reviewer is required")
    require(report["reviewer"] != state["author"], "Reviewer must differ from author")
    require(all(report[key] == value for key, value in hashes.items()), "Stale review: draft or policies/evidence changed")
    require(isinstance(report["findings"], list), "findings must be an array")
    for finding in report["findings"]:
        require(isinstance(finding, dict) and set(finding) == {"severity", "location", "message"}, "Invalid finding fields")
        require(finding["severity"] in ("error", "warning"), "Invalid finding severity")
        require(all(isinstance(finding[k], str) and finding[k].strip() for k in ("location", "message")), "Finding needs location and message")
    require((report["verdict"] == "pass") == (not report["findings"]), "Pass requires no findings; fail requires findings")


def current_reviews(state, hashes):
    valid = {}
    for stage in ("structure", "writing"):
        report = state["reviews"].get(stage)
        if report is None:
            continue
        try:
            validate_report(report, state, hashes)
            require(report["stage"] == stage, "Stage mismatch")
            if stage == "writing":
                require(valid.get("structure", {}).get("verdict") == "pass", "Structure pass required")
                require(report["reviewer"] != valid["structure"]["reviewer"], "Independent writing reviewer required")
            valid[stage] = report
        except ValueError:
            pass
    return valid


def save(path, state):
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(path.suffix + ".tmp")
    temporary.write_text(json.dumps(state, ensure_ascii=False, indent=2) + "\n")
    temporary.replace(path)


def run(args):
    state_path = Path(args.state).resolve()
    if args.command == "init":
        require(not state_path.exists(), "State already exists; use status to resume")
        state = {"version": 1, "draft": str(Path(args.draft).resolve()),
                 "evidence": str(Path(args.evidence).resolve()), "author": args.author, "reviews": {}}
        require(args.author.strip(), "author is required")
        metadata(state["draft"])
        fingerprints(state)
        save(state_path, state)
    state = json.loads(state_path.read_text())
    require(isinstance(state, dict) and state.get("version") == 1, "Unsupported state")
    require(isinstance(state.get("author"), str) and state["author"].strip(), "Invalid author")
    require(isinstance(state.get("reviews"), dict), "Invalid reviews")
    hashes = fingerprints(state)
    reviews = current_reviews(state, hashes)
    if args.command == "record":
        metadata(state["draft"])
        report = json.loads(Path(args.report).read_text())
        validate_report(report, state, hashes)
        if report["stage"] == "writing":
            require(reviews.get("structure", {}).get("verdict") == "pass", "Current structure pass required before writing review")
            require(report["reviewer"] != reviews["structure"]["reviewer"], "Writing reviewer must differ from structure reviewer")
        else:
            reviews.pop("writing", None)
        reviews[report["stage"]] = report
        state["reviews"] = reviews
        save(state_path, state)
    metadata(state["draft"])
    accepted = all(reviews.get(stage, {}).get("verdict") == "pass" for stage in ("structure", "writing"))
    output = {"draft": state["draft"], "evidence": state["evidence"], "author": state["author"],
              **hashes, "reviews": reviews, "accepted": accepted}
    print(json.dumps(output, ensure_ascii=False, indent=2))
    if args.command == "check" and not accepted:
        return 1
    return 0


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest="command", required=True)
    for command in ("init", "status", "record", "check"):
        sub = commands.add_parser(command)
        sub.add_argument("--state", required=True)
        if command == "init":
            sub.add_argument("--draft", required=True)
            sub.add_argument("--evidence", required=True)
            sub.add_argument("--author", required=True)
        if command == "record":
            sub.add_argument("--report", required=True)
    try:
        return run(parser.parse_args())
    except (ValueError, OSError, KeyError, TypeError) as error:
        print(json.dumps({"error": str(error)}, ensure_ascii=False), file=sys.stderr)
        return 2


if __name__ == "__main__":
    sys.exit(main())
