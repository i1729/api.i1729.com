import handler from "./libs/handler-lib.js";
import axios from 'axios';

export const main = handler((event, context) => {
  const userId = event.pathParameters.id;
  const twitterApiKey = process.env.twitterApiKey;
  let verified = { "verified": false };

  axios.defaults.headers.common['Authorization'] = `Bearer ${twitterApiKey}`;

  return axios({ method: 'get', url: 'https://api.twitter.com/1.1/lists/members.json?list_id=1327835085010313219' })
  .then(res => {
    Promise.all(
      res.data.users.map(user => {
        if (user.screen_name === userId) {
          verified = { "verified": true };
        }
      })
    ).then(() => {
      return verified;
    });
  })
  .then(() => { return verified; })
  .catch(err => {
    return err;
  });
});
