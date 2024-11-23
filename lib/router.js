const { URL } = require('url');

class Router {
    _routes = [];
    _baseUrl = 'http://localhost:' + (process.env.PORT || 5000);

    constructor() {}

    use(url, callback) {
        const _url = new URL(url, this._baseUrl).pathname;
        let basePath = _url.replace(/^\/+|\/+$/g, '');
        
        callback.routes.forEach((route) => {
            let method = route.method;
            let controller = route.controller;
            let path = '/' + basePath;
            let params = [];
            route.path.split('/').forEach((p, i) => {
                if (p) {
                    let key = p.split(':')[1];
                    if (key) {
                        params[i + 1] = key;
                        path += '/([0-9a-z]+)';
                    } else {
                        path += '/' + p;
                    }
                }
            });
            path = new RegExp(path + '$');
            this._routes.push({ path, method, controller, params, middlewares: route.middlewares });
        });
    }

    async route(req, res) {
        const url = new URL(req.url, this._baseUrl);
        const method = req.method.toLowerCase();

        // Habilitar CORS para todas las solicitudes
        res.setHeader('Access-Control-Allow-Origin', '*'); // Permitir solicitudes desde cualquier origen
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        
        // Si la solicitud es OPTIONS (pre-solicitud CORS)
        if (method === 'options') {
            res.writeHead(200);
            return res.end();
        }

        const route = this._routes.find((route) => {
            const methodMatch = route.method === method;
            const pathMatch = url.pathname.match(route.path);
            return pathMatch && methodMatch;
        });

        if (route) {
            req.query = await this.getQuery(url);
            req.params = await this.getParams(url.pathname, route.params);

            if (route.middlewares) {
                for (let middleware of route.middlewares) {
                    const next = () => {};
                    await middleware(req, res, next);
                }
            }

            req.body = '';
            if (method === 'post' || method === 'put' || method === 'patch') {
                req.on('data', chunk => {
                    req.body += chunk;
                });
                req.on('end', () => {
                    try {
                        req.body = JSON.parse(req.body); 
                    } catch (e) {
                        console.error('Error al parsear JSON:', e);
                        req.body = null;
                    }
                    route.controller(req, res); 
                });
            } else {
                route.controller(req, res);
            }
        } else {
            this.notFound(res);
        }
    }

    notFound(res) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Ruta no encontrada' }));
    }

    getQuery(uri) {
        let query = {};
        for (const name of uri.searchParams.keys()) {
            query[name] = uri.searchParams.get(name);
        }
        return query;
    }

    getParams(pathname, params) {
        let objParams = {};
        params.forEach((p, i) => {
            if (p) {
                objParams[p] = pathname.split('/')[i];
            }
        });
        return objParams;
    }
}

const router = new Router();
module.exports = { router };