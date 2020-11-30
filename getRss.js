import handler from "./libs/rss-handler-lib.js";
import axios from "axios";
import xml from "xml";

export const main = handler(async (event, context) => {
  const SITE_BASE_URL = "https://api.i1729.com";
  let posts = await axios.get(SITE_BASE_URL + '/feed');

  const xmlObject = {
    rss: [
      {
        _attr: {
          version: '2.0',
          'xmlns:atom': 'http://www.w3.org/2005/Atom'
        }
      },
      {
        channel: [
          {
            'atom:link': {
              _attr: {
                href: SITE_BASE_URL + '/feed.rss',
                rel: 'self',
                type: 'application/rss+xml'
              }
            }
          },
          { title: '1729' },
          { link: 'https://1729.com' },
          { description: 'This is the feed for 1729.' },
          { language: 'en-us' },

          ...posts.data.map((post) => {
            return {
              item: [
                { title: post.title },
                { pubDate: new Date(post.created).toUTCString() },
                { link: post.url },
                { guid: post.url },
                { description: post.description }
              ]
            };
          })
        ]
      }
    ]
  };

  return '<?xml version="1.0" encoding="UTF-8"?>' + xml(xmlObject);
});
