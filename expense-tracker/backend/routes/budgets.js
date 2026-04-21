const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/budgetController');

router.get('/',       ctrl.getAll);
router.post('/',      ctrl.upsert);
router.delete('/:id', ctrl.remove);

module.exports = router;
