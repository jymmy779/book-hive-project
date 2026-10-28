import mongoose, { Schema } from "mongoose";

const ReviewSchema: Schema = new Schema(
  {
    book: {
      type: Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

ReviewSchema.index({ book: 1, createdAt: -1 });
ReviewSchema.index({ book: 1, user: 1 }, { unique: true });

const Review = mongoose.model("Review", ReviewSchema, "reviews");

module.exports = Review;
