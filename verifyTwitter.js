import handler from "./libs/handler-lib.js";
import axios from 'axios';

export const main = handler(async (event, context) => {
  const userId = event.pathParameters.id;
  const twitterAppKey = process.env.twitterAppKey;
  let verified = false;

  axios.defaults.headers.common['Authorization'] = `Bearer ${twitterAppKey}`;

  axios({ method: 'get', url: 'https://api.twitter.com/1.1/members.json?list_id=1327835085010313219' })
  .then(res2 => { 
    Promise.all(
      res2.data.users.map(user => {
        if (userId === id) {
          verified = true;
        }
      })
    ).then(() => {
      return verified;
    });
  })
  .catch(err => {
    return err;
  });
});
