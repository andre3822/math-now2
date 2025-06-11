const { Pool } = require('pg');

const connectionString = 'postgresql://neondb_owner:npg_LJ4xZ0RFvEPN@ep-soft-bush-acw4828v-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require';

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.connect()
  .then(client => {
    console.log('Banco de dados conectado com sucesso!');
    client.release();
  })
  .catch(err => {
    console.error('Erro ao conectar ao banco de dados:', err.message);
  });

module.exports = pool;