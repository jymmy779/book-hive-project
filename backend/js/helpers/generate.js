"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
module.exports.generateOrderCode = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    const timestamp = `${year}${month}${day}${hours}${minutes}${seconds}`;
    const random = Math.floor(Math.random() * 100)
        .toString()
        .padStart(2, "0");
    return parseInt(`${timestamp}${random}`);
};
module.exports.generateDescriptionCode = () => {
    return Math.random().toString(36).slice(2, 8);
};
module.exports.generateOTP = () => {
    const otp = Math.floor(100000 + Math.random() * 900000);
    return otp.toString();
};
