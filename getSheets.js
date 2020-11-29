import handler from "./libs/handler-lib.js";
import request from "request";
import csv from "csvtojson";

export const main = handler(async (event, context) => {
  const pageId = event.pathParameters.id;

// Different tabs in sheets have different ids:
// Movies & TV series = 0
// Books & Novels = 2098923924

  let sheetsUrl = `https://docs.google.com/spreadsheets/d/e/2PACX-1vRzADxqw-9y4xYVf23zXIzduKxQnqsJgdnwcOK1cY-iHIwx8Z8Syp8P18WYgznFlDvYSpRQXJQcXyqq/pub?gid=${pageId}&single=true&output=csv`;

  return csv().fromStream(request.get(sheetsUrl));
});
