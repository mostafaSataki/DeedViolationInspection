import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const deed = await db.deed.findUnique({
      where: { id: params.id },
    });

    if (!deed) {
      return NextResponse.json(
        { error: 'Deed not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(deed);
  } catch (error) {
    console.error('Error fetching deed:', error);
    return NextResponse.json(
      { error: 'Failed to fetch deed' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const existingDeed = await db.deed.findUnique({
      where: { id: params.id },
    });

    if (!existingDeed) {
      return NextResponse.json(
        { error: 'Deed not found' },
        { status: 404 }
      );
    }

    const {
      title,
      document_type,
      has_inquiry_history,
      inquiry_date,
      deed_date,
      uses_tashil_law,
      inquiry_response_has_issue,
      text,
      analysis_result,
    } = body;

    const updatedDeed = await db.deed.update({
      where: { id: params.id },
      data: {
        ...(title && { title }),
        ...(document_type && { document_type }),
        ...(has_inquiry_history !== undefined && { has_inquiry_history }),
        ...(inquiry_date && { inquiry_date: new Date(inquiry_date) }),
        ...(deed_date && { deed_date: new Date(deed_date) }),
        ...(uses_tashil_law !== undefined && { uses_tashil_law }),
        ...(inquiry_response_has_issue !== undefined && { inquiry_response_has_issue }),
        ...(text && { text }),
        ...(analysis_result && { analysis_result }),
      },
    });

    return NextResponse.json(updatedDeed);
  } catch (error) {
    console.error('Error updating deed:', error);
    return NextResponse.json(
      { error: 'Failed to update deed' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const existingDeed = await db.deed.findUnique({
      where: { id: params.id },
    });

    if (!existingDeed) {
      return NextResponse.json(
        { error: 'Deed not found' },
        { status: 404 }
      );
    }

    await db.deed.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Deed deleted successfully' });
  } catch (error) {
    console.error('Error deleting deed:', error);
    return NextResponse.json(
      { error: 'Failed to delete deed' },
      { status: 500 }
    );
  }
}