const express = require("express");

const authenticate = require("../middleware/authenticate");
const requiresAuth = require("../middleware/requiresAuth");
const requiresAdmin = require("../middleware/requiresAdmin");
const errorHandler = require("../middleware/errorHandler");

const userController = require("../controllers/User");
const imageController = require("../controllers/Image");
const advertisementController = require("../controllers/Advertisement");
const categoryController = require("../controllers/Category");
const manufacturerController = require("../controllers/Manufacturer");
const instrumentModelController = require("../controllers/InstrumentModel");

const router = express.Router();

router.use(authenticate);

// пользователи
router.post("/users/register", userController.register);
router.post("/users/authorize", userController.authorize);

// изображения
router.post("/images/upload", requiresAuth, imageController.upload);

// объявления
router.post("/ads/add", requiresAuth, advertisementController.add);
router.get("/ads/getAll", advertisementController.getAll);
router.get("/ads/get", advertisementController.get);

// категории
router.get("/category/getAll", [requiresAuth, requiresAdmin], categoryController.getAll);
router.post("/category/add", [requiresAuth, requiresAdmin], categoryController.add);
router.delete("/category/remove", [requiresAuth, requiresAdmin], categoryController.remove);

// производители
router.get("/manufacturer/getAll", [requiresAuth, requiresAdmin], manufacturerController.getAll);
router.post("/manufacturer/add", [requiresAuth, requiresAdmin], manufacturerController.add);
router.delete("/manufacturer/remove", [requiresAuth, requiresAdmin], manufacturerController.remove);

// модели инструментов
router.get("/model/getAll", [requiresAuth, requiresAdmin], instrumentModelController.getAll);
router.post("/model/add", [requiresAuth, requiresAdmin], instrumentModelController.add);
router.delete("/model/remove", [requiresAuth, requiresAdmin], instrumentModelController.remove);

router.all("*", (req, res) => {
  res.status(404).json({ error: 404 })
});

router.use(errorHandler);

module.exports = router;