const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = 5000;

// Configuração do middleware
app.use(cors());
app.use(bodyParser.json());

// Configuração do banco de dados
const pool = new Pool({
    user: 'seu_usuario', // substitua pelo seu usuário do PostgreSQL
    host: 'localhost',
    database: 'seu_banco_de_dados', // substitua pelo seu banco de dados
    password: 'sua_senha', // substitua pela sua senha
    port: 5432,
});

// Rota para listar todos os contatos
app.get('/contatos', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM contatos');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar contatos' });
    }
});

// Rota para cadastrar um novo contato
app.post('/contatos', async (req, res) => {
    const { nome, telefone, email, endereco, grupo } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO contatos (nome, telefone, email, endereco, grupo) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [nome, telefone, email, endereco, grupo]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao adicionar contato' });
    }
});

// Rota para buscar contato por ID
app.get('/contatos/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM contatos WHERE id = $1', [id]);
        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ error: 'Contato não encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar contato' });
    }
});

// Rota para atualizar um contato
app.put('/contatos/:id', async (req, res) => {
    const { id } = req.params;
    const { nome, telefone, email, endereco, grupo } = req.body;
    try {
        const result = await pool.query(
            'UPDATE contatos SET nome = $1, telefone = $2, email = $3, endereco = $4, grupo = $5 WHERE id = $6 RETURNING *',
            [nome, telefone, email, endereco, grupo, id]
        );
        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ error: 'Contato não encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar contato' });
    }
});

// Rota para excluir um contato
app.delete('/contatos/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM contatos WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length > 0) {
            res.json({ message: 'Contato excluído com sucesso' });
        } else {
            res.status(404).json({ error: 'Contato não encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Erro ao excluir contato' });
    }
});

// Iniciar o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});