from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
import fitz
import os
import tempfile
import uuid
from paddleocr import PaddleOCR
import signal
import sys
import cloudinary
import cloudinary.uploader
import cloudinary.api

# Windows Ctrl+C handling
def signal_handler(sig, frame):
    print('You pressed Ctrl+C! Exiting Python server...')
    sys.exit(0)

signal.signal(signal.SIGINT, signal_handler)

app = FastAPI()

# Configure Cloudinary
cloudinary.config(
  cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME"),
  api_key = os.getenv("CLOUDINARY_API_KEY"),
  api_secret = os.getenv("CLOUDINARY_API_SECRET"),
  secure = True
)

ocr_instance = None

def get_ocr():
    global ocr_instance
    if ocr_instance is None:
        print("Loading PaddleOCR model (Lazy Load)...")
        try:
            ocr_instance = PaddleOCR(use_angle_cls=False, lang="en", enable_mkldnn=True)
            print("PaddleOCR loaded successfully with MKLDNN enabled.")
        except Exception as e:
            print(f"Failed to load with MKLDNN, falling back to safe mode: {e}")
            ocr_instance = PaddleOCR(use_angle_cls=False, lang="en", enable_mkldnn=False)
    return ocr_instance

def perform_ocr_on_file(file_path):
    """Helper to run OCR on a file path directly. 
    This is more stable than passing numpy arrays on Windows."""
    try:
        # cls=False because we disabled angle classifier in init, but explicit is better
        ocr = get_ocr()
        result = ocr.ocr(file_path, cls=False)
        text = ""
        if result and result[0]:
            for line in result[0]:
                text += line[1][0] + "\n"
        if not text.strip():
            print(f"WARNING: OCR returned empty text for {file_path}")
        return text
    except Exception as e:
        print(f"OCR failed for {file_path}: {e}")
        return ""

def upload_to_cloudinary(file_path):
    """Uploads a file to Cloudinary and returns the secure URL."""
    try:
        if not os.getenv("CLOUDINARY_CLOUD_NAME"):
            print("WARNING: Cloudinary not configured. Skipping upload.")
            return None
            
        print(f"Uploading {file_path} to Cloudinary...")
        response = cloudinary.uploader.upload(file_path, folder="velocity_ai_uploads")
        url = response.get("secure_url")
        print(f"Uploaded to Cloudinary: {url}")
        return url
    except Exception as e:
        print(f"Cloudinary upload failed: {e}")
        return None

def process_pptx(content):
    from pptx import Presentation
    from pptx.enum.shapes import MSO_SHAPE_TYPE
    import io
    
    print(f"Processing PPTX content...")
    ppt_file = io.BytesIO(content)
    prs = Presentation(ppt_file)
    text = ""
    
    for i, slide in enumerate(prs.slides):
        text += f"\n--- Slide {i+1} ---\n"
        # 0. Speaker Notes (Important for context)
        if slide.has_notes_slide:
            try:
                notes_slide = slide.notes_slide
                if notes_slide.notes_text_frame:
                    notes = notes_slide.notes_text_frame.text
                    if notes.strip():
                        text += f"\n[Speaker Notes]: {notes.strip()}\n"
            except:
                pass

        for shape in slide.shapes:
            # 1. Text extraction
            if hasattr(shape, "text"):
                text += shape.text + "\n"

            # 2. Table extraction
            if shape.shape_type == MSO_SHAPE_TYPE.TABLE:
                try:
                    table = shape.table
                    # Build Markdown Table
                    rows = []
                    for row in table.rows:
                        cells = [cell.text_frame.text.strip().replace('\n', ' ') for cell in row.cells]
                        rows.append(f"| {' | '.join(cells)} |")
                    
                    if rows:
                        # Header separator
                        separator = f"| {' | '.join(['---'] * len(table.columns))} |"
                        rows.insert(1, separator)
                        text += "\n" + "\n".join(rows) + "\n"
                except Exception as e:
                    print(f"Error extracting table: {e}")
            
            # 3. Chart extraction
            if hasattr(shape, "has_chart") and shape.has_chart:
                try:
                    chart = shape.chart
                    title = "Untitled Chart"
                    try:
                        if chart.chart_title and chart.chart_title.has_text_frame:
                            title = chart.chart_title.text_frame.text
                    except:
                        pass
                        
                    text += f"\n**Chart Data: {title}**\n"
                    
                    # Try to build a table of the chart data
                    for plot in chart.plots:
                        try:
                            categories = [c.label for c in plot.categories]
                            series_list = plot.series
                            
                            # Markdown table for chart data
                            # Headers: Category | Series 1 | Series 2 ...
                            headers = ["Category"] + [s.name for s in series_list]
                            rows = [f"| {' | '.join(headers)} |"]
                            rows.append(f"| {' | '.join(['---'] * len(headers))} |")
                            
                            for i, category in enumerate(categories):
                                row_data = [str(category)]
                                for series in series_list:
                                    try:
                                        val = series.values[i]
                                        row_data.append(str(val) if val is not None else "N/A")
                                    except:
                                        row_data.append("N/A")
                                rows.append(f"| {' | '.join(row_data)} |")
                            
                            text += "\n".join(rows) + "\n"
                        except:
                            continue
                except Exception as e:
                    print(f"Error extracting chart data: {e}")

            # 4. Image extraction (Upload to Cloudinary + OCR)
            if shape.shape_type == MSO_SHAPE_TYPE.PICTURE:
                try:
                    image_blob = shape.image.blob
                    
                    # Create temp file for the image
                    with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp_img:
                        tmp_img.write(image_blob)
                        image_path = tmp_img.name
                        
                    try:
                        # Upload to Cloudinary
                        image_url = upload_to_cloudinary(image_path)
                        if image_url:
                            # Add Markdown Image Link using Cloudinary URL
                            text += f"\n![Image]({image_url})\n"
                        else:
                            text += f"\n[Image upload failed]\n"
                        
                        # Also run OCR for accessibility/context
                        try:
                            # We use the same method as the main extraction flow
                            ocr = get_ocr()
                            result = ocr.ocr(image_path)
                            
                            img_text = ""
                            if result and result[0]:
                                for line in result[0]:
                                    img_text += line[1][0] + " "
                            
                            if img_text.strip():
                                text += f"\n[Image Text/OCR]: {img_text.strip()}\n"
                        except Exception as ocr_err:
                            print(f"OCR failed for image: {ocr_err}")
                            
                    finally:
                        # Clean up temp file
                        if os.path.exists(image_path):
                            os.remove(image_path)
                            
                except Exception as e:
                    print(f"Error extracting image: {e}")
    return text

