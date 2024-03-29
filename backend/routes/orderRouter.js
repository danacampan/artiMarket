import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import Order from '../models/orderModel.js';
import User from '../models/userModel.js';
import Product from '../models/productModel.js';
import {
  isAuth,
  isAdmin,
  payOrderEmailTemplate,
  deliverOrderEmailTemplate,
} from '../utils.js';
import nodemailer from 'nodemailer';

const orderRouter = express.Router();

orderRouter.get(
  '/',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const orders = await Order.find().populate('user', 'name');
    res.send(orders);
  })
);

orderRouter.get(
  '/summary',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const orders = await Order.aggregate([
      {
        $group: {
          _id: null,
          numOrders: { $sum: 1 },
          totalSales: { $sum: '$totalPrice' },
        },
      },
    ]);
    const users = await User.aggregate([
      {
        $group: {
          _id: null,
          numUsers: { $sum: 1 },
        },
      },
    ]);
    const dailyOrders = await Order.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          orders: { $sum: 1 },
          sales: { $sum: '$totalPrice' },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    const productCategories = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
    ]);
    res.send({ users, orders, dailyOrders, productCategories });
  })
);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'artimarket67@gmail.com',
    pass: 'oesa xvxz zvao nsch',
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const sendOrderConfirmationEmail = async (
  recipientEmail = ['campan.dana15@gmail.com', 'maria.campan03@e-uvt.ro'],
  orderId,
  payment,
  order,
  emailTemplateFunction
) => {
  const mailOptions = {
    from: 'artimarket67@gmail.com',
    to: recipientEmail.join(', '),
    subject: 'Informatii comanda',
    html: emailTemplateFunction(order),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
    return info;
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    throw new Error('Error sending order confirmation email');
  }
};

orderRouter.post(
  '/',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const newOrder = new Order({
      orderItems: req.body.orderItems.map((x) => ({ ...x, product: x._id })),
      shippingAddress: req.body.shippingAddress,
      paymentMethod: req.body.paymentMethod,
      itemsPrice: req.body.itemsPrice,
      shippingPrice: req.body.shippingPrice,
      taxPrice: req.body.taxPrice,
      totalPrice: req.body.totalPrice,
      user: req.user._id,
    });
    //const order = await newOrder.save();
    //res.status(201).send({ message: 'New Order Created', order });

    try {
      const order = await newOrder.save();
      await sendOrderConfirmationEmail(
        req.user.email,
        order._id,
        order.paymentMethod,
        order,
        payOrderEmailTemplate
      );
      //console.log('Order confirmation email sent successfully');
      res.status(201).send({ message: 'New Order Created', order });
    } catch (error) {
      console.error('Error creating order:', error);
      res.status(500).send({ message: 'Error creating order' });
    }
  })
);

orderRouter.get(
  '/mine',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id });
    res.send(orders);
  })
);

orderRouter.get(
  '/:id',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (order) {
      res.send(order);
    } else {
      res.status(404).send({ message: 'Order Not Found' });
    }
  })
);

orderRouter.put(
  '/:id/deliver',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (order) {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
      await order.save();
      try {
        await sendOrderConfirmationEmail(
          order.user.email,
          order._id,
          order.paymentMethod,
          order,
          deliverOrderEmailTemplate
        );
        console.log('Order confirmation email sent successfully for delivery.');
      } catch (emailError) {
        console.error(
          'Error sending order confirmation email for delivery:',
          emailError
        );
      }
      res.send({ message: 'Comanda livrata' });
    } else {
      res.status(404).send({ message: 'Comanda negasita' });
    }
  })
);

orderRouter.delete(
  '/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (order) {
      await order.deleteOne();
      res.send({ message: 'Order Deleted' });
    } else {
      res.status(404).send({ message: 'Order Not Found' });
    }
  })
);

export default orderRouter;
