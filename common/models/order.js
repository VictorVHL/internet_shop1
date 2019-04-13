module.exports = function (Order) {
  Order.makeOrder = async (userId) => {
    const Cart = Order.app.models.Cart;
    const CartItem = Order.app.models.CartItem;
    const User = Order.app.models.user;

    const cart = await Cart.findOne({ where: { userId: userId } });
    const user = await User.findById(userId);
    const cartItem = await CartItem.find({ where: { cartId: cart.id }, include: { relation: 'product' } });

    let month = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
      'August', 'September', 'October', 'November', 'December'];

    let data = '';

    for (let i = 0; i < month.length; i++) {
      if (i === new Date().getMonth()) {
        data = `${new Date().getDate()} ${month[i]} ${new Date().getFullYear()}`;
        break;
      };
    };

    const order = await Order.create({
      data: data,
      totalSum: cart.totalSum,
      ownerId: userId
    });

    await Order.app.models.Email.send({
      to: 'vchernyuk987@gmail.com',
      from: 'vitia@gmail.com',
      subject: 'Thenk you for your order',
      text: 'my text',
      html:
       `<div style="border: 1px solid grey; width: 40%; margin: 0 auto">
      <div style="display:flex;  justify-content: space-around">
      <p style="margin: 0;margin-left: 12px;margin-right: 65%; color: black">Order № 5</p>
      <p style="margin: 0;">${order.data}</p>
      </div>
      <div style="display:flex; justify-content: space-around;">
      <p style="margin: 0 auto 0; padding: 15px;">name product</p>
      <p style="margin: 0 auto 0; padding: 15px;">quantity</p>
      <p style="margin: 0 auto 0;padding: 15px;">price</p>
    </div>
    <div style="border: 1px solid grey; width: 100%">
      ${cartItem.map(function (item) {
        return `<div style="display:flex; justify-content: space-around">
       <p style="margin: 0 auto 0; color: blue  ">${item.product().name} 
       <span style="color: black"><br/>${item.product().price} ${'грн'}</span></p>
       <p style="margin: 0 auto 0 ">${item.quantity}<p>
       <p style="margin: 0 auto 0 ">${item.totalSum}</p>
         </div>`;
      })}
    </div>
    <div style="border: 1px solid grey; width: 100%; display:flex; ">
    <pre> Delivery              Mail            price for delivery</pre>
    </div>
    <div style="border: 1px solid grey; width: 100%">
    <p>"Hello ${user.username}. Thanks for buying in our shop. TotalSum of you order is ${cart.totalSum}"</p>
    </div>
    <p style="text-align: right">${cart.totalSum} </p>
  </div>`
    }, (err) => {
      if (err) {
        console.log(err);
        return console.log('error sending result order on mail');
      }
      console.log('email send');
    });

    for (let value of cartItem) {
      value.orderId = order.id;
      value.cartId = null;
      await value.save();
    }

    cart.totalSum = 0;
    await cart.save();

    const order1 = await Order.find({
      where: { id: order.id },
      include: { relation: 'cartItems',
        scope: { include: 'product' } } });

    return order1;
  };

  Order.remoteMethod('makeOrder', {
    description: 'make order',
    accepts: { arg: 'userId', type: 'String', required: true },
    returns: { arg: 'order', type: 'Order' },
    http: { verb: 'post' }
  });
};