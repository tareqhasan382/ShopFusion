import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "shopfusion_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

const getSecret = () =>
  new TextEncoder().encode(
    process.env.AUTH_SECRET || "insecure-dev-secret-change-me"
  );

/**
 * Sign a session JWT. Payload is a serializable user object:
 * { id, name, email, role }
 */
export const signSessionToken = async (payload) =>
  new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getSecret());

export const verifySessionToken = async (token) => {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload;
  } catch {
    return null;
  }
};

/** Create the httpOnly session cookie (server-only). */
export const createSession = async (user) => {
  const token = await signSessionToken(user);
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
};

/** Clear the session cookie (server-only). */
export const destroySession = () => {
  cookies().set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
};

/** Read and verify the current session from cookies (server-only). */
export const getSession = async () => {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
};

/** Get the authenticated user from a request cookie (route handlers). */
export const getSessionFromRequest = async (req) => {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
};
