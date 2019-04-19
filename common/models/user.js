module.exports = function (user) {
  user.afterRemote('create', async (ctx) => {
    await app.models.Cart.create({
      userid: ctx.result.id
    });
  });
};