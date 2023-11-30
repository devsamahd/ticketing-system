const config = require("../utils/config")
const amqp = require("amqplib")

require("dotenv").config()

class Producer{
    channel
    async createChannel(){
        const connection = await amqp.connect(config.rabbitMq.url)
        this.channel = await connection.createChannel()
    }
 }

module.exports = Producer