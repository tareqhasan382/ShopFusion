import { destroySession } from "../../../../../lib/auth";
import { jsonSuccess } from "../../../../../lib/apiResponse";

export const POST = async () => {
  destroySession();
  return jsonSuccess({}, "Signed out successfully.");
};
