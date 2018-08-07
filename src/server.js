import express from 'express';
import pb from 'promise-breaker';
import { absolutePath as pathToSwaggerUi } from 'swagger-ui-dist';

import mongoose from 'mongoose';
import swaggerNodeRunner from 'swagger-node-runner';
import createSwaggerConfig from './swagger/swaggerConfig';

const PRODUCTION_HOST = 'myproductionserver.com';

// Set native promises as mongoose promise
mongoose.Promise = global.Promise;

// MongoDB Connection
if (process.env.NODE_ENV !== 'test') {
  mongoose.connect(process.env.MONGO_DB, { autoIndex: false, useNewUrlParser: true },
    (error) => {
      if (error) {
        console.error('Please make sure Mongodb is installed and running!'); // eslint-disable-line no-console
        throw error;
      }
    });
}


async function createSwaggerMiddleware(app) {
  // Stop swaggerNodeRunner from complaining about the lack of a config file.
  process.env.SUPPRESS_NO_CONFIG_WARNING = 'true';

  // Create a swagger middleware
  const swaggerConfig = await createSwaggerConfig();
  if (process.env.NODE_ENV === 'production') {
    swaggerConfig.swagger.host = PRODUCTION_HOST;
    swaggerConfig.swagger.schemes = ['https'];
  }
  const swaggerRunner = await pb.call(done => swaggerNodeRunner.create(swaggerConfig, done));
  const swaggerExpress = swaggerRunner.expressMiddleware();

  // Note this line is equivalent to `app.use(swaggerExpress.middleware);`
  swaggerExpress.register(app);

  app.use((req, res, next) => {
    if (res.headersSent) {
      // Hack to get around
      // https://github.com/theganyo/swagger-node-runner/issues/87.
      // If headers have already been sent, it means swagger-node-runner
      // has written a response and called `next()` incorrectly.  Just drop
      // the request.
    } else {
      next();
    }
  });

  swaggerExpress.runner.on('responseValidationError', (validationResponse, request, response) => {
    response.status(400).json(validationResponse.errors);
  });
}

export default async function makeServer() {
  const app = express();
  app.use('/api/v1', express.static(pathToSwaggerUi()));
  await createSwaggerMiddleware(app);
  return app;
}
