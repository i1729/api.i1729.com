import handler from "./libs/handler-lib.js";
import axios from 'axios';

export const main = handler(async (event, context) => {
  const userId = event.pathParameters.id;
  const twitterApiKey = process.env.twitterApiKey;

  axios.defaults.headers.common['Authorization'] = `Bearer ${twitterApiKey}`;

  let user = {
    contributor1729: false
  };

  const data = await axios({ method: 'get', url: 'https://api.twitter.com/1.1/users/lookup.json?user_id=' + userId });
  const userData= data.data[0];
  Object.assign(user, {
    screen_name: userData.screen_name,
    verified: userData.verified,
    followers_count: userData.followers_count
  });

  const memberList = await axios({ method: 'get', url: 'https://api.twitter.com/1.1/lists/members.json?count=5000&list_id=1327835085010313219' });

  return Promise.all(
    memberList.data.users.map(apiUser => {
      if (apiUser.id_str == userData.id_str) {
        Object.assign(user, {
          contributor1729: true
        });
      }
    })
  ).then(() => {
    return user;
  });
});
