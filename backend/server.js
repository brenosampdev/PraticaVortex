const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// 🔐 hash simples (mock)
function hashPass(pwd) {
  return 'h|' + Buffer.from(pwd).toString('base64');
}

// 📌 POST /register
app.post('/register', (req, res) => {
  const { name, email, password, ref } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Campos obrigatórios faltando.' });
  }

  const id = crypto.randomUUID();
  const referral_code = Math.random().toString(36).slice(2, 8).toUpperCase();
  const password_hash = hashPass(password);

  db.serialize(() => {
    db.run(
      `INSERT INTO users (id, name, email, password_hash, referral_code) VALUES (?, ?, ?, ?, ?)`,
      [id, name, email.toLowerCase(), password_hash, referral_code],
      function (err) {
        if (err) {
          if (err.message.includes('UNIQUE')) {
            return res.status(400).json({ error: 'Email já cadastrado' });
          }
          console.error(err);
          return res.status(500).json({ error: 'Erro no cadastro' });
        }

        // Se veio código de referência
        if (ref) {
          db.get(`SELECT * FROM users WHERE referral_code = ?`, [ref], (err, refUser) => {
            if (refUser) {
              db.run(
                `UPDATE users SET points = points + 1 WHERE id = ?`,
                [refUser.id]
              );
            }
          });
        }

        return res.json({
          id,
          name,
          email,
          referral_code,
          points: 0,
        });
      }
    );
  });
});

// 📌 POST /login
app.post('/login', (req, res) => {
  const { identifier, password } = req.body;
  const passHash = hashPass(password);

  db.get(
    `SELECT * FROM users WHERE (email = ? OR name = ?) AND password_hash = ?`,
    [identifier.toLowerCase(), identifier, passHash],
    (err, user) => {
      if (err) return res.status(500).json({ error: 'Erro interno' });
      if (!user) return res.status(401).json({ error: 'Credenciais inválidas' });

      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        referral_code: user.referral_code,
        points: user.points,
      });
    }
  );
});

// 📌 GET /me/:id
app.get('/me/:id', (req, res) => {
  const { id } = req.params;
  db.get(`SELECT * FROM users WHERE id = ?`, [id], (err, user) => {
    if (err) return res.status(500).json({ error: 'Erro interno' });
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
    res.json(user);
  });
});

// 🚀 Start
const PORT = 3000;
app.listen(PORT, () => console.log(`🌐 API rodando em http://localhost:${PORT}`));
