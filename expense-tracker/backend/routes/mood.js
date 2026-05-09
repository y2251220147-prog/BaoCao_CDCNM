const router = require('express').Router();
const ctrl   = require('../controllers/moodController');

router.get('/stats', ctrl.getStats);

module.exports = router;
