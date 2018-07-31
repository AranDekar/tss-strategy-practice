import CORS from 'cors';

export default function create(fittingDef) {
  const regex = fittingDef.origin;

  const corsOptions = {
    credentials: true,
    origin: (origin, callback) => {
      if (origin === undefined) {
        callback(null, false);
      } else {
        // change wordnik.com to your allowed domain.
        const match = origin.match(regex);
        const allowed = (match !== null && match.length > 0);
        callback(null, allowed);
      }
    },
  };

  const middleware = CORS(corsOptions);
  return function cors(context, cb) {
    middleware(context.request, context.response, cb);
  };
}
