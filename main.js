const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('./db.js');
const { verificarRequisicoes } = require('./validationMiddleware');

const app = express();
app.use(express.json());

app.post('/pessoas', verificarRequisicoes, async (req, res) => {
    const { apelido, nome, nascimento, stack } = req.body;
    const id = uuidv4();
    const pessoa = {
        id,
        apelido,
        nome,
        nascimento,
        stack: JSON.stringify(stack),
    };

    const result = await db.insertPessoa(pessoa);
    if (result.rowCount === 0) {
        return res.status(422).end();
    }
    return res.status(201).location(`/pessoas/${id}`).end();
});

app.get('/pessoas/:id', async (req, res) => {
    const id = req.params.id;
    const result = await db.getById(id);
    if (result.length === 0) {
        return res.status(404).end();
    }
    return res.status(200).json(result).end();
});

app.get('/pessoas', async (req, res) => {
    const t = req.query.t;
    if (!t) {
        return res.status(400).end();
    }
    const result = await db.getByTermo(t);
    return res.status(200).json(result).end();
});
app.get('/contagem-pessoas', async (_, res) => {
    const count = await db.countPessoas();
    return res.status(200).send(count).end();
});

app.listen(process.env.PORT || 3000, () => {
    console.log(
        `main.js:${process.pid}: Listening on port ${process.env.PORT}`
    );
});
