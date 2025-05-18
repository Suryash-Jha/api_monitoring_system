const express = require('express')
const axios = require('axios')
const Redis = require('ioredis')
const { RedisLimiterMiddleware } = require('./middleware/checkRedisCount')
const app = express()
const PORT = 3001
const redis = new Redis();

app.use(express.json())
app.use(RedisLimiterMiddleware)

app.get('/suryash/test', async (req, res) => {

    const redisObj = {
        "appName": "Sashakt",
        "module": "Intermediary",
        "ip": req.ip,
        "hostname": req.hostname,
        "path": req.path,
    }
    res.send('Hello TEST')
})
app.get('/suryash/dp', async (req, res) => {

    const redisObj = {
        "appName": "Digital Partner",
        "module": "Discrepancy",
        "ip": req.ip,
        "hostname": req.hostname,
        "path": req.path,
    }
    res.send('Hello DP')
})

app.post('/log-api', async (req, res) => {
    const body = req.body
    const keyName = req.body.ip + ':' + req.body.path
    await redis.multi()
        .incr(keyName)
        .expire(keyName, 10)
        .exec()

    const callsCount = await redis.get(keyName)
    if (callsCount > 5) res.send({
        message: 'API LIMIT REACHED'
    })
    // .expire(keyName, 100)
    // console.log(savingData, '===>body')
    res.send({
        message: keyName + ' saved to redis'
    })
})

app.get('/retrive-redis-data', async (req, res) => {
    const keysFromRedis = await redis.keys('*')

    // const finalData = await keysFromRedis.reduce(async (acc, curr) => {
    //     const data = await redis.get(curr)
    //     await acc.push({ curr, data })
    //     return acc
    // }, [])
     const apiHits = await Promise.all(
        keysFromRedis.map(async (key) => {
            const data = await redis.get(key);
            return { key, data };
        })
    );
    console.log(apiHits)
    res.send({
        apiHits,
    })
})
app.get('/delete-all-redis-data', async (req, res) => {
    const dataFromRedis = await redis.flushall()
    res.send(dataFromRedis)
})


app.listen(PORT, () => {
    console.log('Server started at http://localhost:' + PORT)
})