require('dotenv').config()
const venom = require('venom-bot')
const Koa = require('koa')
const KoaRouter = require('koa-router')
const BodyParser = require('koa-bodyparser')
const Helmet = require('koa-helmet')
const Cors = require('@koa/cors')
const Respond = require('koa-respond')
const morgan = require('koa-morgan')

// Middlewares
const Middlewares = require('./middlewares');

(async () => {
  // initialiaze KOA
  const app = new Koa()

  try {
    // assign venom
    const client = await venom.create('whatsapp', () => {}, (statusSession) => {
      // return isLogged || notLogged || browserClose || qrReadSuccess || qrReadFail || autocloseCalled
      console.log('Status Session: ', statusSession)
    }, {
      browserWS: '',
      devtools: false,
      browserArgs: [
        '--disable-dev-shm-usage'
      ]
    })

    client.onStateChange((state) => {
      console.log(new Date(), 'State changed: ', state)
      if ('CONFLICT'.includes(state)) client.useHere()
    })

    client.onStreamChange((stream) => {
      console.log(new Date(), 'Stream changed: ', stream)
      if ('DISCONNECTED'.includes(stream)) console.log('-----> logout')
    })

    // assign venom
    app.context.whatsapp = client
  } catch (err) {
    console.error(err)
  }

  // middleware for handling error
  app.use(Middlewares.errorWrapper)
  if (['dev', 'development'].includes(process.env.NODE_ENV)) {
    app.use(morgan('combined'))
  }

  app.use(Helmet())

  app.use(
    Cors({
      origin: '*',
      allowedHeaders: ['Content-Type', 'Authorization'],
      maxAge: 1728000,
      optionsSuccessStatus: 200
    })
  )

  app.use(
    BodyParser({
      enableTypes: ['json'],
      jsonLimit: '5mb',
      strict: true
    })
  )

  app.use(Respond())
  app.use(Middlewares.validateHeaders)
  app.use(Middlewares.authorization)

  // Declare Routes
  const router = new KoaRouter()

  // default route
  router.get('/', (ctx) => {
    ctx.type = 'json'
    ctx.body = {
      message: 'Whatsapp API'
    }
  })

  // endpoint from routes
  router.use('/api', require('./routes/api').routes())

  // Router Middleware - that wrap rules to entire routing protocol
  app.use(router.routes()).use(router.allowedMethods())

  // error handling via event emitter. Still figuring out the best way to populate all errors
  app.on('error', (err, ctx) => {
    const errorCode = (err.error && err.error.code) ? err.error.code : 500
    console.error(err)
    ctx.send(errorCode, {
      error: err.error || {},
      data: err.data || {},
      message: err.message || 'Error occurred.'
    })
  })

  const appPort = process.env.PORT || 1001
  app.listen(appPort, () =>
    console.log('Whatsapp API started on port ' + appPort)
  )
})()
