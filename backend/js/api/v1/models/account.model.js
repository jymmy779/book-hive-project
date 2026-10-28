"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const accountSchema = new mongoose.Schema({
    fullName: String,
    email: String,
    password: String,
    phone: String,
    avatar: String,
    role_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role",
    },
    status: String,
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
const Account = mongoose.model("Account", accountSchema, "accounts");
module.exports = Account;
