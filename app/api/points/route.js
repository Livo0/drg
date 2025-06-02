import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Point from '@/models/Point';
import Event from '@/models/Event';
import Participant from '@/models/Participant';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');
    const participantId = searchParams.get('participantId');
    
    await connectToDatabase();
    
    const filter = {};
    
    if (eventId) {
      filter.event = eventId;
    }
    
    if (participantId) {
      filter.participant = participantId;
    }
    
    const points = await Point.find(filter)
      .populate('event')
      .populate('participant')
      .sort({ date: -1 });
    
    return NextResponse.json({ points }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { eventId, participantId, points, date, notes } = body;
    
    await connectToDatabase();
    
    // Validate event
    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    
    // Validate participant
    const participant = await Participant.findById(participantId);
    if (!participant) {
      return NextResponse.json({ error: 'Participant not found' }, { status: 404 });
    }
    
    // Check if participant is part of the event
    if (!event.participants.includes(participantId)) {
      return NextResponse.json(
        { error: 'Participant is not part of this event' },
        { status: 400 }
      );
    }
    
    const pointRecord = await Point.create({
      event: eventId,
      participant: participantId,
      points,
      date: date || new Date(),
      notes,
    });
    
    return NextResponse.json({ point: pointRecord }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}