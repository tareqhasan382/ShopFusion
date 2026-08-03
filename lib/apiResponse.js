import { NextResponse } from "next/server";

/** Consistent success response. */
export const jsonSuccess = (data = {}, message = "Success", status = 200) =>
  NextResponse.json({ success: true, message, ...data }, { status });

/** Consistent error response. */
export const jsonError = (message = "Something went wrong.", status = 500, extra = {}) =>
  NextResponse.json({ success: false, message, ...extra }, { status });

/** Respond with the caller of a rate-limit failure. */
export const rateLimitError = (retryAfter = 60) =>
  NextResponse.json(
    {
      success: false,
      message: `Too many requests. Please try again in ${retryAfter} seconds.`,
    },
    { status: 429, headers: { "Retry-After": String(retryAfter) } }
  );