@app.post("/extract")
def extract(file: UploadFile = File(...)):
    temp_filename = None
    temp_pdf_path = None
    try:
        content = file.file.read() # Read synchronously
        name = (file.filename or "").lower()
        text = ""

        if name.endswith(".pdf"):
            total_pages = 0
            doc = None
            try:
                doc = fitz.open(stream=content, filetype="pdf")
                total_pages = len(doc) # Trigger access to check for errors
            except Exception as e:
                print(f"WARNING: Memory PDF processing failed ({e}). Falling back to temp file.")
                if 'doc' in locals() and doc:
                    doc.close()
                
                with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
                    tmp.write(content)
                    temp_pdf_path = tmp.name
                
                try:
                    doc = fitz.open(temp_pdf_path)
                    total_pages = len(doc)
                except Exception as e_fallback:
                    print(f"ERROR: Fallback PyMuPDF processing failed: {e_fallback}. Attempting direct PaddleOCR...")
                    # Close doc if partially opened
                    if 'doc' in locals() and doc:
                        try: doc.close() 
                        except: pass
                    doc = None # Signal that fitz failed

            
                # Fallback: PyMuPDF failed entirely. Use PaddleOCR directly.
                print("DEBUG: PyMuPDF extraction failed. Attempting fallback...")
                
                # If fitz failed to open, we can't rasterize it easily.
                # Assuming PaddleOCR might not handle PDF paths directly in this env.
                # Let's try to just return a clear error or try one last desperate attempt if Paddle supports it.
                # Better to return error than verify empty text.
                print("ERROR: Corrupted PDF or password protected. Cannot extract.")
                text = "[Error: PDF file is corrupted or password protected. Please try another file.]"

            if doc:
                print(f"DEBUG: PDF opened. Total pages: {total_pages}")
            
            for page_num, page in enumerate(doc or []):
                print(f"DEBUG: Processing Page {page_num + 1}/{total_pages}...")
                
                # TIMEOUT / SAFETY: Skip if we've spent too long on a single request (e.g., > 3 minutes)
                # (For now, just rely on per-page speedups)

                # 1. Try to extract text directly (Fastest)
                t = page.get_text().strip()
                
                # Check if we have substantial text
                if len(t) > 50:
                    print(f"DEBUG: Page {page_num + 1}: Text detected ({len(t)} chars). Using extracted text.")
                    text += f"\n\n{t}\n"
                    
                    # 2. Extract images from the page for OCR (Mixed content)
                    try:
                        image_list = page.get_images(full=True)
                        if image_list:
                            print(f"DEBUG: Page {page_num + 1}: Found {len(image_list)} images. processing significant ones...")
                            
                            # SAFETY: Limit number of images per page to avoid hanging on complex layouts
                            for img_index, img in enumerate(image_list[:5]): 
                                try:
                                    xref = img[0]
                                    base_image = doc.extract_image(xref)
                                    image_bytes = base_image["image"]
                                    
                                    # Skip small images (likely icons/logos)
                                    if len(image_bytes) < 5000: # < 5KB
                                        continue
                                        
                                    # Skip extremely large images (likely full page backgrounds that are just colors)
                                    if len(image_bytes) > 10 * 1024 * 1024: # > 10MB
                                        print(f"DEBUG: Skipping huge image {img_index} (>10MB)")
                                        continue

                                    # OCthis specific image
                                    print(f"DEBUG: OCR'ing Image {img_index + 1} on Page {page_num + 1} ({len(image_bytes)} bytes)...")
                                    tmp_img_name = ""
                                    try:
                                        with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp_img:
                                            tmp_img.write(image_bytes)
                                            tmp_img_name = tmp_img.name
                                        
                                        # Use optimized ocr if available
                                        img_text = perform_ocr_on_file(tmp_img_name)
                                        print(f"DEBUG: Image {img_index + 1} OCR result len: {len(img_text)}")
                                        if len(img_text) > 20:
                                            text += f"\n\n{img_text}\n"
                                        
                                        # Upload significant images to Cloudinary (optional feature, maybe strictly OCR for now)
                                        # For now, let's keep PDF focused on text extraction. 
                                        # If we want to display images in the notes, we would upload here.
                                        # Let's enable upload for large/significant images if they have OCR text!
                                        if len(img_text) > 20:
                                             image_url = upload_to_cloudinary(tmp_img_name)
                                             if image_url:
                                                 text += f"\n![Image]({image_url})\n"

                                    finally:
                                        if os.path.exists(tmp_img_name):
                                            os.remove(tmp_img_name)
                                except Exception as img_err:
                                    print(f"Error processing image {img_index} on page {page_num}: {img_err}")
                    except Exception as e:
                        print(f"Error extracting images from page {page_num}: {e}")

                else:
                    # 3. Fallback: Full Page OCR (Slowest, only if no text)
                    print(f"DEBUG: Page {page_num + 1}: No text detected. Running Full Page OCR.")
                    
                    try:
                        temp_filename = ""
                        with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp:
                            temp_filename = tmp.name
                        # Closed here so pix.save works
                        
                        # Render page to image at 300 DPI (Standard for OCR)
                        pix = page.get_pixmap(dpi=300) 
                        pix.save(temp_filename)
                        
                        print(f"DEBUG: Starting full page OCR for Page {page_num + 1}...")
                        page_text = perform_ocr_on_file(temp_filename)
                        print(f"DEBUG: Finished full page OCR for Page {page_num + 1}. Len: {len(page_text)}")
                        text += f"\n\n{page_text}\n"
                    finally:
                        if temp_filename and os.path.exists(temp_filename):
                            try: 
                                os.remove(temp_filename)
                            except: 
                                pass

        elif name.endswith(".pptx"):
            print(f"Processing PPTX file: {name}")
            text += process_pptx(content)

        else:
            # Image file - Save to temp file
            with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp:
                tmp.write(content)
                temp_filename = tmp.name
            
            print(f"Processing image file: {temp_filename}")
            # OCR the image
            text += perform_ocr_on_file(temp_filename)
            
            # Use Cloudinary if the image is the main content? 
            # Usually the frontend sends the image. 
            # But if it's stored as 'extracted text', we might not need the image link 
            # unless we want to show it.
            # Currently the frontend displays the uploaded image as a preview locally before sending.
            
            # Clean up main temp file
            if temp_filename and os.path.exists(temp_filename):
                os.remove(temp_filename)

        return { "text": text }
    except Exception as e:
        import traceback
        error_msg = traceback.format_exc()
        print(error_msg)
        with open("error.log", "a") as f:
            f.write(f"\n--- Error processing {file.filename} ---\n")
            f.write(error_msg)
            f.write("\n----------------------------------------\n")
        return JSONResponse(status_code=500, content={"error": str(e)})
    finally:
        # Double check cleanup
        if temp_filename and os.path.exists(temp_filename):
            try:
                os.remove(temp_filename)
            except:
                pass
        
        if temp_pdf_path and os.path.exists(temp_pdf_path):
            try:
                # Ensure doc is closed if it refers to this file
                # Note: 'doc' might not be in scope if error occurred before definition
                if 'doc' in locals() and doc:
                    doc.close()
                os.remove(temp_pdf_path)
            except:
                pass

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)