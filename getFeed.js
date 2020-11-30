import handler from "./libs/handler-lib.js";
import axios from "axios";
import csv from "csvtojson";
import request from "request";
import Feed from "rss-to-json";

export const main = handler(async (event, context) => {
  const twitterBearerToken = process.env.twitterBearerToken;

  const getTwitterHandles =  () => {
    const sheetsTwitterUrl = `https://docs.google.com/spreadsheets/d/e/2PACX-1vQhIMuXjiaG5ZZM4xMkB3N-xKXr6vuy6CttfcNACuzxQpMQXZwoT961j4GqcW27uV6UB_VNIdtH-fuc/pub?gid=0&single=true&output=csv`;
    return csv().fromStream(request.get(sheetsTwitterUrl));
  };
  const twitterHandles = await getTwitterHandles();
  let feed = [];

  return Promise.all([
    twitterHandles.map(item => {
      try {
        const optionsBearer = { headers: { "Authorization": `Bearer ${twitterBearerToken}` } };
        return axios.get('https://api.twitter.com/1.1/search/tweets.json?result_type=recent&q=from:' + item.twitterName, optionsBearer)
        .then(data => {
          return Promise.all(data.data.statuses.map(tweet => {
            return feed.push({
              url: "https://twitter.com/" + tweet.user.screen_name + "/status/" + tweet.id,
              description: tweet.text,
              creator: tweet.user.screen_name,
              created: new Date(tweet.created_at),
              image: tweet.user.profile_image_url_https
            });
          }));
       });
      } catch(err) {
        console.log("lookup" + err);
        return err;
      }
    })
  ,
    ghostHandles.map(item => {
      try {
        return Feed.load(item.url + "/rss/")
        .then(data => {
          console.log(data);
          return Promise.all(data.items.map(tweet => {
            return feed.push({
              url:  '',
              description: tweet.text,
              creator: tweet.user.screen_name,
              created: new Date(tweet.created_at),
              image: tweet.user.profile_image_url_https
            });
          }));
       });
      } catch(err) {
        console.log("lookup" + err);
        return err;
      }
    })
  ])
  .then(() => {
    return feed.sort(function compare(a, b) { return b.created - a.created; } );
  });

});
