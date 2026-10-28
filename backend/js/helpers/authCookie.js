"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cookieSameSite = process.env.COOKIE_SAME_SITE ||
    (process.env.NODE_ENV === "production" ? "none" : "lax");
const baseCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" || process.env.COOKIE_SECURE === "true",
    sameSite: cookieSameSite,
    path: "/",
};
module.exports.setAuthCookie = (res, name, token) => {
    const decoded = require("jsonwebtoken").decode(token);
    const expires = (decoded === null || decoded === void 0 ? void 0 : decoded.exp) ? new Date(decoded.exp * 1000) : undefined;
    res.cookie(name, token, Object.assign(Object.assign({}, baseCookieOptions), { expires }));
};
module.exports.clearAuthCookie = (res, name) => {
    res.clearCookie(name, baseCookieOptions);
};
