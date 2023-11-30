require('dotenv').config()
const amqp = require('amqplib')
const EventEmitter = require('events');
const logEvents = require('./loggers/logEvents');
const config = require('./config');
class Emitter extends EventEmitter { };
const myEmitter = new Emitter()
myEmitter.on('log', (msg, fileName) => logEvents(msg, fileName))

async function consumeMessages(){
    const connection = await amqp.connect(config.rabbitMq.url)
    const channel = await connection.createChannel()

    await channel.assertExchange(config.rabbitMq.exchangeName, 'direct')

    const q = await channel.assertQueue("LogQueue")

    await channel.bindQueue(q.queue, config.rabbitMq.exchangeName, "log")

    channel.consume(q.queue, (msg)=>{
        const data = JSON.parse(msg.content)
        myEmitter.emit('log', `${data.logType}\t${data.url}\t${data.method}`, 'reqLog.txt');

        console.log(data)
        channel.ack(msg)
    })
}

consumeMessages()