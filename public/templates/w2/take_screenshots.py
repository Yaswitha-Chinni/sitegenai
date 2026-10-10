import subprocess
import os

chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
artifact_dir = r"C:\Users\Keshava Reddy\.gemini\antigravity\brain\79b5fb08-c890-4ab3-8923-6133335bc868"
temp_dir = os.environ.get("TEMP", r"C:\Users\Keshava Reddy\AppData\Local\Temp")

scenes = [
    ("scene02_ritual.png", "http://127.0.0.1:8000/?preview=ritual", (1920, 1080)),
    ("scene03_selection.png", "http://127.0.0.1:8000/?preview=selection", (1920, 1080)),
    ("scene04_estate.png", "http://127.0.0.1:8000/?preview=estate", (1920, 1080)),
    ("scene05_finale.png", "http://127.0.0.1:8000/?preview=finale", (1920, 1080)),
    ("mobile_hero.png", "http://127.0.0.1:8000/", (390, 844)),
    ("mobile_ritual.png", "http://127.0.0.1:8000/?preview=ritual", (390, 844)),
]

for filename, url, (w, h) in scenes:
    dest = os.path.join(artifact_dir, filename)
    cmd = [
        chrome_path,
        "--headless=new",
        f"--user-data-dir={os.path.join(temp_dir, 'chrome_cap')}",
        f"--window-size={w},{h}",
        "--hide-scrollbars",
        f"--screenshot={dest}",
        url
    ]
    res = subprocess.run(cmd, capture_output=True, text=True)
    print(f"Captured {filename}: {res.returncode}")
