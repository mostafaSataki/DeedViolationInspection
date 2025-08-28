import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

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

    // Prepare the deed data for Python script
    const deedData = {
      document_type: deed.document_type,
      has_inquiry_history: deed.has_inquiry_history,
      inquiry_date: deed.inquiry_date ? deed.inquiry_date.toISOString().split('T')[0] : null,
      deed_date: deed.deed_date ? deed.deed_date.toISOString().split('T')[0] : null,
      uses_tashil_law: deed.uses_tashil_law,
      inquiry_response_has_issue: deed.inquiry_response_has_issue,
      text: deed.text
    };

    // Convert deed data to JSON string and escape it for command line
    const deedJson = JSON.stringify(deedData).replace(/"/g, '\\"');

    // Path to the Python script
    const scriptPath = path.join(process.cwd(), 'backend', 'deed_analyzer.py');

    // Create a temporary Python script that imports and runs the analysis
    const tempScript = `
import sys
sys.path.append('${path.dirname(scriptPath)}')
from deed_analyzer import check_deed_for_violations
import json

deed_data = json.loads('${deedJson}')
result = check_deed_for_violations(deed_data)
print(json.dumps({"result": result}))
`;

    // Execute the Python script
    const { stdout, stderr } = await execAsync(`python3 -c "${tempScript}"`);

    if (stderr) {
      console.error('Python script stderr:', stderr);
    }

    // Parse the result
    const analysisResult = JSON.parse(stdout.trim());

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
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}