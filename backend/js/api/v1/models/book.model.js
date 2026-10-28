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
    inStock: {
        type: Number,
        default: 0,
        min: 0,
        validate: {
            validator: Number.isInteger,
            message: "Sá»‘ lÆ°á»£ng tá»“n kho pháº£i lÃ  sá»‘ nguyÃªn",
        },
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
    editorRecommended: {
        type: Boolean,
        default: false,
    },
    readerFavorite: {
        type: Boolean,
        default: false,
    },
    topChartPosition: {
        type: Number,
        min: 1,
        max: 3,
    },
    heroPosition: {
        type: Number,
        min: 1,
        max: 8,
    },
    flashSale: {
        type: Boolean,
        default: false,
    },
    discountPercent: {
        type: Number,
        default: 0,
        min: 0,
        max: 90,
    },
    flashSaleEndAt: Date,
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
bookSchema.index({ title: "text", author: "text", description: "text" }, { name: "book_catalog_text", weights: { title: 10, author: 5, description: 1 }, default_language: "none" });
bookSchema.index({ soldCount: -1 });
bookSchema.index({ createdAt: -1 });
const Book = mongoose.model("Book", bookSchema, "books");
module.exports = Book;
