import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Participant from '@/models/Participant';
import Event from '@/models/Event';
import Point from '@/models/Point';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    await connectToDatabase();
    
    const participant = await Participant.findById(id);
    
    if (!participant) {
      return NextResponse.json({ error: 'Participant not found' }, { status: 404 });
    }
    
    return NextResponse.json({ participant }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { username, tier, isGlobal } = body;
    
    await connectToDatabase();
    
    const participant = await Participant.findById(id);
    
    if (!participant) {
      return NextResponse.json({ error: 'Participant not found' }, { status: 404 });
    }
    
    // Check if username is being changed and if it already exists
    if (username !== participant.username) {
      const existingParticipant = await Participant.findOne({ username });
      if (existingParticipant) {
        return NextResponse.json(
          { error: 'Participant with this username already exists' },
          { status: 400 }
        );
      }
    }
    
    participant.username = username || participant.username;
    participant.tier = tier || participant.tier;
    participant.isGlobal = isGlobal !== undefined ? isGlobal : participant.isGlobal;
    
    await participant.save();
    
    return NextResponse.json({ participant }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    await connectToDatabase();
    
    // Check if participant is part of any event
    const events = await Event.find({ participants: id });
    if (events.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete participant as they are part of one or more events' },
        { status: 400 }
      );
    }
    
    // Delete all points associated with this participant
    await Point.deleteMany({ participant: id });
    
    // Delete the participant
    const participant = await Participant.findByIdAndDelete(id);
    
    if (!participant) {
      return NextResponse.json({ error: 'Participant not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Participant deleted successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}