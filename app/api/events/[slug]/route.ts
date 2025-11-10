import { Event, type IEvent } from '@/database';
import connectDB from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';

// Type for route parameters
interface RouteParams {
  params: Promise<{ slug: string }>;
}

/**
 * GET /api/events/[slug]
 * Fetches a single event by its slug
 */
export async function GET(
  req: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    // Extract and validate slug from route parameters
    const { slug } = await params;

    // Validate slug is present and not empty
    if (!slug || typeof slug !== 'string' || slug.trim().length === 0) {
      return NextResponse.json(
        {
          message: 'Invalid slug parameter',
          error: 'Slug is required and must be a non-empty string',
        },
        { status: 400 }
      );
    }

    // Normalize slug: lowercase and trim
    const normalizedSlug = slug.trim().toLowerCase();

    // Connect to database
    await connectDB();

    // Query event by slug
    const event: IEvent | null = await Event.findOne({ slug: normalizedSlug });

    // Handle event not found
    if (!event) {
      return NextResponse.json(
        {
          message: 'Event not found',
          error: `No event found with slug: ${normalizedSlug}`,
        },
        { status: 404 }
      );
    }

    // Convert Mongoose document to plain object for JSON response
    const eventData = event.toObject();

    // Return successful response with event data
    return NextResponse.json(
      {
        message: 'Event fetched successfully',
        event: eventData,
      },
      { status: 200 }
    );
  } catch (error) {
    // Log error for debugging
    console.error('Error fetching event by slug:', error);

    // Handle database connection errors
    if (error instanceof Error && error.message.includes('MONGODB_URI')) {
      return NextResponse.json(
        {
          message: 'Database connection error',
          error: 'Failed to connect to database',
        },
        { status: 500 }
      );
    }

    // Handle unexpected errors
    return NextResponse.json(
      {
        message: 'Failed to fetch event',
        error:
          error instanceof Error ? error.message : 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}

