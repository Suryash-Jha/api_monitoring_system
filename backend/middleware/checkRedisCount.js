const Redis= require('ioredis')
const redis= new Redis()
const RedisLimiterMiddleware= async (req, res, next) =>{
    
    const body = req.body
    const keyName = req.ip + ':' + req.path
    await redis.multi()
        .incr(keyName)
        .expire(keyName, 10)
        .exec()

    const callsCount = await redis.get(keyName)
    if (callsCount > 5) {
        res.send({
        message: 'API LIMIT REACHED'
    })
    return
}
    
    res.send({
        message: keyName + ' saved to redis'
    })
    next()
}

module.exports= {RedisLimiterMiddleware}