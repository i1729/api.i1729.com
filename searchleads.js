import fetch from "node-fetch";
import handler from "./libs/handler-lib";

export const main = handler(async (event, context) => {
    const { content } = JSON.parse(event.body);

    const url = 'https://api.rocketreach.co/v1/api/search?';
    const params = new URLSearchParams({ api_key: process.env.rocketApiKey, keyword: content });
    const response = await fetch(url + params);

    return response.json();
});
