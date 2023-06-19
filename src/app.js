import express from 'express';
import handlebars from 'express-handlebars';
import { Server } from 'socket.io';
import registerChatHandler from './listeners/chatHandlers.js';
import socketProducts from './listeners/socketProducts.js';

import routerCart from './routers/carts.Router.js';
import routerProduct from './routers/products.router.js';
import routerView from './routers/views.router.js';
import {authrouter} from './routers/auth.router.js';


import connectToDB from './config/configServer.js';
import __dirname, { isAdmin } from './utils.js';

import MongoStore from "connect-mongo"

import session from 'express-session';




const app = express();
const PORT = process.env.PORT || 8080

app.use(express.static(`${__dirname}/public`));

app.use(
    session({
      store: MongoStore.create({ mongoUrl: 'mongodb+srv://riveroslucas07:xoUHYq5jW5OJjiWR@ecommerce.36h98by.mongodb.net/ecommerce?retryWrites=true&w=majority', ttl: 7200 }),
      secret: 'un-re-secreto',
      resave: true,
      saveUninitialized: true,
    })
  );
    
// app.get('login'), (req,res) =>{
//     const {username, password} = req.query;
//     if (username !== 'admin@coder' || password !== 'coder'){
//         return res.send ('login failed');
//     }
//     req.session.user = username
//     req.session.admin = true;
//     res.send('login success!')
// }

// app.get('/logout', (req,res) =>{
//     req.session.destroy((err) =>{
//         if (err){
//             return res.json ({status: 'Logout ERROR', body: err})
//         }
//         res.send( 'Logout Ok');
//     }
// )
// });

// app.get('/session', (req,res)=>{
//     if (req.session.cont){
//         console.log(req.session, req.sessionID);
//         res.session.cont++;
//         res.send('nos visitaste' + req.session.cont);
//         }else{
//             req.session.cont = 1;
//             res.send('nos visitaste' + 1);
//         }
//     }
// )
// app.use(cookieParser('secret-code-4040402030'));

// app.use('/api/set-cookies', (req,res) =>{

//     res.cookie('isAdmin', false, { masAge: 1000000000, signed:true });
//     return res.status(200).json({
//         status: 'error',
//         msg: 'te entraron los cookies',
//         data: {}
//     })
// })
// app.use('/api/get-cookies', (req,res) =>{
//     console.log('normales', req.cookies)
//     console.log('firmadas', req.signedCookies)
//     return res.status(200).json({
//         status: 'ok',
//         msg: 'ver consola',
//         data: {}
//     })
// })

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.engine('handlebars', handlebars.engine());
app.set('views', `${__dirname}/views`);
app.set('view engine', 'handlebars');
app.use('/auth', authrouter)

app.use('/api/products' ,routerProduct)
app.use('/api/carts', routerCart)
app.use('/', routerView);

connectToDB()

const httpServer = app.listen(PORT, () => {
    try {
        console.log(`Listening to the port ${PORT}\nAcceder a:`);
        console.log(`\t1). http://localhost:${PORT}/products`)
        console.log(`\t2). http://localhost:${PORT}/carts/646df484d31949d4081c72eb`);
    }
    catch (err) {
        console.log(err);
    }
});

const io = new Server(httpServer)

socketProducts(io)

io.on('connection',socket=>{
    registerChatHandler(io,socket);
})