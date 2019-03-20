module.exports = function (Product) {
    Product.observe('before save', async (ctx, next) => {
        if (ctx.data) {
            const CartItem = Product.app.models.CartItem;
            const Cart = Product.app.models.Cart;
            const productId = ctx.currentInstance.id
            const cartitem = await CartItem.find({ where: { productId } });
            for(let value of cartitem){
            let cart = await Cart.findById(value.cartId)
            cart.totalSum -= value.totalSum;
            value.totalSum = value.quantity * ctx.data.price;
            cart.totalSum += value.totalSum;
            await cart.save();
            await value.save();    
            }  
        }
    })
}