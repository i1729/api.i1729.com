import handler from "./libs/handler-lib.js";
import axios from "axios";
import oauthSignature from "oauth-signature";

export const main = handler(async (event, context) => {
  const userId = event.pathParameters.id;

  const twitterBearerToken = process.env.twitterBearerToken;
  const twitterOauthConsumerKey = process.env.twitterOauthConsumerKey;
  const twitterOauthConsumerSecret = process.env.twitterOauthConsumerSecret;
  const twitterOauthAccessToken = process.env.twitterOauthAccessToken;
  const twitterOauthAccessTokenSecret = process.env.twitterOauthAccessTokenSecret;

  const nonceGenerator = (length) => {
    var nonce = "";
    var allowed = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for(var i = 0; i < length; i++) {
      nonce = nonce.concat(allowed.charAt(Math.floor(Math.random() * allowed.length)));
    }
    return nonce;
  };

  let user = {
    contributor1729: false
  };

  try {
    const optionsBearer = {
      headers: {
        "Authorization": `Bearer ${twitterBearerToken}`
      }
    };

    const data = await axios.get('https://api.twitter.com/1.1/users/lookup.json?user_id=' + userId, optionsBearer);
    const userData= data.data[0];
    Object.assign(user, {
      screen_name: userData.screen_name,
      verified: userData.verified,
      followers_count: userData.followers_count
    });
  } catch(err) {
    console.log("lookup" + err);
    return "lookup " + err;
  }

  try {
    const baseUrl = "https://api.twitter.com/1.1/lists/members/show.json";
    const timestamp = Math.floor(Date.now() / 1000);
    const nonce = nonceGenerator(11);
    const parameters = {
      list_id: '1333184036701925388',
      user_id: userId,
      oauth_consumer_key: twitterOauthConsumerKey,
      oauth_token: twitterOauthAccessToken,
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: timestamp.toString(),
      oauth_nonce: nonce,
      oauth_version: '1.0'
    };

    console.log("parameters: ", parameters);

    var signatureOptions = {
      encodeSignature: true // will encode the signature following the RFC 3986 Spec by default
    };

    const encoded_oauth_signature = oauthSignature.generate('GET', baseUrl, parameters, twitterOauthConsumerSecret, twitterOauthAccessTokenSecret, signatureOptions);


    const options = {
      headers: {
        "Authorization": `OAuth oauth_consumer_key="${twitterOauthConsumerKey}",oauth_token="${twitterOauthAccessToken}",oauth_signature_method="HMAC-SHA1",oauth_timestamp="${timestamp}",oauth_nonce="${nonce}",oauth_version="1.0",oauth_signature="${encoded_oauth_signature}"`
      }
    };

    const url = "https://api.twitter.com/1.1/lists/members/show.json?list_id=1333184036701925388&user_id=" + userId;
    const memberList = await axios.get(url, options);

    if (memberList.status == 200) {
      Object.assign(user, {
        contributor1729: true
      });
      return user;
    } else {
      return user;
    }
  } catch (err) {
    console.log(err);
    return err.response.data.errors;
  }
});
