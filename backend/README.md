# Deed Analysis Backend

This directory contains the Python backend code for analyzing property deeds and detecting potential violations using AI-powered text analysis.

## Files

- `deed_analyzer.py` - Main Python script containing the deed analysis logic

## Overview

The backend implements a flowchart-based analysis system that:
1. Checks document type and validates it's a booklet-type deed
2. Examines inquiry history and timing
3. Analyzes usage of the "Tashil Law" (Facilitation Law)
4. Uses AI simulation to analyze deed text for:
   - Joint liabilities according to Facilitation Law
   - Residential use or land/building status
   - References to official inquiries
   - Conditional transactions

## Functions

### `analyze_deed_text_with_llm(deed_text: str, prompt: str) -> bool`
Simulates Large Language Model (LLM) analysis of deed text. In a production environment, this would be replaced with actual API calls to services like OpenAI's ChatGPT.

### `check_deed_for_violations(deed: dict) -> str`
Main function that implements the complete flowchart logic for deed violation detection.

### `analyze_text_section(deed: dict) -> str`
Handles the text analysis section of the flowchart, examining deed content for various violation indicators.

## Input Format

The system expects a deed dictionary with the following fields:

```python
{
    "document_type": "booklet",  # Type of document
    "has_inquiry_history": True, # Whether there's inquiry history
    "inquiry_date": "2025-07-20", # Date of inquiry
    "deed_date": "2025-08-15",   # Date of deed registration
    "uses_tashil_law": False,    # Whether Facilitation Law was used
    "inquiry_response_has_issue": False, # Whether inquiry response has issues
    "text": "Full deed text..."  # Complete deed text
}
```

## Output Format

Returns a string indicating the analysis result:
- "پایان (تخلفی شناسایی نشد)" - No violations detected
- "ارسال به کارتابل تخلف بازرسی (...)" - Various violation types requiring inspection

## Integration

The backend is integrated with the Next.js frontend through the `/api/deed-analysis` endpoint, which:
1. Receives deed data via POST request
2. Calls the Python analysis script
3. Returns the analysis results to the frontend

## Dependencies

- Python 3.x
- `datetime` module (built-in)
- `random` module (built-in)

For production use with actual LLM integration:
- `openai` package or similar AI service SDK

## Usage

```python
from deed_analyzer import check_deed_for_violations

# Sample deed data
deed = {
    "document_type": "booklet",
    "has_inquiry_history": True,
    "inquiry_date": "2025-07-20",
    "deed_date": "2025-08-15",
    "uses_tashil_law": False,
    "inquiry_response_has_issue": False,
    "text": "Deed text content..."
}

result = check_deed_for_violations(deed)
print(f"Analysis result: {result}")
```