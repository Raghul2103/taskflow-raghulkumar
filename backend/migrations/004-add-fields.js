export const up = async (db) => {
  await db.collection('projects').updateMany(
    { deadline: { $exists: false } },
    { $set: { deadline: null } }
  );
};

export const down = async (db) => {
  await db.collection('projects').updateMany(
    {},
    { $unset: { deadline: "" } }
  );
};
