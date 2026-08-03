import { getSessionFromRequest } from "../../../../../lib/auth";
import { jsonSuccess } from "../../../../../lib/apiResponse";

export const GET = async (req) => {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return jsonSuccess({ user: null }, "Not signed in.");
  }
  return jsonSuccess({
    user: {
      id: session.id,
      name: session.name,
      email: session.email,
      role: session.role,
    },
  });
};
