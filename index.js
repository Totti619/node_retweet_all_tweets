const
    env = require('dotenv').config(),
    Twitter = require('twitter'),
    client = new Twitter({
        consumer_key: process.env.TWITTER_CONSUMER_KEY,
        consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
        access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
        access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
    }),
    log4js = require('log4js'),

    INTERVAL = process.env.INTERVAL,
    YOUR_USER_SCREEN_NAME = process.env.YOUR_USER_SCREEN_NAME,
    USER_SCREEN_NAME_TO_RETWEET = process.env.USER_SCREEN_NAME_TO_RETWEET,
    DO_LIKES = process.env.DO_LIKES,

    retweet = (tweet) => {
        client.post('statuses/retweet/', {id: tweet.id_str}, (error, tweet) => {
            if(!error) {
                logger.info('[retweet]', tweet.id, ' => ', tweet.text);
            } else {
                logger.error(`[retweet] Error retweeting: ${error[0].message}`);
            }
        });
    }
;

// Prepare log

/* log4js.configure({
    appenders: {
      access: { type: 'dateFile', filename: 'log/access.log', pattern: '-yyyy-MM-dd' },
      app: { type: 'file', filename: 'log/app.log', maxLogSize: 10485760, numBackups: 3 },
      errorFile: { type: 'file', filename: 'log/errors.log' },
      errors: { type: 'logLevelFilter', level: 'error', appender: 'errorFile' }
    },
    categories: {
      default: { appenders: ['app', 'errors'], level: 'info' },
      http: { appenders: ['access'], level: 'info' }
    }
  }); */

  log4js.configure({
    appenders: {
      app: { type: 'file', filename: 'log/app.log', maxLogSize: 10485760, numBackups: 3 },
      gitignore: { type: 'file', filename: 'log/.gitignore' },
    },
    categories: {
      default: { appenders: ['app'], level: 'info' }
    }
  });

const logger = log4js.getLogger('access');

// Look for new tweets and retweet them each INTERVAL milliseconds
setInterval(() => {
    logger.info(`Fetching @${USER_SCREEN_NAME_TO_RETWEET} timeline... `);
    client.get('statuses/user_timeline', {screen_name: USER_SCREEN_NAME_TO_RETWEET},function(error, tweets) {
        if(error) {
            logger.error(`Error trying to get user timeline: ${error[0].message}`);
            throw error;
        }
    
        // Try to retweet each tweet
        logger.info('Trying to Retweet each tweet');
        tweets.forEach((tweet) => retweet(tweet));
    });
}, INTERVAL);

