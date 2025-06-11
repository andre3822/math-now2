const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_LJ4xZ0RFvEPN@ep-soft-bush-acw4828v-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require',
});

app.post('/enviar-pontuacao', async (req, res) => {
  const { nome, pontos } = req.body;
  if (!nome || nome.includes(" ")) return res.status(400).json({ erro: "Nome inválido" });

  try {
    await pool.query('INSERT INTO ranking (nome, pontos) VALUES ($1, $2)', [nome, pontos]);
    res.status(200).json({ sucesso: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao salvar" });
  }
});

app.get('/ranking', async (req, res) => {
  try {
    const resultado = await pool.query('SELECT nome, pontos FROM ranking ORDER BY pontos DESC LIMIT 20');
    res.status(200).json(resultado.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao buscar ranking" });
  }
});

app.listen(3000, () => console.log('Servidor rodando na porta 5432'));