import mongoose, { Schema, Document, Model } from "mongoose";

export enum FriendRequestStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
  DECLINED = "declined",
}

export interface IFriendRequest extends Document {
  _id: mongoose.Types.ObjectId;
  fromUserId: mongoose.Types.ObjectId;
  toUserId: mongoose.Types.ObjectId;
  status: FriendRequestStatus;
  createdAt: Date;
  updatedAt: Date;
  id: string;
}

const FriendRequestSchema: Schema<IFriendRequest> = new Schema(
  {
    fromUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    toUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: Object.values(FriendRequestStatus),
      default: FriendRequestStatus.PENDING,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound unique index
FriendRequestSchema.index({ fromUserId: 1, toUserId: 1 }, { unique: true });
// Index for status queries
FriendRequestSchema.index({ status: 1 });
// Index for user lookups
FriendRequestSchema.index({ toUserId: 1, status: 1 });

export const FriendRequest: Model<IFriendRequest> = mongoose.model<IFriendRequest>("FriendRequest", FriendRequestSchema);
