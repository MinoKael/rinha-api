const { Pool } = require('pg');
const pool = new Pool({
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    max: process.env.DB_POOL || 200,
});

async function insertPessoa(pessoa) {
    const client = await pool.connect();
    const query =
        'INSERT INTO PESSOAS (ID,APELIDO,NOME,NASCIMENTO,STACK) VALUES ($1, $2, $3, $4, $5::json) ON CONFLICT DO NOTHING;';
    const values = [
        pessoa.id,
        pessoa.apelido,
        pessoa.nome,
        pessoa.nascimento,
        JSON.stringify(pessoa.stack),
    ];
    const res = await client.query(query, values);
    client.release();
    return res;
}

async function getById(id) {
    const client = await pool.connect();
    const query =
        'SELECT ID,APELIDO,NOME,NASCIMENTO,STACK FROM PESSOAS WHERE ID = $1;';
    const res = await client.query(query, [id]);
    client.release();
    return res.rows;
}

async function getByTermo(termo) {
    const client = await pool.connect();
    const query = `SELECT ID,APELIDO,NOME,NASCIMENTO,STACK FROM PESSOAS WHERE BUSCA_TRGM ILIKE $1 LIMIT 50;`;
    const values = [`%${termo}%`];
    const res = await client.query(query, values);
    client.release();
    return res;
}
async function countByApelido(apelido) {
    const client = await pool.connect();
    const query = 'SELECT COUNT(1) > 0 FROM PESSOAS WHERE APELIDO = $1;';
    const values = [apelido];
    const res = await client.query(query, values);
    client.release();
    return res.rows[0]['?column?'];
}
async function countPessoas() {
    const client = await pool.connect();
    const res = await client.query('SELECT COUNT(1) FROM PESSOAS;');
    client.release();
    return res.rows[0];
}
module.exports = {
    insertPessoa,
    getById,
    getByTermo,
    countByApelido,
    countPessoas,
};
