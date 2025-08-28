from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
import datetime
import random
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Deed Analysis API",
    description="API for analyzing property deeds using AI",
    version="1.0.0"
)

# Enable CORS for frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js development server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class DeedAnalysisRequest(BaseModel):
    document_type: str
    has_inquiry_history: bool
    inquiry_date: Optional[str] = None
    deed_date: Optional[str] = None
    uses_tashil_law: bool
    inquiry_response_has_issue: bool
    text: str

class DeedAnalysisResponse(BaseModel):
    result: str
    analysis_details: Optional[Dict[str, Any]] = None
    confidence: Optional[float] = None

class HealthResponse(BaseModel):
    status: str
    message: str
    timestamp: str

def analyze_deed_text_with_llm(deed_text: str, prompt: str) -> bool:
    """
    Analyze deed text using LLM (simulated)
    In a real implementation, this would call an actual LLM API
    """
    print("==========================================================")
    print(f"  Starting LLM text analysis (simulated) ")
    print("----------------------------------------------------------")
    print(f"Prompt sent to model:\n{prompt}")
    print("----------------------------------------------------------")
    print(f"Sample of deed text sent:\n'{deed_text[:200]}...'")
    print("----------------------------------------------------------")
    
    # Simulate LLM response with random result
    # In real implementation, this would process actual LLM response
    result = random.choice([True, False])
    
    print(f"Simulated model response: {'Yes' if result else 'No'}")
    print("==========================================================")
    
    return result

def check_deed_for_violations(deed: DeedAnalysisRequest) -> str:
    """
    Main function to implement the flowchart logic for violation detection
    """
    analysis_details = {
        "steps": [],
        "decision_path": [],
        "factors": {}
    }
    
    # Step 1: Is the document a booklet-type deed?
    analysis_details["steps"].append("check_document_type")
    analysis_details["factors"]["document_type"] = deed.document_type
    
    if deed.document_type != 'booklet':
        result = "ارسال به کارتابل تخلف بازرسی (نوع سند غیر دفترچه‌ای)"
        analysis_details["decision_path"].append("non_booklet_type")
        analysis_details["steps"].append("violation_detected")
        return result
    
    # Step 2: Is there an inquiry history in the system?
    analysis_details["steps"].append("check_inquiry_history")
    analysis_details["factors"]["has_inquiry_history"] = deed.has_inquiry_history
    
    if deed.has_inquiry_history:
        # Step 2.1: Has more than 21 days passed since inquiry request until deed execution?
        analysis_details["steps"].append("check_inquiry_timing")
        
        if deed.inquiry_date and deed.deed_date:
            try:
                inquiry_date = datetime.datetime.strptime(deed.inquiry_date, '%Y-%m-%d').date()
                deed_date = datetime.datetime.strptime(deed.deed_date, '%Y-%m-%d').date()
                days_difference = (deed_date - inquiry_date).days
                
                analysis_details["factors"]["days_difference"] = days_difference
                
                if days_difference > 21:
                    analysis_details["decision_path"].append("inquiry_timing_over_21_days")
                    # Proceed to step 3
                else:
                    analysis_details["decision_path"].append("inquiry_timing_under_21_days")
                    # Go to "Deed text analysis" section
                    return analyze_text_section(deed, analysis_details)
                    
            except (ValueError, TypeError):
                # If date parsing fails, proceed to text analysis
                analysis_details["decision_path"].append("date_parse_error")
                return analyze_text_section(deed, analysis_details)
        else:
            analysis_details["decision_path"].append("missing_dates")
            return analyze_text_section(deed, analysis_details)
    
    # Step 3: Was the facilitation law used in executing the deed?
    analysis_details["steps"].append("check_tashil_law")
    analysis_details["factors"]["uses_tashil_law"] = deed.uses_tashil_law
    
    if not deed.uses_tashil_law:
        analysis_details["decision_path"].append("no_tashil_law")
        # Go to "Deed text analysis" section
        return analyze_text_section(deed, analysis_details)
    
    # Step 4 (AI text analysis): Are joint liabilities of the parties mentioned as per facilitation law?
    analysis_details["steps"].append("analyze_joint_liabilities")
    
    prompt_joint_liabilities = f"""
        Analyze the following deed text carefully. Does this text contain any clause regarding "joint liabilities of the parties according to the facilitation law" or similar phrases that refer to shared responsibility of buyer and seller?
        Only answer with "Yes" or "No".
        Deed text:
        ---
        {deed.text}
        ---
    """
    
    if not analyze_deed_text_with_llm(deed.text, prompt_joint_liabilities):
        result = "ارسال به کارتابل تخلف بازرسی (عدم وجود تعهدات تضامنی قانون تسهیل)"
        analysis_details["decision_path"].append("missing_joint_liabilities")
        analysis_details["steps"].append("violation_detected")
        return result
        
    # In all other cases, go to "Deed text analysis" section
    return analyze_text_section(deed, analysis_details)

