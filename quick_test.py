# quick_test.py
# Basic test - requires: pip install requests
import os, sys

print("Python OK")
print("OCR_API_KEY:", bool(os.environ.get("OCR_API_KEY")))

try:
    import requests
    try:
        r = requests.get("https://api.ocr.space/parse/image", timeout=8)
        print("OCR.space reachable, status:", r.status_code)
    except Exception as e:
        print("OCR.space unreachable:", e)
except ImportError:
    print("requests module not found. Install with:")
    print("  pip install requests")
