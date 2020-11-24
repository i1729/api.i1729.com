import handler from "./libs/handler-lib.js";
import axios from 'axios';

export const main = handler(async (event, context) => {
  const userId = event.pathParameters.id;
  const twitterApiKey = process.env.twitterApiKey;
  const twitterConsumerKey = process.env.twitterConsumerKey;
  const twitterSecretKey = process.env.twitterSecretKey;
  let verified = false;
  
  axios.defaults.headers.common['Authorization'] = `Bearer ${twitterApiKey}`;
  
  axios({ method: 'get', url: 'https://api.twitter.com/1.1/members.json?list_id=1327835085010313219' })
  .then(res2 => { 
    Promise.all(
      res2.data.users.map(user => {
        if (user.id === id) { 
          verified = true;
        }  
      });
    ).then(() => {
      return verified;
    });
  })
  .catch(err => {
    return err; 
  });
}
