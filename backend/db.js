const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Cria tabelas se não existirem
const fs = require('fs');
const schema = fs.readFileSync(path.resolve(__dirname, 'schema.sql'), 'utf8');
db.exec(schema, (err) => {
  if (err) console.error('Erro ao criar schema:', err);
  else console.log('📦 Banco SQLite inicializado com sucesso.');
});

module.exports = db;
