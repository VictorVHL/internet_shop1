module.exports = function (user) {
    user.observe('after save', async (ctx) => {
        const Cart = user.app.models.Cart;
        const cart = await Cart.create({
            userid: ctx.instance.id
        });
    })
}