export const up = async (db) => {
  await db.createCollection('tasks');
};

export const down = async (db) => {
  await db.collection('tasks').drop();
};
