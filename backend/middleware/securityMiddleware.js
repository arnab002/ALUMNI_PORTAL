import hpp from 'hpp';
import ExpressBrute from 'express-brute';
import requestId from 'express-request-id';

const store = new ExpressBrute.MemoryStore();

export const hppMiddleware = hpp();

export const bruteforceMiddleware = new ExpressBrute(store, {
    freeRetries: 500000,
    minWait: 5 * 60 * 1000, // 5 minutes
    maxWait: 60 * 60 * 1000, // 1 hour,
    failCallback: function (req, res, next, nextValidRequestDate) {
        res.status(429).json({
            message: 'Too many failed attempts, please try again later.',
            nextValidRequestDate: nextValidRequestDate
        });
    },
});

export const requestIdMiddleware = requestId();