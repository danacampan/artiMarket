import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import expressAsyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import { isAuth, isAdmin, generateToken } from '../utils.js';

const userRouter = express.Router();

userRouter.get(
  '/',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const users = await User.find({});
    res.send(users);
  })
);

userRouter.get(
  '/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (user) {
      res.send(user);
    } else {
      res.status(404).send({ message: 'User Not Found' });
    }
  })
);

userRouter.put(
  '/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.isAdmin = Boolean(req.body.isAdmin);
      const updatedUser = await user.save();
      res.send({ message: 'User Updated', user: updatedUser });
    } else {
      res.status(404).send({ message: 'User Not Found' });
    }
  })
);

userRouter.delete(
  '/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (user) {
      if (user.email === 'admin@gmail.com') {
        res.status(400).send({ message: 'Nu poti sterge contul adminului' });
        return;
      }
      await user.deleteOne();
      res.send({ message: 'Utilizator sters' });
    } else {
      res.status(404).send({ message: 'Utilizator negasit' });
    }
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

userRouter.post(
  '/signin',
  expressAsyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      if (bcrypt.compareSync(req.body.password, user.password)) {
        res.send({
          _id: user._id,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
          token: generateToken(user),
        });
        return;
      }
    }
    res.status(401).send({ message: 'Email sau parolă invalide' });
  })
);

userRouter.post(
  '/signup',
  expressAsyncHandler(async (req, res) => {
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).send({ message: 'Email-ul e deja înregistrat' });
    }

    try {
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password),
      });

      const savedUser = await newUser.save();

      const confirmationToken = jwt.sign(
        { userId: savedUser._id },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );

      savedUser.confirmationToken = confirmationToken;
      await savedUser.save();

      const confirmationLink = `${process.env.FRONTEND_URL}/confirm/${confirmationToken}`;

      const mailOptions = {
        from: 'artimarket67@gmail.com',
        to: savedUser.email,
        subject: 'Confirmă înregistrarea',
        text: `Dă click pe următorul link pentru a-ți verifica emailul: ${confirmationLink}`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error(error);
          res.status(500).json({
            message: 'Eroare la trimiterea email-ului de confirmare.',
          });
        } else {
          console.log('Email sent: ' + info.response);
          res.status(201).json({
            message: 'Utilizator înregistrat cu succes.',
          });
        }
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: 'Eroare la înregistrarea utilizatorului.' });
    }
  })
);

userRouter.put(
  '/profile',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      if (req.body.password) {
        user.password = bcrypt.hashSync(req.body.password, 8);
      }

      const updatedUser = await user.save();
      res.send({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
        token: generateToken(updatedUser),
      });
    } else {
      res.status(404).send({ message: 'Utilizator negăsit.' });
    }
  })
);

export default userRouter;
