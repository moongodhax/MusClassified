const { User } = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("../helpers/jwt");
const { Op } = require('sequelize');
const userRoles = require('../helpers/userRoles');

async function register(req, res) {
  const { email, password, phoneNumber, firstName, lastName, city } = req.body;

  if (!email) return res.status(400).json({ error: "Email cannot be empty" });
  if (!password) return res.status(400).json({ error: "Password cannot be empty" });
  if (!phoneNumber) return res.status(400).json({ error: "Phone number cannot be empty" });
  if (!firstName) return res.status(400).json({ error: "First name cannot be empty" });
  if (!lastName) return res.status(400).json({ error: "Last name cannot be empty" });
  if (!city) return res.status(400).json({ error: "City cannot be empty" });

  let user = await User.findOne({
    where: { email }
  });

  if (user) return res.status(400).json({ error: "Email already taken" });

  user = await User.create({
    email,
    password: await bcrypt.hash(password, 10),
    phoneNumber,
    firstName,
    lastName,
    city,
    role: userRoles.USER
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

async function getSelf(req, res) {
  res.status(200).json(req.currentUser);
}

async function getAll(req, res) {
  let { offset, count, role } = req.query;

  offset = Number(offset) || 0;
  count = Number(count) || 20;

  let where = {};
  if (role != -1) where.role = role;

  let users = await User.findAll({
    where,
    offset: offset,
    limit: count,
  });

  res.status(200).json(users);
}

async function editAdmin(req, res) {
  let { id, role } = req.body;

  if (!id) return res.status(400).json({ error: "Id cannot be empty" });

  let values = {};
  if (role != null && role != undefined) values.role = role;

  await User.update(
    values,
    {
      where: {
        id,
      }
    }
  );

  res.status(200).json();
}

async function editSelf(req, res) {
  let { firstName, lastName, email, phoneNumber, city, oldPass, newPass, repeatPass } = req.body;

  let values = {};
  if (firstName) values.firstName = firstName;
  if (lastName) values.lastName = lastName;
  if (email) values.email = email;
  if (phoneNumber) values.phoneNumber = phoneNumber;
  if (city) values.city = city;

  if (oldPass?.length && newPass?.length && repeatPass?.length) {
    if (await bcrypt.compare(oldPass, req.currentUser.password)) {
      if (newPass == repeatPass) values.password = await bcrypt.hash(newPass, 10);
      else return res.status(400).json({ error: "Passwords doesn't match" });
    }
    else {
      return res.status(401).json({ error: "Incorrect password" });
    }
  }

  if (Object.keys(values).length == 0) return res.status(400).json({ error: "You must specify at least one value" });

  await req.currentUser.update(values);
  await req.currentUser.save();
  
  res.status(200).json();
}

async function removeAdmin(req, res) {
  const { id } = req.body;

  if (!id) return res.status(400).json({ error: "Id cannot be empty" });

  await User.destroy({
    where: {
      id: id,
    }
  });

  res.status(200).json();
}

module.exports = {
  register,
  authorize,
  getSelf,
  getAll,
  editAdmin,
  editSelf,
  removeAdmin
}