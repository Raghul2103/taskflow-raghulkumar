export const up = async (db) => {
  await db.createCollection('projects');
};

export const down = async (db) => {
  await db.collection('projects').drop();
};
