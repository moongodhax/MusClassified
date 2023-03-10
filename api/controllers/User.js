const { User } = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("../helpers/jwt");
const { Op } = require('sequelize');

async function register(req, res) {
  const { email, password, phoneNumber, name, city } = req.body;

  if (!email) return res.status(400).json({ error: "Email cannot be empty" });
  if (!password) return res.status(400).json({ error: "Password cannot be empty" });
  if (!phoneNumber) return res.status(400).json({ error: "Phone number cannot be empty" });
  if (!name) return res.status(400).json({ error: "Name number cannot be empty" });
  if (!city) return res.status(400).json({ error: "City number cannot be empty" });

  let user = await User.findOne({
    where: { email }
  });

  if (user) return res.status(400).json({ error: "Email already taken" });

  user = await User.create({
    email: email,
    password: await bcrypt.hash(password, 10),
    phoneNumber: phoneNumber,
    name: name,
    city: city
  });

  user = await User.findOne({
    where: { id: user.id },
    attributes: {
      exclude: ['password']
    },
    raw: true
  });

  user.token = jwt.sign(user.id);

  return res.status(200).json(user);
}

async function authorize(req, res) {
  let { username, password } = req.body;

  if (!username) return res.status(400).json({ error: "Username cannot be empty" });
  if (!password) return res.status(400).json({ error: "Password cannot be empty" });
  
  let user = await User.findOne({
    where: {
      [Op.or]: [
        { email: username },
        { phoneNumber: username }
      ]
    },
    attributes: {
      exclude: ['password']
    },
    raw: true
  });

  if (user) {
    user.token = jwt.sign(user.id);
    return res.status(200).json(user);
  }
  else {
    return res.status(401).json({ error: "Incorrect credentials" });
  }
}

module.exports = {
  register,
  authorize,
}