import handler from "./libs/handler-lib.js";
import axios from "axios";
import csv from "csvtojson";
import request from "request";

export const main = handler(async (event, context) => {
  const twitterBearerToken = process.env.twitterBearerToken;

  const getTwitterHandles = async () => {
    const sheetsTwitterUrl = `https://docs.google.com/spreadsheets/d/e/2PACX-1vQhIMuXjiaG5ZZM4xMkB3N-xKXr6vuy6CttfcNACuzxQpMQXZwoT961j4GqcW27uV6UB_VNIdtH-fuc/pub?gid=0&single=true&output=csv`;
    return csv().fromStream(request.get(sheetsTwitterUrl));
  }
  const twitterHandles = await getTwitterHandles();
  let feed = [];

  Promise.all(twitterHandles.map(async item => {
    try {
      const optionsBearer = { headers: { "Authorization": `Bearer ${twitterBearerToken}` } };
      const data = await axios.get('https://api.twitter.com/1.1/search/tweets.json?result_type=recent&q=from:' + item.twitterName, optionsBearer);

      return Promise.all(data.data.statuses.map(tweet => {
        feed.push({
          url: tweet.entities.urls ? tweet.entities.urls[0].expanded_url : "",
          description: tweet.text,
          creator: tweet.user.screen_name,
          created: tweet.created_at,
          image: tweet.user.profile_image_url_https
        });
      }));

    } catch(err) {
      console.log("lookup" + err);
      return err;
    }
  })).then(() => { return feed; } );

});
