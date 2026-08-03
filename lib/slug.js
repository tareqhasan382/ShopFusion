/** Slugify a string into a URL-safe slug. */
export const slugify = (value = "") =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u0980-\u09FF]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120) || "item";

/**
 * Ensure a unique slug for a model. Appends a numeric suffix when the base
 * slug already exists (excluding the given _id).
 *
 * @param {Model} Model - a mongoose model
 * @param {string} base - the desired slug
 * @param {string} [excludeId] - document _id to exclude from the uniqueness check
 */
export const uniqueSlug = async (Model, base, excludeId = null) => {
  const slug = slugify(base);
  let candidate = slug;
  let suffix = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const filter = { slug: candidate };
    if (excludeId) filter._id = { $ne: excludeId };
    const existing = await Model.findOne(filter).select("_id").lean();
    if (!existing) return candidate;
    suffix += 1;
    candidate = `${slug}-${suffix}`;
  }
};
