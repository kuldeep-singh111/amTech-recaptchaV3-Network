const express = require('express');
const router = express.Router();
const controller = require('../controllers/authController');

router.get('/', controller.getRegister);

router.get('/register', controller.getRegister);
router.post('/register', controller.postRegister);
router.get('/login', controller.getLogin);
router.post('/login', controller.postLogin);
router.get('/profile', controller.getProfile);
router.get('/logout', controller.logout);

module.exports = router;