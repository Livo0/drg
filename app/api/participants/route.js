import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Participant from '@/models/Participant';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || '';
    const tier = searchParams.get('tier') || '';
    
    await connectToDatabase();
    
    const filter = {};
    
    if (query) {
      filter.username = { $regex: query, $options: 'i' };
    }
    
    if (tier) {
      filter.tier = tier;
    }
    
    const participants = await Participant.find(filter).sort({ createdAt: -1 });
    
    return NextResponse.json({ participants }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { username, tier, isGlobal } = body;
    
    await connectToDatabase();
    
    // Check if participant already exists
    const existingParticipant = await Participant.findOne({ username });
    if (existingParticipant) {
      return NextResponse.json(
        { error: 'Participant with this username already exists' },
        { status: 400 }
      );
    }
    
    const participant = await Participant.create({
      username,
      tier,
      isGlobal: isGlobal !== undefined ? isGlobal : true,
    });
    
    return NextResponse.json({ participant }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}