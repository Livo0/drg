import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Event from '@/models/Event';
import Point from '@/models/Point';

export async function GET(request, { params }) {
  try {
    const id = await params.id;
    
    await connectToDatabase();
    
    const event = await Event.findById(id).populate('participants');
    
    if (!event) {

return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    
    return NextResponse.json({ event }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const id = await params.id;
    const body = await request.json();
    const { name, description, startDate, endDate, isActive, participants } = body;
    
    await connectToDatabase();
    
    const event = await Event.findById(id);
    
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    
    event.name = name || event.name;
    event.description = description || event.description;
    event.startDate = startDate || event.startDate;
    event.endDate = endDate || event.endDate;
    event.isActive = isActive !== undefined ? isActive : event.isActive;
    
    if (participants) {
      event.participants = participants;
    }
    
    await event.save();
    
    return NextResponse.json({ event }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const id = await params.id;
    
    await connectToDatabase();
    
    // Delete all points associated with this event
    await Point.deleteMany({ event: id });
    
    // Delete the event
    const event = await Event.findByIdAndDelete(id);
    
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Event deleted successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}