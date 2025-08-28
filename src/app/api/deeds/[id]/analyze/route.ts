import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the deed from database
    const deed = await db.deed.findUnique({
      where: { id: params.id },
    });

    if (!deed) {
      return NextResponse.json(
        { error: 'Deed not found' },
        { status: 404 }
      );
    }

    // Prepare the deed data for FastAPI
    const deedData = {
      document_type: deed.document_type,
      has_inquiry_history: deed.has_inquiry_history,
      inquiry_date: deed.inquiry_date ? deed.inquiry_date.toISOString().split('T')[0] : null,
      deed_date: deed.deed_date ? deed.deed_date.toISOString().split('T')[0] : null,
      uses_tashil_law: deed.uses_tashil_law,
      inquiry_response_has_issue: deed.inquiry_response_has_issue,
      text: deed.text
    };

    console.log('Sending deed data to FastAPI backend:', {
      document_type: deedData.document_type,
      has_inquiry_history: deedData.has_inquiry_history,
      uses_tashil_law: deedData.uses_tashil_law,
      inquiry_response_has_issue: deedData.inquiry_response_has_issue,
      text_length: deedData.text.length
    });

    // Call the FastAPI backend
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    const response = await fetch(`${backendUrl}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(deedData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend analysis error:', errorText);
      return NextResponse.json(
        { error: 'Failed to analyze deed with backend service', details: errorText },
        { status: 500 }
      );
    }

    const analysisResult = await response.json();
    console.log('Backend analysis result:', analysisResult);

    // Update the deed with analysis result
    const updatedDeed = await db.deed.update({
      where: { id: params.id },
      data: {
        analysis_result: analysisResult.result,
        analysis_date: new Date(),
      },
    });

    return NextResponse.json({
      deed: updatedDeed,
      analysis: analysisResult,
    });

  } catch (error) {
    console.error('Error in deed analysis API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}