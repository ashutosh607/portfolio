export const reorder = (Model) => async (req, res) => {
  const items = req.body.items;
  if (
    !Array.isArray(items) ||
    !items.length ||
    items.some((x) => !x || typeof (x.slug ?? x.id) !== 'string' || !Number.isSafeInteger(x.order)) ||
    new Set(items.map((x) => x.slug ?? x.id)).size !== items.length ||
    new Set(items.map((x) => x.order)).size !== items.length
  )
    return res.status(400).json({ message: 'Provide unique identifiers and integer positions.' });
  await Model.db.transaction(async (session) => {
    const result = await Model.bulkWrite(
      items.map((x) => ({
        updateOne: { filter: { slug: x.slug ?? x.id }, update: { $set: { order: x.order } } },
      })),
      { session },
    );
    if (result.matchedCount !== items.length)
      throw Object.assign(new Error('One or more records no longer exist.'), { status: 409 });
  });
  res.json({ success: true });
};
