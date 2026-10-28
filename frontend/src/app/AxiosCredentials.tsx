"use client";

import axios from "axios";

// The JWT is stored in an HttpOnly cookie, so the browser sends it automatically.
axios.defaults.withCredentials = true;

export default function AxiosCredentials() {
  return null;
}
