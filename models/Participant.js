import mongoose from 'mongoose';

const ParticipantSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Please provide a username'],
    unique: true,
    trim: true,
  },
  tier: {
    type: String,
    enum: ['R1', 'R2', 'R3', 'R4', 'R5'],
    required: [true, 'Please provide a tier'],
  },
  isGlobal: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Participant || mongoose.model('Participant', ParticipantSchema);