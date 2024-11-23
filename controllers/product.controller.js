const pool = require('../lib/database.js');
const { authenticate, authorize } = require('../middleware/authMiddleware.js');

class ProductController {

    // Crear un producto
    async createProduct(req, res) {
        if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
            res.writeHead(403, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'No autorizado' }));
            return; 
        }

        const { name, price, image } = req.body;
        if (!name || !price || !image) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Faltan campos obligatorios: name, price, image' }));
            return; 
        }

        try {
            const [result] = await pool.execute(
                'INSERT INTO products (name, price, image) VALUES (?, ?, ?)',
                [name, price, image]
            );
            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Producto creado exitosamente', id: result.insertId }));
        } catch (error) {
            console.error('Error al crear producto:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Error al crear producto' }));
        }
    }

    // Obtener todos los productos
    async getProducts(req, res) {
        try {
            const [products] = await pool.execute('SELECT * FROM products');
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(products));
        } catch (error) {
            console.error('Error al obtener productos:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Error al obtener productos' }));
        }
    }

    // Actualizar un producto
    async updateProduct(req, res) {
        if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
            res.writeHead(403, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'No autorizado' }));
            return;
        }

        const { name } = req.params;
        const { price, image } = req.body;

        if (!price || !image) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Faltan campos obligatorios: price, image' }));
            return;
        }

        try {
            const [result] = await pool.execute(
                'UPDATE products SET price = ?, image = ? WHERE name = ?',
                [price, image, name]
            );

            if (result.affectedRows === 0) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Producto no encontrado' }));
                return;
            }

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Producto actualizado correctamente' }));
        } catch (error) {
            console.error('Error al actualizar producto:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Error al actualizar producto' }));
        }
    }

    // Eliminar un producto
    async deleteProduct(req, res) {
        if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
            res.writeHead(403, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'No autorizado' }));
            return;
        }

        const { name } = req.params;

        try {
            const [result] = await pool.execute('DELETE FROM products WHERE name = ?', [name]);

            if (result.affectedRows === 0) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Producto no encontrado' }));
                return;
            }

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Producto eliminado correctamente' }));
        } catch (error) {
            console.error('Error al eliminar producto:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Error al eliminar producto' }));
        }
    }
}

const productController = new ProductController();
module.exports = { productController };
