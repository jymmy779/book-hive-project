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
  const expires = decoded?.exp ? new Date(decoded.exp * 1000) : undefined;
  res.cookie(name, token, { ...baseCookieOptions, expires });
};

module.exports.clearAuthCookie = (res, name) => {
  res.clearCookie(name, baseCookieOptions);
};

export {};
