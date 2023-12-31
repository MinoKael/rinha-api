const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { Pool } = require('pg');
const cluster = require('cluster');
const db = require('./db.js');

const app = express();
app.use(express.json());

if (cluster.isMaster) {
    const numCPUs = process.env.CLUSTER_WORKERS || 1;

    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(
            `Worker ${worker.process.pid} died, with code ${code} and signal ${signal}`
        );
    });
} else {
    const verificarRequisicoes = async (req, res, next) => {
        const { apelido, nome, nascimento, stack } = req.body;
        if (!apelido || !nome || !nascimento) {
            return res.status(422).end();
        }
        if (typeof nome === 'number') {
            return res.status(400).end();
        }
        if (
            stack &&
            (!Array.isArray(stack) ||
                stack.some((item) => typeof item !== 'string'))
        ) {
            return res.status(400).end();
        }
        const regexData = /^\d{4}-\d{2}-\d{2}$/;
        if (!regexData.test(nascimento)) {
            return res.status(400).end();
        }
        const result = await db.countByApelido(apelido);
        if (result > 0) {
            return res.status(422).end();
        }

        next();
    };
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
        try {
            const result = await db.insertPessoa(pessoa);
            if (result.rowCount === 0) {
                res.status(422).end();
            }
            res.status(201).location(`/pessoas/${id}`).end();
        } catch (_) {
            res.status(422).end();
        }
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

    app.listen(process.env.PORT, () => {
        console.log(
            `main.js:${process.pid}: Listening on port ${process.env.PORT}`
        );
    });
}
