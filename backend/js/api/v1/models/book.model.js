"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const bookSchema = new mongoose.Schema({
    title: String,
    author: String,
    category_id: String,
    description: String,
    priceBuy: {
        type: Number,
        default: 0,
    },
    rating: {
        type: Number,
        default: 0,
    },
    reviews: {
        type: Number,
        default: 0,
    },
    image: String,
    position: Number,
    status: {
        type: String,
        default: "active",
    },
    deleted: {
        type: Boolean,
        default: false,
    },
    featured: Boolean,
    newest: Boolean,
    soldCount: {
        type: Number,
        default: 0,
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
    deletedAt: Date,
    slug: { type: String, required: true, unique: true },
}, {
    timestamps: true,
});
bookSchema.index({ deleted: 1, status: 1, featured: 1 });
bookSchema.index({ deleted: 1, status: 1, category_id: 1 });
bookSchema.index({ soldCount: -1 });
bookSchema.index({ createdAt: -1 });
const Book = mongoose.model("Book", bookSchema, "books");
module.exports = Book;
