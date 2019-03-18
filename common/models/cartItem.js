
module.exports = function (CartItem) {

    CartItem.observe('before save', async (ctx, next) => {
        if (ctx.instance) {
            const Cart = CartItem.app.models.Cart;
            const Product = CartItem.app.models.Product;
            const product = await Product.findById(ctx.instance.productId);
            ctx.instance.totalSum = ctx.instance.quantity * product.price;
            const cart = await Cart.findById(ctx.instance.cartId);
            cart.totalSum += ctx.instance.totalSum;
            await cart.save()
        } else if (ctx.data) {
            const Cart = CartItem.app.models.Cart;
            const Product = CartItem.app.models.Product;
            const product = await Product.findById(ctx.currentInstance.productId);
            const cart = await Cart.findById(ctx.currentInstance.cartId);
            cart.totalSum -= ctx.currentInstance.totalSum;
            ctx.data.totalSum = ctx.data.quantity * product.price;
            cart.totalSum += ctx.data.totalSum;
            await cart.save();
        }
    })






    CartItem.beforeRemote('create', async (ctx) => {
        const Cart = CartItem.app.models.Cart;
        const Product = CartItem.app.models.Product;
        if (ctx.args) {
            const oldCartItem = await CartItem.findOne({
                where: {
                    productId: ctx.args.data.productId,
                    cartId: ctx.args.data.cartId
                }
            });
            const product = await Product.findById(ctx.args.data.productId);
            const cart = await Cart.findById(ctx.args.data.cartId)
            if (oldCartItem) {
                cart.totalSum -= oldCartItem.totalSum;
                oldCartItem.quantity = ctx.args.data.quantity;
                oldCartItem.totalSum = ctx.args.data.quantity * product.price;
                cart.totalSum += oldCartItem.totalSum;
                await oldCartItem.save();
                await cart.save();
                let error = new Error()
                error.status = 500;
                error.message = 'you have such product';
                throw error
            }
        }

    })





    CartItem.observe('before delete', async (ctx) => {
        const cartItem = await CartItem.findById(ctx.where.id)
        const Cart = CartItem.app.models.Cart;
        const cart = await Cart.findById(cartItem.cartId);
        cart.totalSum -= cartItem.totalSum;
        await cart.save()
    })
}




// CartItem.observe('before save', async (ctx, next) => {
//     if (ctx.instance) {
//         createCartItem(ctx)
//     } else if (ctx.data) {
//         changeCartIten(ctx)
//     }
// })

// const createCartItem = async (ctx) => {
//     const Cart = CartItem.app.models.Cart;
//     const Product = CartItem.app.models.Product;
//     const product = await Product.findById(ctx.instance.productId);
//     ctx.instance.totalSum = ctx.instance.quantity * product.price;
//     const cart = await Cart.findById(ctx.instance.cartId);
//     cart.totalSum += ctx.instance.totalSum;
//     await cart.save()
// }

// const changeCartIten = async (ctx) => {
//     const Cart = CartItem.app.models.Cart;
//     const Product = CartItem.app.models.Product;
//     const product = await Product.findById(ctx.currentInstance.productId);
//     const cart = await Cart.findById(ctx.currentInstance.cartId);
//     cart.totalSum -= ctx.currentInstance.totalSum;
//     ctx.data.totalSum = ctx.data.quantity * product.price;
//     cart.totalSum += ctx.data.totalSum;
//     await cart.save();
// }