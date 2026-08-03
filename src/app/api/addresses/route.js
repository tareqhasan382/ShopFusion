import { connectMongodb } from "../../../../lib/mongodb";
import UserModel from "../../../../lib/models/UserModel";
import { getSessionFromRequest } from "../../../../lib/auth";
import { jsonError, jsonSuccess } from "../../../../lib/apiResponse";
import { AUTH_RATE_LIMITS, clientIp } from "../../../../lib/rateLimit";

const validateAddress = (address) => {
  if (!address || typeof address !== "object") return "Address is required.";
  if (!address.name || typeof address.name !== "string" || !address.name.trim())
    return "Full name is required.";
  if (!address.street || typeof address.street !== "string" || !address.street.trim())
    return "Street address is required.";
  if (!address.city || typeof address.city !== "string" || !address.city.trim())
    return "City is required.";
  if (!address.country || typeof address.country !== "string" || !address.country.trim())
    return "Country is required.";
  return null;
};

export const POST = async (req) => {
  const session = await getSessionFromRequest(req);
  if (!session) return jsonError("Unauthorized.", 401);

  const ip = clientIp(req);
  const quota = AUTH_RATE_LIMITS.write(ip);
  if (!quota.ok) return jsonError("Too many requests. Please try again later.", 429);

  let body;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid request body.", 400);
  }

  const address = body?.address;
  const invalid = validateAddress(address);
  if (invalid) return jsonError(invalid, 422);

  await connectMongodb();
  const user = await UserModel.findById(session.id);
  if (!user) return jsonError("User not found.", 404);

  if (address.isDefault || user.addresses.length === 0) {
    user.addresses.forEach((a) => (a.isDefault = false));
  }
  user.addresses.push(address);
  await user.save();

  return jsonSuccess({ addresses: user.addresses }, "Address added.");
};

export const PATCH = async (req) => {
  const session = await getSessionFromRequest(req);
  if (!session) return jsonError("Unauthorized.", 401);

  let body;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid request body.", 400);
  }

  const index = Number(body?.index);
  const address = body?.address;
  if (!Number.isInteger(index) || index < 0) {
    return jsonError("Invalid address index.", 422);
  }
  const invalid = validateAddress(address);
  if (invalid) return jsonError(invalid, 422);

  await connectMongodb();
  const user = await UserModel.findById(session.id);
  if (!user) return jsonError("User not found.", 404);
  if (!user.addresses[index]) return jsonError("Address not found.", 404);

  if (address.isDefault) {
    user.addresses.forEach((a) => (a.isDefault = false));
  }
  user.addresses[index] = { ...user.addresses[index].toObject(), ...address };
  await user.save();

  return jsonSuccess({ addresses: user.addresses }, "Address updated.");
};

export const DELETE = async (req) => {
  const session = await getSessionFromRequest(req);
  if (!session) return jsonError("Unauthorized.", 401);

  let body;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid request body.", 400);
  }

  const index = Number(body?.index);
  if (!Number.isInteger(index) || index < 0) {
    return jsonError("Invalid address index.", 422);
  }

  await connectMongodb();
  const user = await UserModel.findById(session.id);
  if (!user) return jsonError("User not found.", 404);
  if (!user.addresses[index]) return jsonError("Address not found.", 404);

  user.addresses.splice(index, 1);
  if (user.addresses.length > 0 && !user.addresses.some((a) => a.isDefault)) {
    user.addresses[0].isDefault = true;
  }
  await user.save();

  return jsonSuccess({ addresses: user.addresses }, "Address removed.");
};
