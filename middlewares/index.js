const { errorResponse } = require('../helpers/response')

const errorWrapper = async (ctx, next) => {
  try {
    await next()
  } catch (err) {
    ctx.app.emit('error', err, ctx)
  }
}

const validateHeaders = async (ctx, next) => {
  if (ctx.method !== 'GET') {
    if (ctx.is('application/json')) {
      ctx.acceptsEncodings('gzip')
      // process
      await next()
    } else if (ctx.method === 'POST' && ctx.is('multipart/form-data')) {
      await next()
    } else {
      ctx.throw(errorResponse(400, 'Only accept application/json request'))
    }
  } else {
    await next()
  }
}

const authorization = async (ctx, next) => {
  if (!ctx.headers.authorization || ctx.headers.authorization !== process.env.SECRET_KEY) {
    ctx.throw(errorResponse(400, 'Unauthorized'))
  } else {
    await next()
  }
}

module.exports = {
  errorWrapper,
  validateHeaders,
  authorization
}
