const http = require('http');
const { indexRoutes } = require('./routes/index.routes.js');
const { router } = require('./lib/router')



class Server {
    PORT = process.env.PORT || 5000
    server;
    registeredRoutes = []

    constructor() {
        this.routes()
    }

    
    routes() {
        router.use('/api', indexRoutes)
    }



    start() {
        this.server = http.createServer((request, response) => {
            if (request) router.route(request, response)
        })
        this.server.listen(this.PORT, () => {
            console.log("Servidor en el puerto " + this.PORT)
        })
    }


}
const server = new Server();
server.start()