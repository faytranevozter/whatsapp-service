const Router = require('koa-router')
const router = new Router()
const WaController = require('../../controllers/whatsappController')

router.post('/send', WaController.send)
router.post('/device/restart', WaController.deviceRestart)
router.get('/device/status', WaController.deviceStatus)

module.exports = router
