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
    const existe = await pool.query('SELECT * FROM ranking WHERE nome = $1', [nome]);
    if (existe.rows.length > 0) {
      return res.status(400).json({ erro: "Nome já existe" });
    }

    await pool.query('INSERT INTO ranking (nome, pontos) VALUES ($1, $2)', [nome, pontos]);
    res.status(200).json({ sucesso: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao salvar" });
  }
});

app.post('/forcar-pontuacao', async (req, res) => {
  const { nome, pontos, senha } = req.body;

  if (senha !== "38224628a") {
    return res.status(403).json({ sucesso: false, erro: "Senha inválida" });
  }

  try {
    const existe = await pool.query('SELECT * FROM ranking WHERE nome = $1', [nome]);

    if (existe.rows.length > 0) {
      await pool.query('UPDATE ranking SET pontos = $1 WHERE nome = $2', [pontos, nome]);
    } else {
      await pool.query('INSERT INTO ranking (nome, pontos) VALUES ($1, $2)', [nome, pontos]);
    }

    res.status(200).json({ sucesso: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao forçar pontuação" });
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

app.listen(3000, () => console.log('Servidor rodando na porta 3000'));