def analyze_text_section(deed: DeedAnalysisRequest, analysis_details: dict) -> str:
    """
    This function implements the "Deed text analysis" section of the flowchart
    """
    # Step 5 (AI text analysis): Can residential use or land and building be inferred from the deed text?
    analysis_details["steps"].append("analyze_residential_use")
    
    prompt_residential_use = f"""
        Analyze the following deed text carefully. Can you infer from the content that the property has "residential use" or consists of "land and building"? Pay attention to words like "apartment", "house", "residential", "land", "building", and similar terms.
        Only answer with "Yes" or "No".
        Deed text:
        ---
        {deed.text}
        ---
    """
    
    if analyze_deed_text_with_llm(deed.text, prompt_residential_use):
        result = "ارسال به کارتابل تخلف بازرسی (استنباط کاربری مسکونی از متن)"
        analysis_details["decision_path"].append("residential_use_inferred")
        analysis_details["steps"].append("violation_detected")
        return result
    
    # Step 6 (AI text analysis): Is there a reference to inquiry from an acceptable authority in the deed text?
    analysis_details["steps"].append("analyze_inquiry_reference")
    
    prompt_inquiry_reference = f"""
        Analyze the following deed text carefully. Does the text mention obtaining inquiry from an official and acceptable authority (such as municipality, agricultural jihad, registration office)? Pay attention to phrases like "based on inquiry response number..." or "with reference to the letter from the office...".
        Only answer with "Yes" or "No".
        Deed text:
        ---
        {deed.text}
        ---
    """
    
    if analyze_deed_text_with_llm(deed.text, prompt_inquiry_reference):
        # Step 6.1: If inquiry response is available, is there an issue with the response from the acceptable authority?
        # This data should be obtained from outside the deed text
        analysis_details["steps"].append("check_inquiry_response_issue")
        analysis_details["factors"]["inquiry_response_has_issue"] = deed.inquiry_response_has_issue
        
        if deed.inquiry_response_has_issue:
            result = "ارسال به کارتابل تخلف بازرسی (ایراد در پاسخ استعلام)"
            analysis_details["decision_path"].append("inquiry_response_issue")
            analysis_details["steps"].append("violation_detected")
            return result
    
    # Step 7 (AI text analysis): Is the deed text conditional?
    analysis_details["steps"].append("analyze_conditionality")
    
    prompt_conditionality = f"""
        Analyze the following deed text carefully. Is the transfer of ownership or execution of the transaction conditional on future events? For example, does the text contain phrases like "the buyer is obligated to do something in the future" or "the seller has conditioned that...".
        Only answer with "Yes" or "No".
        Deed text:
        ---
        {deed.text}
        ---
    """
    
    if analyze_deed_text_with_llm(deed.text, prompt_conditionality):
        result = "ارسال به کارتابل تخلف بازرسی (مشروط بودن معامله)"
        analysis_details["decision_path"].append("conditional_transaction")
        analysis_details["steps"].append("violation_detected")
        return result
        
    result = "پایان (تخلفی شناسایی نشد)"
    analysis_details["decision_path"].append("no_violation")
    analysis_details["steps"].append("analysis_complete")
    return result

@app.get("/")
async def root():
    return {"message": "Deed Analysis API is running", "version": "1.0.0"}

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        message="API is running normally",
        timestamp=datetime.datetime.now().isoformat()
    )

@app.post("/analyze", response_model=DeedAnalysisResponse)
async def analyze_deed(request: DeedAnalysisRequest):
    """
    Analyze a property deed for potential violations using AI-powered flowchart logic
    """
    try:
        print(f"\n=== Starting deed analysis ===")
        print(f"Document Type: {request.document_type}")
        print(f"Has Inquiry History: {request.has_inquiry_history}")
        print(f"Uses Tashil Law: {request.uses_tashil_law}")
        print(f"Inquiry Response Has Issue: {request.inquiry_response_has_issue}")
        print(f"Text Length: {len(request.text)} characters")
        
        # Perform the analysis
        result = check_deed_for_violations(request)
        
        # Generate confidence score (simulated)
        confidence = random.uniform(0.7, 0.95)
        
        # Create analysis details
        analysis_details = {
            "timestamp": datetime.datetime.now().isoformat(),
            "deed_summary": {
                "document_type": request.document_type,
                "has_inquiry_history": request.has_inquiry_history,
                "uses_tashil_law": request.uses_tashil_law,
                "inquiry_response_has_issue": request.inquiry_response_has_issue,
                "text_length": len(request.text)
            },
            "result": result,
            "confidence": confidence
        }
        
        print(f"=== Analysis completed ===")
        print(f"Result: {result}")
        print(f"Confidence: {confidence:.2f}")
        
        return DeedAnalysisResponse(
            result=result,
            analysis_details=analysis_details,
            confidence=confidence
        )
        
    except Exception as e:
        print(f"Error during analysis: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Analysis failed: {str(e)}"
        )

@app.get("/analyze/sample")
async def get_sample_analysis():
    """
    Returns a sample analysis for testing purposes
    """
    sample_deed = DeedAnalysisRequest(
        document_type="booklet",
        has_inquiry_history=True,
        inquiry_date="2025-07-20",
        deed_date="2025-08-15",
        uses_tashil_law=False,
        inquiry_response_has_issue=False,
        text="""
        This non-movable property deed number 1234 was executed on 1403/06/07. 
        The seller, Mr. Ahmad Ahmadi, transfers six donums of a piece of land with agricultural use covering 500 square meters located in ABC village to the buyer, Ms. Sara Saraei. 
        This transaction was executed based on Article 10 of the Civil Code and with all legal conditions. Both parties, by way of an obligatory extrajudicial instrument, waive all options including the option of fraud. 
        The buyer is obligated to pay the remaining amount of the purchase price within three months, otherwise the seller shall have the right to rescind the transaction.
        This deed was executed based on inquiry response number 11-A dated 1403/05/10 from the Registration of Deeds and Property Office.
        """
    )
    
    return await analyze_deed(sample_deed)

if __name__ == "__main__":
    import uvicorn
    print("Starting Deed Analysis API server...")
    print("Server will run on http://localhost:8000")
    print("API Documentation available at http://localhost:8000/docs")
    uvicorn.run(app, host="0.0.0.0", port=8000)