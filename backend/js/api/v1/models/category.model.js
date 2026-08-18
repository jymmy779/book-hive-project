"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const categorySchema = new mongoose.Schema({
    title: String,
    parent_id: {
        type: String,
        default: "",
    },
    position: Number,
    description: String,
    status: {
        type: String,
        default: "active",
    },
    deleted: {
        type: Boolean,
        default: false,
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
    deletedAt: Date,
    slug: { type: String, required: true, unique: true },
}, {
    timestamps: true,
});
categorySchema.index({ deleted: 1, status: 1, slug: 1 });
const Category = mongoose.model("Category", categorySchema, "categories");
module.exports = Category;
