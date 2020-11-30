import handler from "./libs/handler-lib.js";
import axios from "axios";
import csv from "csvtojson";
import request from "request";
import Parser from "rss-parser";
let parser = new Parser();

export const main = handler(async (event, context) => {
  const twitterBearerToken = process.env.twitterBearerToken;

  const getTwitterHandles = () => {
    const sheetsTwitterUrl = `https://docs.google.com/spreadsheets/d/e/2PACX-1vQhIMuXjiaG5ZZM4xMkB3N-xKXr6vuy6CttfcNACuzxQpMQXZwoT961j4GqcW27uV6UB_VNIdtH-fuc/pub?gid=0&single=true&output=csv`;
    return csv().fromStream(request.get(sheetsTwitterUrl));
  };
  const twitterHandles = await getTwitterHandles();

  const getRssFeeds = () => {
    const sheetsGhostUrl = `https://docs.google.com/spreadsheets/d/e/2PACX-1vQhIMuXjiaG5ZZM4xMkB3N-xKXr6vuy6CttfcNACuzxQpMQXZwoT961j4GqcW27uV6UB_VNIdtH-fuc/pub?gid=1294971885&single=true&output=csv`;
    return csv().fromStream(request.get(sheetsGhostUrl));
  };
  const rssFeeds = await getRssFeeds();

  let feed = [];

  return Promise.all([
    Promise.all(twitterHandles.map(item => {
      try {
        const optionsBearer = { headers: { "Authorization": `Bearer ${twitterBearerToken}` } };
        return axios.get('https://api.twitter.com/1.1/search/tweets.json?result_type=recent&q=from:' + item.twitterName, optionsBearer)
        .then(data => {
          return Promise.all(data.data.statuses.map(tweet => {
            console.log(tweet);
            return feed.push({
              url: "https://twitter.com/" + tweet.user.screen_name + "/status/" + tweet.id_str,
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
    })),
    Promise.all(rssFeeds.map(item => {
      try {
        return parser.parseURL(item.url)
        .then(rssFeed => {
          return Promise.all(rssFeed.items.map(post => {
            return feed.push({
              url: post.link,
              title: post.title,
              description: post.content,
              creator: post.creator || feed.managingEditor,
              created: new Date(post.pubDate)
            });
          }));
       });
      } catch(err) {
        console.log("lookup" + err);
        return err;
      }
    })),
  ])
  .then(() => {
    return feed.sort(function compare(a, b) { return b.created - a.created; } );
  });

});
