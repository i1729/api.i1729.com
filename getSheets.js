import handler from "./libs/handler-lib.js";
import request from "request";
import csv from "csvtojson";

export const main = handler(async (event, context) => {
  const pageId = event.pathParameters.id;

  let sheetsUrl = `https://docs.google.com/spreadsheets/d/e/2PACX-1vR-Oz-t_-hcwJ2qa0rQbiT3-VYqnvJ70RYhHF8oSa3ECYD1ylcSUVIA8HQ07r-PUi5ABjEQZuw_4jYS/pub?gid=${pageId}&single=true&output=csv`;

  return csv().fromStream(request.get(sheetsUrl));
});
