import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = [
      'document_type',
      'has_inquiry_history',
      'inquiry_date',
      'deed_date',
      'uses_tashil_law',
      'inquiry_response_has_issue',
      'text'
    ];
    
    for (const field of requiredFields) {
      if (body[field] === undefined || body[field] === null) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }
    
    // Prepare the deed data for Python script
    const deedData = {
      document_type: body.document_type,
      has_inquiry_history: body.has_inquiry_history,
      inquiry_date: body.inquiry_date,
      deed_date: body.deed_date,
      uses_tashil_law: body.uses_tashil_law,
      inquiry_response_has_issue: body.inquiry_response_has_issue,
      text: body.text
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
    const result = JSON.parse(stdout.trim());
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Error in deed analysis API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}