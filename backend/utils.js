import jwt from 'jsonwebtoken';

export const generateToken = (user) => {
  return jwt.sign(
    {
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    },
    `${process.env.JWT_SECRET}`,
    {
      expiresIn: '30d',
    }
  );
};
export const isAuth = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (authorization) {
    const token = authorization.slice(7, authorization.length); // Bearer XXXXXX
    jwt.verify(token, `${process.env.JWT_SECRET}`, (err, decode) => {
      if (err) {
        res.status(401).send({ message: 'Invalid Token' });
      } else {
        req.user = decode;
        next();
      }
    });
  } else {
    res.status(401).send({ message: 'No Token' });
  }
};

export const isAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401).send({ message: 'Invalid Admin Token' });
  }
};

export const payOrderEmailTemplate = (order) => {
  return `<h1>Mulțumim că ai cumpărat de la noi!</h1>
  <p>Comanda ta a fost plasată cu succes!</p>
  <h2>[Comanda ${order._id}] (${order.createdAt
    .toString()
    .substring(0, 10)})</h2>
  <table>
  <thead>
  <tr>
  <td><strong>Produs</strong></td>
  <td><strong>Cantitate</strong></td>
  <td><strong align="right">Preț</strong></td>
  </thead>
  <tbody>
  ${order.orderItems
    .map(
      (item) => `
    <tr>
    <td>${item.name}</td>
    <td align="center">${item.quantity}</td>
    <td align="right"> ${item.price.toFixed(2)} lei</td>
    </tr>
  `
    )
    .join('\n')}
  </tbody>
  <tfoot>
  <tr>
  <td colspan="2">Produse:</td>
  <td align="right"> ${order.itemsPrice.toFixed(2)} lei</td>
  </tr>
  <tr>
  <td colspan="2">Livrare:</td>
  <td align="right"> ${order.shippingPrice.toFixed(2)} lei</td>
  </tr>
  <tr>
  <td colspan="2"><strong>Preț total:</strong></td>
  <td align="right"><strong> ${order.totalPrice.toFixed(2)} lei</strong></td>
  </tr>
  <tr>
  <td colspan="2">Metodă de plată</td>
  <td align="right">${order.paymentMethod}</td>
  </tr>
  </table>
  <h2>Adresă de livrare:</h2>
  <p>
  ${order.shippingAddress.fullName},<br/>
  ${order.shippingAddress.address},<br/>
  ${order.shippingAddress.city},<br/>
  ${order.shippingAddress.country},<br/>
  ${order.shippingAddress.postalCode}<br/>
  </p>
  <hr/>
  <p>
  Mulțumim că ai cumpărat de la noi!
  </p>
  `;
};
