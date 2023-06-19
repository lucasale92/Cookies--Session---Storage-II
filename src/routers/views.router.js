import { Router } from "express";
import ProductManager from "../DAO/mongo/managers/products.js";
import CartManager from "../DAO/mongo/managers/carts.js";
const routerView = Router();
const productmanager = new ProductManager()
const cartmanager = new CartManager()

let cart = []

routerView.get('/', async (req, res) => {
    try {
        // Productos 
        const products = await productmanager.getProductsView();

        res.render("index", { valueReturned: products })
    }
    catch (err) {
        console.log(err);
    }

})

routerView.use('/realTimeProducts', (req, res) => {

    res.render('realTimeProducts', {})
})


routerView.get('/chat', async (req, res) => {
    res.render('chat');
})

routerView.get('/products', async (req, res) => {
    try {

        let { limit, page, sort, category } = req.query


        const options = {
            page: Number(page) || 1,
            limit: Number(limit) || 10,
            sort: { price: Number(sort) },
            lean: true
        };

        if (!(options.sort.price === -1 || options.sort.price === 1)) {
            delete options.sort
        }


        const links = (products) => {
            let prevLink;
            let nextLink;
            if (req.originalUrl.includes('page')) {
                prevLink = products.hasPrevPage ? req.originalUrl.replace(`page=${products.page}`, `page=${products.prevPage}`) : null;
                nextLink = products.hasNextPage ? req.originalUrl.replace(`page=${products.page}`, `page=${products.nextPage}`) : null;
                return { prevLink, nextLink };
            }
            if (!req.originalUrl.includes('?')) {
                prevLink = products.hasPrevPage ? req.originalUrl.concat(`?page=${products.prevPage}`) : null;
                nextLink = products.hasNextPage ? req.originalUrl.concat(`?page=${products.nextPage}`) : null;
                return { prevLink, nextLink };
            }
            prevLink = products.hasPrevPage ? req.originalUrl.concat(`&page=${products.prevPage}`) : null;
            nextLink = products.hasNextPage ? req.originalUrl.concat(`&page=${products.nextPage}`) : null;
            return { prevLink, nextLink };

        }

        // Devuelve un array con las categorias disponibles y compara con la query "category"
        const categories = await productmanager.categories()

        const result = categories.some(categ => categ === category)
        if (result) {

            const products = await productmanager.getProducts({ category }, options);
            const { prevLink, nextLink } = links(products);
            const { totalPages, prevPage, nextPage, hasNextPage, hasPrevPage, docs, page } = products

            if (page > totalPages) return res.render('notFound', { pageNotFound: '/products' })

            return res.render('products', { products: docs, totalPages, prevPage, nextPage, hasNextPage, hasPrevPage, prevLink, nextLink, page, cart: cart.length });
        }

        const products = await productmanager.getProducts({}, options);

        const { totalPages, prevPage, nextPage, hasNextPage, hasPrevPage, docs } = products
        const { prevLink, nextLink } = links(products);

        if (page > totalPages) return res.render('notFound', { pageNotFound: '/products' })

        return res.render('products', { products: docs, totalPages, prevPage, nextPage, hasNextPage, hasPrevPage, prevLink, nextLink, page, cart: cart.length });
    } catch (error) {
        console.log(error);
    }
})

routerView.get('/products/inCart', async (req, res) => {

    const productsInCart = await Promise.all(cart.map(async (product) => {
        const productDB = await productmanager.getProductById(product._id);
        return { title: productDB.title, quantity: product.quantity }
    }))

    return res.send({ cartLength: cart.length, productsInCart })
})

routerView.post('/products', async (req, res) => {
    try {
        const { product, finishBuy } = req.body

        if (product) {
            if (product.quantity > 0) {
                const findId = cart.findIndex(productCart => productCart._id === product._id);
                (findId !== -1) ? cart[findId].quantity += product.quantity : cart.push(product)
            }
            else {
                return res.render('products', { message: 'Quantity must be greater than 0' })
            }
        }
        if (finishBuy) {
            await cartmanager.addCart(cart)
            cart.splice(0, cart.length)
        }

        return res.render('products')
    } catch (error) {
        console.log(error);
    }
})

routerView.get('/carts/:cid', async (req, res) => {
    try {
        const { cid } = req.params

        const result = await cartmanager.getCartById(cid)

        if(result === null || typeof(result) === 'string') return res.render('cart', { result: false, message: 'ID not found' });

        return res.render('cart', { result });


    } catch (err) {
        console.log(err);
    }

})

routerView.get('/register', (req, res) =>{
    res.render('register')
})

export default routerView