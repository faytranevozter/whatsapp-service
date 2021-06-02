const successResponse = (data) => {
  const response = {
    error: {},
    data,
    message: 'success'
  }

  return response
}

const errorResponse = (errorCode, errorMessage) => {
  const response = {
    error: {
      code: errorCode,
      message: errorMessage
    },
    data: {},
    message: 'failed'
  }

  return response
}

module.exports = {
  errorResponse,
  successResponse
}
