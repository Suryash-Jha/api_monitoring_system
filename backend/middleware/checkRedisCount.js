const Redis = require('ioredis')
const configData = require('../limiterConfig.json')
const redis = new Redis()
const RedisLimiterMiddleware = async (req, res, next) => {
    console.log(req.path, '--->req.path')
    if(req.path=== '/retrive-redis-data') {
        return next()
    }
    let keyName = ''
    if (configData.limitingType === 'ip_based')
        keyName = req.ip + ':' + req.path
    else
        keyName = req.appName + ':' + req.path
    const callsCount = await redis.get(keyName)
    if (callsCount >= configData.limitCount) {
        res.status(429).send({
            message: 'API LIMIT REACHED!! Please Wait'
        })
    }

        await redis.multi()
            .incr(keyName)
            .expire(keyName, configData.limitDuration)
            .exec()


    next()
}

module.exports = { RedisLimiterMiddleware }