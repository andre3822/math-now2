const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_LJ4xZ0RFvEPN@ep-soft-bush-acw4828v-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require',
  ssl: {
    rejectUnauthorized: false,
  },
});

app.post('/enviar-pontuacao', async (req, res) => {
  const { nome, pontos } = req.body;

  if (!nome || typeof nome !== 'string' || nome.trim().includes(" ")) {
    return res.status(400).json({ erro: "Nome inválido" });
  }

  try {
    const existe = await pool.query('SELECT 1 FROM ranking WHERE nome = $1', [nome]);

    if (existe.rowCount > 0) {
      return res.status(400).json({ erro: "Nome já existe" });
    }

    await pool.query('INSERT INTO ranking (nome, pontos) VALUES ($1, $2)', [nome, pontos]);
    res.status(200).json({ sucesso: true });
  } catch (err) {
    console.error("Erro ao salvar pontuação:", err);
    res.status(500).json({ erro: "Erro ao salvar pontuação" });
  }
});

app.post('/forcar-pontuacao', async (req, res) => {
  const { nome, pontos, senha } = req.body;

  if (senha !== '02102008@Firpo') {
    return res.status(403).json({ erro: "Senha inválida" });
  }

  try {
    const existe = await pool.query('SELECT 1 FROM ranking WHERE nome = $1', [nome]);

    if (existe.rowCount > 0) {
      await pool.query('UPDATE ranking SET pontos = $1 WHERE nome = $2', [pontos, nome]);
    } else {
      await pool.query('INSERT INTO ranking (nome, pontos) VALUES ($1, $2)', [nome, pontos]);
    }

    res.status(200).json({ sucesso: true });
  } catch (err) {
    console.error("Erro ao forçar pontuação:", err);
    res.status(500).json({ erro: "Erro ao forçar pontuação" });
  }
});

app.get('/ranking', async (req, res) => {
  try {
    const resultado = await pool.query(
      'SELECT nome, pontos FROM ranking ORDER BY pontos DESC LIMIT 20'
    );
    res.status(200).json(resultado.rows);
  } catch (err) {
    console.error("Erro ao buscar ranking:", err);
    res.status(500).json({ erro: "Erro ao buscar ranking" });
  }
});

app.get('/api/jogadores', async (req, res) => {
  try {
    const resultado = await pool.query('SELECT id, nome, pontos AS pontuacao FROM ranking ORDER BY id');
    res.json(resultado.rows);
  } catch (err) {
    console.error("Erro ao buscar jogadores:", err);
    res.status(500).json({ erro: 'Erro ao buscar jogadores' });
  }
});

app.delete('/api/jogadores/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM ranking WHERE id = $1', [id]);
    res.sendStatus(200);
  } catch (err) {
    console.error("Erro ao remover jogador:", err);
    res.status(500).json({ erro: 'Erro ao remover jogador' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));