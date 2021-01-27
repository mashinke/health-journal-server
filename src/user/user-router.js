const express = require('express');
const path = require('path');
const UserService = require('./user-service');

const userRouter = express.Router();
const jsonBodyParser = express.json();

userRouter
  .post('/', jsonBodyParser, async (req, res, next) => {
    const { password, username, email } = req.body;
    const newUserData = { password, username, email };

    const [nullKey] = Object.entries(newUserData)
      .find(([, value]) => value == null) || [];

    if (nullKey) {
      return res.status(400).json({
        error: `Missing '${nullKey}' in request body`,
      });
    }

    try {
      const passwordError = UserService.validatePassword(password);

      if (passwordError) return res.status(400).json({ error: passwordError });

      const hasUserWithEmail = await UserService.hasUserWithEmail(
        req.app.get('db'),
        email,
      );

      if (hasUserWithEmail) return res.status(400).json({ error: 'Email already taken' });

      const invalidEmail = !UserService.validateEmail(email);

      if (invalidEmail) return res.status(400).json({ error: 'Invalid email address' });

      const hashedPassword = await UserService.hashPassword(password);

      const newUser = {
        username,
        password: hashedPassword,
        email,
      };

      const user = await UserService.insertUser(
        req.app.get('db'),
        newUser,
      );

      res
        .status(201)
        .location(path.posix.join(req.originalUrl, `/${user.id}`))
        .json(UserService.serializeUser(user));
    } catch (error) {
      next(error);
    }
  });

module.exports = userRouter;
