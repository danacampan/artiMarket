import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import Order from '../models/orderModel.js';
import { isAuth } from '../utils.js';
import nodemailer from 'nodemailer';

const orderRouter = express.Router();
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'process.env.GMAIL_USER',
    pass: 'process.env.GMAIL_PASSWORD',
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const sendOrderConfirmationEmail = async (recipientEmail, orderId) => {
  const mailOptions = {
    from: 'process.env.GMAIL_USER',
    to: recipientEmail,
    subject: 'Confirmarea comenzii',
    text: `Comanda cu ID-ul ${orderId} a fost plasată cu succes. Mulțumim pentru încredere!`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    throw error;
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
    try {
      const order = await newOrder.save();
      await sendOrderConfirmationEmail(req.user.email, order._id);
      res.status(201).send({ message: 'New Order Created', order });
    } catch (error) {
      console.error('Error creating order:', error);
    }
  })
);

// const order = await newOrder.save();

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
export default orderRouter;
