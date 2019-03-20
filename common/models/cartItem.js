
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



    CartItem.observe('before delete', async (ctx) => {
        const cartItem = await CartItem.findById(ctx.where.id)
        const Cart = CartItem.app.models.Cart;
        const cart = await Cart.findById(cartItem.cartId);
        cart.totalSum -= cartItem.totalSum;
        await cart.save()
    })





    CartItem.createCartItemOrChangeCurrent = async (productId, cartId, quantity) => {
        const Cart = CartItem.app.models.Cart;
        const Product = CartItem.app.models.Product;
        const oldCartItem = await CartItem.findOne({
            where: {
                productId: productId,
                cartId: cartId,
            }
        });
        const product = await Product.findById(productId);
        const cart = await Cart.findById(cartId)
        if (oldCartItem) {
            cart.totalSum -= oldCartItem.totalSum;
            oldCartItem.quantity += quantity;
            oldCartItem.totalSum = oldCartItem.quantity * product.price;
            cart.totalSum += oldCartItem.totalSum;
            await oldCartItem.save();
            await cart.save();
         }  else {
             let totalSum = product.price * quantity;
             await CartItem.create({
                 productId: productId,
                 cartId: cartId,
                 quantity: quantity,
                 totalSum: totalSum
             })
             cart.totalSum += totalSum
         }
      
    }

    CartItem.remoteMethod('createCartItemOrChangeCurrent', {
        description: 'create cartItem or changing cartItem',
        accepts: [
            { arg: 'productId', type: 'String', required: true },
            { arg: 'cartId', type: 'String', required: true },
            { arg: 'quantity', type: 'Number', required: true }
        ],
        returns: { arg: 'cartItem', type: 'array' },
        http: { verb: 'post' }
    });
}





