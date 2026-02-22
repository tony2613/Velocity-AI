#!/usr/bin/env python3
import sys
import json
import base64

def extract_from_image(base64_data):
    """Extract text from image - simplified approach"""
    try:
        from PIL import Image
        import pytesseract
        import io
        
        image_data = base64.b64decode(base64_data)
        img = Image.open(io.BytesIO(image_data))
        text = pytesseract.image_to_string(img)
        return text.strip() if text.strip() else "[No text detected in image]"
    except Exception as e:
        return f"[Image extraction error: {str(e)}]"

def extract_from_pdf(base64_data):
    """Extract text from PDF"""
    try:
        import fitz
        import io
        
        pdf_data = base64.b64decode(base64_data)
        doc = fitz.open(stream=pdf_data, filetype="pdf")
        all_text = []
        for page in doc:
            text = page.get_text()
            if text.strip():
                all_text.append(text)
        return "\n".join(all_text).strip() if all_text else "[No text found in PDF]"
    except Exception as e:
        return f"[PDF extraction error: {str(e)}]"

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print(json.dumps({"error": "Invalid arguments"}))
        sys.exit(1)
    
    base64_data = sys.argv[1]
    file_type = sys.argv[2]
    
    try:
        if file_type == "pdf":
            text = extract_from_pdf(base64_data)
        else:
            text = extract_from_image(base64_data)
        
        print(json.dumps({"success": True, "text": text}))
    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}))
