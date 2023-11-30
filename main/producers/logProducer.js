const config = require("../utils/config")
const Producer = require('./producer')

class LogProducer extends Producer{
    async publishLog(routingKey, message){
        if(!this.channel){ 
            await this.createChannel()
        }
        const exchangeName = config.rabbitMq.exchangeName
        await this.channel.assertExchange(exchangeName, "direct")
        await this.channel.publish(exchangeName, routingKey, 
            Buffer.from(JSON.stringify({
                logType: routingKey,
                url: message.url,
                method: message.method,
                dateTime: new Date()
        })))
            console.log(`The message log message was sent to exchange ${exchangeName}`)
        }
    }

module.exports = LogProducer