import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import schema from './src/schema/index';
import { execute, subscribe } from 'graphql';
import { createServer } from 'http';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
import { JWT_SECRET } from './src/config';
import jwt from 'express-jwt';
import { TutorialClassController } from './src/controllers/tutorial-class.controller';
import { UserController } from './src/controllers/user.controller';

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/upeople', { useMongoClient: true })
  .then(() => console.log('database connection success!'))
  .catch(error => console.log(error));

const PORT = process.env.PORT || 3000;

TutorialClassController.setWeekTutorials();


const app = express();

app.use('/graphql', bodyParser.json(), jwt({
  secret: JWT_SECRET,
  credentialsRequired: false,
}), graphqlExpress(({ user }, res) => {
  return {
    schema,
    context: {
      userId: user && user.userId,
      requireAuth(cb) {
        return async (...args) => {
          if (user && await UserController.userById(user.userId)) {
            return cb(args);
          }

          res.status(401);
          throw new Error('Unauthorized');
        };
      },
    },
  };
}));

app.use('/graphiql', graphiqlExpress({
  endpointURL: '/graphql',
  subscriptionsEndpoint: `ws://localhost:${PORT}/subscriptions`,
}));

const server = createServer(app);
server.listen(PORT, () => console.log('server started'));

new SubscriptionServer({
  execute,
  subscribe,
  schema,
}, {
  server,
  path: '/subscriptions',
});
