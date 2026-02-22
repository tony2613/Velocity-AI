# test_extract.py
# Usage: python test_extract.py <filename>
import sys, io, os
from PIL import Image
import requests
import fitz  # PyMuPDF

# Load OCR API key from environment or use default
OCR_API_KEY = os.environ.get("OCR_API_KEY", "helloworld")

def ocr_space_file_bytes(image_bytes, language="eng"):
    try:
        r = requests.post(
            "https://api.ocr.space/parse/image",
            files={"filename": ("image", image_bytes)},
            data={"apikey": OCR_API_KEY, "language": language, "isOverlayRequired": False},
            timeout=60,
        )
        j = r.json()
        if j.get("IsErroredOnProcessing"):
            print("OCR.space errored:", j.get("ErrorMessage"))
            return ""
        parsed = j.get("ParsedResults")
        if not parsed:
            print("OCR.space returned no parsed results.")
            return ""
        text = "\n\n".join(p.get("ParsedText","") for p in parsed)
        return text.strip()
    except Exception as e:
        print("OCR request failed:", e)
        return ""

def extract_from_pdf_bytes(pdf_bytes):
    try:
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    except Exception as e:
        print("fitz open failed:", e)
        return ""
    out = []
    for i, page in enumerate(doc):
        try:
            t = page.get_text("text").strip()
        except Exception:
            t = ""
        print(f"Page {i} selectable-text length: {len(t)}")
        if t:
            out.append(t)
        else:
            print(f"Page {i} has no selectable text, rendering to image and OCRing...")
            pix = page.get_pixmap(dpi=200)
            img = Image.open(io.BytesIO(pix.tobytes()))
            b = io.BytesIO()
            img.save(b, format="PNG")
            txt = ocr_space_file_bytes(b.getvalue())
            print(f"OCR length for page {i}: {len(txt)}")
            out.append(txt)
    return "\n\n".join(out).strip()

def ocr_image_file(path):
    try:
        with open(path, "rb") as f:
            b = f.read()
        # try OCR.space
        txt = ocr_space_file_bytes(b)
        print("OCR.space returned length:", len(txt))
        return txt
    except Exception as e:
        print("ocr_image_file failed:", e)
        return ""

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python test_extract.py <file>")
        sys.exit(1)
    path = sys.argv[1]
    if path.lower().endswith(".pdf"):
        with open(path, "rb") as f:
            pdfb = f.read()
        text = extract_from_pdf_bytes(pdfb)
        print("=== EXTRACTED TEXT (first 1000 chars) ===")
        print(text[:1000])
    else:
        txt = ocr_image_file(path)
        print("=== OCR TEXT (first 1000 chars) ===")
        print(txt[:1000])
