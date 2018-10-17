const createError = require('http-errors');
const basicauth = require('basic-auth');
/* eslint-disable import/prefer-default-export */
export function basicAuth(req, res, next) {
  const cred = basicauth(req);
  if (cred && cred.name === process.env.API_KEY && cred.pass === process.env.API_SECRET) {
    return next();
  }
  return next(createError(401, 'Please login to view this page.'));
}
/* eslint-enable import/prefer-default-export */
