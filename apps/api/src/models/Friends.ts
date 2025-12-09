import mongoose, { Schema, Document, Model } from "mongoose";

export interface IFriends extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  friendId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  id: string;
}

const FriendsSchema: Schema<IFriends> = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    friendId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Pre-save hook to ensure consistent ordering (smaller ID always first)
FriendsSchema.pre("save", function (this: IFriends, next) {
  if (this.userId.toString() > this.friendId.toString()) {
    const temp = this.userId;
    this.userId = this.friendId;
    this.friendId = temp;
  }
  next();
});

// Compound unique index
FriendsSchema.index({ userId: 1, friendId: 1 }, { unique: true });

export const Friends: Model<IFriends> = mongoose.model<IFriends>("Friends", FriendsSchema);
