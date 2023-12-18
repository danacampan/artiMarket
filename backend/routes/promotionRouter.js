import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import Promotion from '../models/promotionModel.js';
import { isAuth } from '../utils.js';

const promotionRouter = express.Router();

promotionRouter.post(
  '/validate',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const { promoCode } = req.body;
    console.log('Received promo code:', promoCode);
    console.log('User Token:', req.headers.authorization);

    const promotion = await Promotion.findOne({
      code: promoCode,
      expirationDate: { $gte: new Date() },
    });

    if (promotion) {
      res.send({ valid: true, promotion });
    } else {
      res.send({ valid: false, message: 'Invalid promotion code' });
    }
  })
);

export default promotionRouter;
