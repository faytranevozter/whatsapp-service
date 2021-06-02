const Router = require('koa-router')
const router = new Router()

// sample endpoint for guest
router.use('/whatsapp', require('./whatsapp').routes())

module.exports = router
