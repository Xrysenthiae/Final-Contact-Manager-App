const COUCHDB_URL = process.env.COUCHDB_URL || 'http://eileen:1234567@localhost:5984';
const nano = require("nano")(COUCHDB_URL);

const databases = ["_users", "_replicator", "users", "contacts"];

async function ensureDatabaseExists(dbName) {
  try {
    const dbList = await nano.db.list();
    if (!dbList.includes(dbName)) {
      await nano.db.create(dbName);
      console.log(`Database '${dbName}' created.`);
    } else {
      console.log(`Database '${dbName}' already exists.`);
    }
  } catch (error) {
    console.error(`Error Ensuring Database '${dbName}':`, error);
  }
}

(async () => {
  await Promise.all(databases.map(ensureDatabaseExists));
})();

const _usersDb = nano.db.use('_users');
const _replicatorDb = nano.db.use('_replicator');
const usersDb = nano.db.use('users');
const contactsDb = nano.db.use('contacts');

module.exports = { _usersDb, _replicatorDb, usersDb, contactsDb };
