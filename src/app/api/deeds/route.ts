import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    const skip = (page - 1) * limit;

    // Build where clause for search
    const where = search
      ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { text: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    // Get deeds with pagination
    const [deeds, total] = await Promise.all([
      db.deed.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.deed.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      deeds,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Error fetching deeds:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      title,
      document_type,
      has_inquiry_history,
      inquiry_date,
      deed_date,
      uses_tashil_law,
      inquiry_response_has_issue,
      text,
    } = body;

    // Validate required fields
    if (!title || !document_type || !text) {
      return NextResponse.json(
        { error: 'Title, document type, and text are required' },
        { status: 400 }
      );
    }

    // Create new deed
    const newDeed = await db.deed.create({
      data: {
        title,
        document_type,
        has_inquiry_history: has_inquiry_history || false,
        inquiry_date: inquiry_date ? new Date(inquiry_date) : null,
        deed_date: deed_date ? new Date(deed_date) : null,
        uses_tashil_law: uses_tashil_law || false,
        inquiry_response_has_issue: inquiry_response_has_issue || false,
        text,
      },
    });

    return NextResponse.json(newDeed, { status: 201 });
  } catch (error) {
    console.error('Error creating deed:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}