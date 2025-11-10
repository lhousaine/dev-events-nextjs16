import { Event } from '@/database';
import connectDB from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';

import { v2 as cloudinary } from 'cloudinary';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const formData = await req.formData();

    let event;

    try {
      event = Object.fromEntries(formData.entries());
    } catch (error) {
      return NextResponse.json(
        {
          message: 'Invalid JSON data format',
        },
        { status: 400 }
      );
    }

    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json(
        { message: 'Image file is required' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();

    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { resource_type: 'image', folder: 'DevEvent' },
          (error, results) => {
            if (error) reject(error);

            resolve(results);
          }
        )
        .end(buffer);
    });

    event.image = (uploadResult as { secure_url: string }).secure_url;

    const createdEvent = await Event.create(event);

    return NextResponse.json(
      { message: 'Event create successfully', event: createdEvent },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json({
      message: 'Event Creation Failed',
      error: error instanceof Error ? error.message : 'Unknow',
    });
  }
}

export async function GET() {
  try {
    await connectDB();

    const events = await Event.find().sort({ createdAt: -1 });

    return NextResponse.json(
      { message: 'Event Fetch successfully', events },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: 'Event fetching Failed',
        error,
      },
      { status: 500 }
    );
  }
}
