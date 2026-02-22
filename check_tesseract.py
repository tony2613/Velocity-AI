import sys
import psutil
try:
    import pytesseract
    from PIL import Image
    import io

    # Create a dummy image
    img = Image.new('RGB', (100, 30), color = (255, 255, 255))
    
    print("Checking Tesseract...")
    try:
        pytesseract.get_tesseract_version()
        print("Tesseract binary found!")
        text = pytesseract.image_to_string(img)
        print("Tesseract execution successful.")
    except Exception as e:
        print(f"Tesseract Error: {e}")
        print("Tesseract not found or not in PATH.")

except ImportError:
    print("pytesseract not installed.")
