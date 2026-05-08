const express = require('express');
const router = express.Router();
const goalController = require('../controllers/goalController');

router.get('/',    goalController.getAll);
router.post('/',   goalController.create);
router.put('/:id', goalController.update);
router.delete('/:id', goalController.remove);

module.exports = router;
