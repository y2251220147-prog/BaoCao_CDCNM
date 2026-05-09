const router = require('express').Router();
const ctrl   = require('../controllers/challengeController');

router.get('/',                ctrl.getAll);
router.get('/:id',             ctrl.getById);
router.post('/',               ctrl.create);
router.put('/:id',             ctrl.update);
router.post('/:id/contribute', ctrl.contribute);
router.delete('/:id',          ctrl.remove);

module.exports = router;
