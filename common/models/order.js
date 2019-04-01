module.exports = function (Order) {
  Order.makeOrder = async (userId) => {
    const Cart = Order.app.models.Cart;
    const CartItem = Order.app.models.CartItem;
    const User = Order.app.models.user;

    const cart = await Cart.findOne({ where: { userId: userId } });
    const user = await User.findById(userId);
    const cartItem = await CartItem.find({ where: { cartId: cart.id } });

    const order = await Order.create({
      totalSum: cart.totalSum,
      ownerId: userId
    });

    for (let value of cartItem) {
      value.orderId = order.id;
      value.cartId = null;
      await value.save();
    }

    await Order.app.models.Email.send({
      to: 'vchernyuk@gmail.com',
      from: 'vitia@gmail.com',
      subject: 'Thenk you for your order',
      text: 'my text',
      html: `<p>Hello ${user.username}. Thanks for buying in our shop.
       TotalSum of you order is ${order.totalSum}</p>`
    }, (err) => {
      if (err) {
        console.log(err);
        return console.log('error sending result order on mail');
      }
      console.log('email send');
    });

    return await Order.find({
      where: { id: order.id },
      include: { relation: 'cartItems',
        scope: { include: 'product' } } });
  };

  Order.remoteMethod('makeOrder', {
    description: 'make order',
    accepts: { arg: 'userId', type: 'String', required: true },
    returns: { arg: 'order', type: 'Order' },
    http: { verb: 'post' }
  });
};