const { productController } = require('../controllers/product.controller');
const { authController } = require('../controllers/auth.controller');
const { userController } = require('../controllers/user.controller');
const { authenticate, authorize } = require('../middleware/authMiddleware');

class IndexRoutes {
    routes = [
        // Rutas de autenticación
        { method: 'post', path: '/register', controller: authController.register },
        { method: 'post', path: '/login', controller: authController.login },

        // Rutas de usuario
        { 
            method: 'get', 
            path: '/user/data', 
            controller: userController.getUserData, 
            middlewares: [authenticate, authorize(['user', 'admin', 'superadmin'])] 
        },


        // Rutas de productos (protegidas por authenticate y authorize)
        { 
            method: 'get', 
            path: '/products', 
            controller: productController.getProducts 
        },
        { 
            method: 'post', 
            path: '/products', 
            controller: productController.createProduct, 
            middlewares: [authenticate, authorize(['admin', 'superadmin'])]
        },
        { 
            method: 'put', 
            path: '/products/:name', 
            controller: productController.updateProduct, 
            middlewares: [authenticate, authorize(['admin', 'superadmin'])]
        },
        { 
            method: 'delete', 
            path: '/products/:name', 
            controller: productController.deleteProduct, 
            middlewares: [authenticate, authorize(['admin', 'superadmin'])]
        },

        // Rutas para usuarios (solo superadmin puede acceder)
        { 
            method: 'get', 
            path: '/users', 
            controller: userController.getAllUsers, 
            middlewares: [authenticate, authorize(['superadmin'])] 
        },
        { 
            method: 'delete', 
            path: '/users/:username', 
            controller: userController.deleteUser, 
            middlewares: [authenticate, authorize(['superadmin'])] 
        },
    ]
}

const indexRoutes = new IndexRoutes();
module.exports = { indexRoutes };
