import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Event from '@/models/Event';
import Participant from '@/models/Participant';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    await connectToDatabase();
    
    const event = await Event.findById(id).populate('participants');
    
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    
    return NextResponse.json({ participants: event.participants }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { participantId } = body;
    
    await connectToDatabase();
    
    const event = await Event.findById(id);
    
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    
    const participant = await Participant.findById(participantId);
    
    if (!participant) {
      return NextResponse.json({ error: 'Participant not found' }, { status: 404 });
    }
    
    // Check if participant is already in the event
    if (event.participants.includes(participantId)) {
      return NextResponse.json(
        { error: 'Participant is already in this event' },
        { status: 400 }
      );
    }
    
    event.participants.push(participantId);
    await event.save();
    
    return NextResponse.json({ message: 'Participant added to event' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const participantId = searchParams.get('participantId');
    
    if (!participantId) {
      return NextResponse.json({ error: 'Participant ID is required' }, { status: 400 });
    }
    
    await connectToDatabase();
    
    const event = await Event.findById(id);
    
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    
    // Remove participant from event
    event.participants = event.participants.filter(
      (p) => p.toString() !== participantId
    );
    
    await event.save();
    
    return NextResponse.json({ message: 'Participant removed from event' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}