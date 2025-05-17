const express = require('express')
const axios = require('axios')
const Redis = require('ioredis')
const app = express()
const PORT = 3001
const redis = new Redis();

app.use(express.json())
app.get('/suryash/test', async (req, res) => {
   
    const redisObj = {
        "appName": "Sashakt",
        "module": "Intermediary",
        "ip": req.ip,
        "hostname": req.hostname,
        "path": req.path,
    }
    console.log(redisObj, '--->redisObj')
    const respFromRedis = await axios.post('http://localhost:3001/log-api', redisObj)
    console.log(respFromRedis, 'respFromRedis')
    res.send('Hello World')
})
app.get('/suryash/dp', async (req, res) => {
   
    const redisObj = {
        "appName": "Digital Partner",
        "module": "Discrepancy",
        "ip": req.ip,
        "hostname": req.hostname,
        "path": req.path,
    }
    console.log(redisObj, '--->redisObj')
    const respFromRedis = await axios.post('http://localhost:3001/log-api', redisObj)
    console.log(respFromRedis, 'respFromRedis')
    res.send('Hello World')
})

app.post('/log-api', async (req, res) => {
    const body = req.body
    const keyName= req.body.ip+':'+req.body.path
    await redis.multi()
    .incr(keyName)
    .expire(keyName, 10)
    .exec()
    
    // .expire(keyName, 100)
    // console.log(savingData, '===>body')
    res.send({
        message: keyName+' saved to redis'
    })
})

app.get('/retrive-redis-data', async (req, res)=>{
    const dataFromRedis= await redis.keys('*')
    res.send(dataFromRedis)
})
app.get('/delete-all-redis-data', async (req, res)=>{
    const dataFromRedis= await redis.flushall()
    res.send(dataFromRedis)
})


app.listen(PORT, () => {
    console.log('Server started at http://localhost:' + PORT)
})