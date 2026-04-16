export const up = async (db) => {
  await db.createCollection('users');
};

export const down = async (db) => {
  await db.collection('users').drop();
};
