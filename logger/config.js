require('dotenv').config()

const config = {
    rabbitMq:{
        url: process.env.AMQP_URI,
        exchangeName: process.env.AMQP_LOG_EXCHANGE
    }
}
module.exports = config