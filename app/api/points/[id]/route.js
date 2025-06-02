// src/app/api/points/[id]/route.js
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Point from '@/models/Point';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    await connectToDatabase();
    
    const point = await Point.findById(id)
      .populate('event')
      .populate('participant');
    
    if (!point) {
      return NextResponse.json({ error: 'Point record not found' }, { status: 404 });
    }
    
    return NextResponse.json({ point }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { points, date, notes } = body;
    
    await connectToDatabase();
    
    const pointRecord = await Point.findById(id);
    
    if (!pointRecord) {
      return NextResponse.json({ error: 'Point record not found' }, { status: 404 });
    }
    
    if (points !== undefined) pointRecord.points = points;
    if (date) pointRecord.date = date;
    if (notes !== undefined) pointRecord.notes = notes;
    
    await pointRecord.save();
    
    return NextResponse.json({ point: pointRecord }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    await connectToDatabase();
    
    const pointRecord = await Point.findByIdAndDelete(id);
    
    if (!pointRecord) {
      return NextResponse.json({ error: 'Point record not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Point record deleted successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}