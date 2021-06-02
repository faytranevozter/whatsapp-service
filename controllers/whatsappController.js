const { errorResponse, successResponse } = require('../helpers/response')

const deviceRestart = async (ctx, next) => {
  try {
    // restart service
    await ctx.whatsapp.killServiceWorker()
    const res = await ctx.whatsapp.restartService()
    // SHUT THE APP DOWN, restart by pm2
    setTimeout(() => {
      // Kill application
      process.kill()
    }, 1000)
    return ctx.ok(successResponse(res))
  } catch (err) {
    console.error(err)
    if (err.erro && err.erro === true) {
      return ctx.throw(errorResponse(400, err.text))
    }
    return ctx.throw(errorResponse(400, err))
  }
}

const deviceStatus = async (ctx, next) => {
  try {
    // device status
    const status = await ctx.whatsapp.getConnectionState()
    const host = await ctx.whatsapp.getHostDevice()
    return ctx.ok(successResponse({
      status,
      host
    }))
  } catch (err) {
    console.error(err)
    if (err.erro && err.erro === true) {
      return ctx.throw(errorResponse(400, err.text))
    }
    return ctx.throw(errorResponse(400, err))
  }
}

const send = async (ctx, next) => {
  try {
    const payload = ctx.request.body || {}
    if (!payload.to || !payload.message || payload.message.trim() === '') {
      return ctx.throw(errorResponse(400, 'Wrong parameters'))
    }

    // Send basic text
    const res = await ctx.whatsapp.sendText(`${payload.to}@c.us`, payload.message)

    return ctx.ok(successResponse(res))
  } catch (err) {
    console.error(err)
    if (err.erro && err.erro === true) {
      return ctx.throw(errorResponse(400, err.text))
    }
    return ctx.throw(errorResponse(400, err))
  }
}

module.exports = {
  deviceRestart,
  deviceStatus,
  send
}
