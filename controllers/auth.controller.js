require('dotenv').config();
const pool = require('../lib/database');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { JWT_SECRET } = process.env;

class AuthController {
    async register(req, res) {
        const { username, password, role } = req.body;

        if (!username || !password) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ msg: 'Faltan campos obligatorios: username, password' }));
        }

        try {
            // Verificar si el usuario ya existe
            const [existingUser] = await pool.execute('SELECT * FROM users WHERE username = ?', [username]);
            if (existingUser.length > 0) {
                res.writeHead(409, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ msg: 'Usuario ya existe' }));
            }

            // Encriptar la contraseña
            const hashedPassword = await bcrypt.hash(password, 10);

            // Insertar el nuevo usuario
            const [result] = await pool.execute('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [
                username,
                hashedPassword,
                role || 'user', // Si no se proporciona rol, se asigna 'user' por defecto
            ]);

            res.writeHead(201, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ msg: 'Usuario registrado exitosamente', id: result.insertId }));
        } catch (error) {
            console.error('Error en el registro:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ msg: 'Error en el servidor' }));
        }
    }

    async login(req, res) {
        const { username, password } = req.body;

        if (!username || !password) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ msg: 'Faltan campos obligatorios: username, password' }));
        }

        try {
            // Buscar al usuario en la base de datos
            const [user] = await pool.execute('SELECT * FROM users WHERE username = ?', [username]);

            if (user.length === 0) {
                res.writeHead(401, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ msg: 'Usuario o contraseña incorrectos' }));
            }

            // Verificar la contraseña
            const isPasswordValid = await bcrypt.compare(password, user[0].password);

            if (!isPasswordValid) {
                res.writeHead(401, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ msg: 'Usuario o contraseña incorrectos' }));
            }

            // Generar el token JWT
            const token = jwt.sign({ 
                id: user[0].id, 
                username: user[0].username, 
                role: user[0].role 
            }, JWT_SECRET, { expiresIn: '1h' });

            // Actualizar el campo 'last_login' con la fecha y hora actuales
            // Actualizar el campo 'last_login' con la fecha y hora actuales
const currentDateTime = new Date().toISOString().slice(0, 19).replace('T', ' '); // Formato 'YYYY-MM-DD HH:MM:SS'
await pool.execute('UPDATE users SET last_login = ? WHERE id = ?', [currentDateTime, user[0].id]);


            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ msg: 'Login exitoso', token, role: user[0].role }));
        } catch (error) {
            console.error('Error en el login:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ msg: 'Error en el servidor' }));
        }
    }
}

const authController = new AuthController();
module.exports = { authController };
