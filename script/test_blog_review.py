"""Regression tests for draft/review binding; no generated files in the repo."""
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

CLI = Path(__file__).with_name("blog-review.py")


class ReviewGateTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.draft = self.root / "draft.md"
        self.evidence = self.root / "evidence.md"
        self.state = self.root / "state.json"
        self.draft.write_text('---\ntitle: Test\ndate: 2026-10-15\npublished: false\n---\nExperience.\n')
        self.evidence.write_text("Source: author")
        self.call("init", "--draft", str(self.draft), "--evidence", str(self.evidence), "--author", "writer")

    def call(self, command, *args, code=0):
        result = subprocess.run([sys.executable, str(CLI), command, "--state", str(self.state), *args], capture_output=True, text=True)
        self.assertEqual(result.returncode, code, result.stderr or result.stdout)
        return json.loads(result.stdout or result.stderr)

    def report(self, stage="structure", **changes):
        status = self.call("status")
        report = {"stage": stage, "draft_sha256": status["draft_sha256"],
                  "policy_sha256": status["policy_sha256"], "reviewer": stage + "-reviewer",
                  "verdict": "pass", "findings": []}
        report.update(changes)
        path = self.root / (stage + ".json")
        path.write_text(json.dumps(report))
        return str(path)

    def test_complete_then_draft_change_invalidates_both(self):
        self.call("record", "--report", self.report())
        self.call("record", "--report", self.report("writing"))
        self.assertTrue(self.call("check")["accepted"])
        self.draft.write_text(self.draft.read_text() + "Changed.\n")
        self.assertFalse(self.call("check", code=1)["accepted"])
        self.call("record", "--report", str(self.root / "writing.json"), code=2)

    def test_order_and_independence(self):
        self.call("record", "--report", self.report("writing"), code=2)
        self.call("record", "--report", self.report(reviewer="writer"), code=2)
        self.call("record", "--report", self.report())
        self.call("record", "--report", self.report("writing", reviewer="structure-reviewer"), code=2)

    def test_evidence_change_invalidates(self):
        report = self.report()
        self.evidence.write_text("Different source")
        self.call("record", "--report", report, code=2)
        self.call("check", code=1)

    def test_invalid_and_missing_reports(self):
        self.call("check", code=1)
        self.call("record", "--report", str(self.root / "missing.json"), code=2)
        self.call("record", "--report", self.report(stage="unknown"), code=2)
        self.call("record", "--report", self.report(findings=[{"severity": "warning", "location": "body", "message": "Needs evidence"}]), code=2)
        self.call("record", "--report", self.report(verdict="fail"), code=2)

    def test_published_draft_is_rejected(self):
        self.draft.write_text(self.draft.read_text().replace("published: false", "published: true"))
        self.call("check", code=2)


if __name__ == "__main__":
    unittest.main()
