module.exports = function (Product) {
    Product.observe('before save', async (ctx, next) => {
        if (ctx.data && ctx.data.price) {
            ctx.hookState.changedPrice = true
        }
    })

    Product.observe('after save', async (ctx, next) => {
        if(ctx.hookState.changedPrice){
            const CartItem = Product.app.models.CartItem;
            const Cart = Product.app.models.Cart;
            const productId = ctx.instance.id
            const cartitem = await CartItem.find({ where: { productId } });
            for(let i = 0; i < cartitem.length; i++){
                let value = cartitem[i]
                let cart = await Cart.findById(value.cartId)
                cart.totalSum -= value.totalSum;
                value.totalSum =  value.quantity * ctx.instance.price;
                cart.totalSum += value.totalSum;
                await value.save();
                await cart.save(); 
            } 
        }
    })
}