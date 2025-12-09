import mongoose, { Schema, Document, Model } from "mongoose";

export interface IParticipant extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  conversationId: mongoose.Types.ObjectId;
  joinedAt: Date;
  deletedAt?: Date | null;
  id: string;
}

const ParticipantSchema: Schema<IParticipant> = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    conversationId: { type: Schema.Types.ObjectId, ref: "Conversation", required: true },
    joinedAt: { type: Date, default: Date.now },
    deletedAt: { type: Date, default: null },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound unique index to prevent duplicate participants
ParticipantSchema.index({ userId: 1, conversationId: 1 }, { unique: true });

// Index for queries by conversation
ParticipantSchema.index({ conversationId: 1 });

export const Participant: Model<IParticipant> = mongoose.model<IParticipant>("Participant", ParticipantSchema);
