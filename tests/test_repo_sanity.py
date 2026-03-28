import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


class RepoSanityTests(unittest.TestCase):
    def test_no_merge_conflict_markers_in_key_files(self) -> None:
        target_files = [
            ROOT / "README.md",
            ROOT / "static" / "app.js",
            ROOT / "static" / "styles.css",
            ROOT / "templates" / "index.html",
        ]
        markers = ("<<<<<<<", "=======", ">>>>>>>")

        for file in target_files:
            text = file.read_text(encoding="utf-8")
            for marker in markers:
                self.assertNotIn(marker, text, f"Found {marker!r} in {file}")

    def test_frontend_asset_paths_exist(self) -> None:
        html = (ROOT / "templates" / "index.html").read_text(encoding="utf-8")
        self.assertIn("../static/styles.css", html)
        self.assertIn("../static/app.js", html)

        self.assertTrue((ROOT / "static" / "styles.css").exists())
        self.assertTrue((ROOT / "static" / "app.js").exists())


if __name__ == "__main__":
    unittest.main()
