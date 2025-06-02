import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Event from '@/models/Event';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || '';
    const active = searchParams.get('active');
    
    await connectToDatabase();
    
    const filter = {};
    
    if (query) {
      filter.name = { $regex: query, $options: 'i' };
    }
    
    if (active !== null && active !== undefined) {
      filter.isActive = active === 'true';
    }
    
    const events = await Event.find(filter)
      .populate('participants')
      .sort({ createdAt: -1 });
    
    return NextResponse.json({ events }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, description, startDate, endDate, isActive, participants } = body;
    
    await connectToDatabase();
    
    const event = await Event.create({
      name,
      description,
      startDate,
      endDate,
      isActive: isActive !== undefined ? isActive : true,
      participants: participants || [],
    });
    
    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}