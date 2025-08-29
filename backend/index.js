const express = require('express');
const { Pool } = require('pg');
const cors = require('cors'); 

const app = express();
const port = 3000;

const pool = new Pool({
  user: 'admin',
  host: 'localhost',
  database: 'desafio_micks',
  password: 'admin123',
  port: 5432,
  ssl: false
});

app.use(cors()); 
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Servidor backend rodando com sucesso 🚀');
});

app.get('/teste-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() as agora');
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao consultar banco' });
  }
});


function calcularPlano({ celulares=0, computadores=0, smart_tvs=0, tv_box=0, outros=0, gamer=false }) {
  const PESOS = {
    celulares: 0.8,
    computadores: 0.5,
    smart_tvs: 0.4,
    tv_box: 0.6,
    outros: 0.1,
  };

  const pesoBase =
    (celulares * PESOS.celulares) +
    (computadores * PESOS.computadores) +
    (smart_tvs * PESOS.smart_tvs) +
    (tv_box * PESOS.tv_box) +
    (outros * PESOS.outros);

  const pesoTotal = gamer ? pesoBase * 2 : pesoBase;

  let plano = 'Prata';
  let velocidade = 100;

  if (pesoTotal < 1.0) {
    plano = 'Prata'; velocidade = 100;
  } else if (pesoTotal >= 1.0 && pesoTotal <= 2.0) {
    plano = 'Bronze'; velocidade = 300;
  } else if (pesoTotal > 2.0 && pesoTotal < 3.0) {
    plano = 'Ouro'; velocidade = 500;
  } else {
    plano = 'Diamante'; velocidade = 800;
  }

  return {
    peso_base: Number(pesoBase.toFixed(2)),
    peso_total: Number(pesoTotal.toFixed(2)),
    gamer: Boolean(gamer),
    plano,
    velocidade_mb: velocidade
  };
}


app.post('/calcular-plano', async (req, res) => {
  try {
    const {
      celulares = 0,
      computadores = 0,
      smart_tvs = 0,
      tv_box = 0,
      outros = 0,
      gamer = false
    } = req.body || {};

    const inputs = [celulares, computadores, smart_tvs, tv_box, outros];
    const algumInvalido = inputs.some(v => typeof v !== 'number' || v < 0 || !Number.isFinite(v));
    if (algumInvalido || typeof gamer !== 'boolean') {
      return res.status(400).json({ error: 'Dados inválidos. Envie números >= 0 e gamer booleano.' });
    }

    const resultado = calcularPlano({ celulares, computadores, smart_tvs, tv_box, outros, gamer });

    await pool.query(
      'INSERT INTO historico_calculos (input, resultado) VALUES ($1, $2)',
      [req.body, resultado]
    );

    return res.json({
      input: { celulares, computadores, smart_tvs, tv_box, outros, gamer },
      resultado
    });
  } catch (err) {
    console.error('Erro em /calcular-plano:', err);
    return res.status(500).json({ error: 'Erro ao calcular plano' });
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
