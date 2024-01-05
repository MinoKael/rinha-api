const Joi = require('joi');
const db = require('./db.js');

const pessoaSchema = Joi.object({
    apelido: Joi.string().max(32).required(),
    nome: Joi.string().max(100).required(),
    nascimento: Joi.string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .required(),
    stack: Joi.alternatives().try(
        Joi.array().items(Joi.string().max(32).required()),
        Joi.allow(null)
    ),
});

const verificarRequisicoes = async (req, res, next) => {
    const { apelido, nome, nascimento } = req.body;

    if (!apelido || !nome || !nascimento) {
        return res.status(422).end();
    }
    const { error } = pessoaSchema.validate(req.body);
    if (error) {
        return res.status(400).end();
    }

    const result = await db.countByApelido(apelido);
    if (result) {
        return res.status(422).end();
    }

    next();
};
module.exports = { verificarRequisicoes };
