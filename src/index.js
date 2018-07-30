/* eslint "no-console": off */

import 'babel-polyfill';
import makeServer from './server';

makeServer()
  .then((app) => {
    const port = process.env.PORT || 3500;
    app.listen(port);
    console.log(`🌎 Listening on port ${port}`);
  })
  .catch((err) => {
    console.error(err.stack);
    process.exit(1);
  });
