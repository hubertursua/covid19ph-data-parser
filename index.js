const axios = require('axios').default;
const cheerio = require('cheerio');
const fs = require('fs');
const moment = require('moment');

const SOURCE_URL = "https://covid19ph.com/";

async function getSourceHtml() {
  return axios.get(SOURCE_URL)
    .then((resp) => {
      if (!resp || !resp.data) {
        throw new Error(`Could not fetch source code of ${SOURCE_URL}`);
      }

      return resp.data;
    });
}

function getDataFromSourceHtml(sourceHtml) {
  const $ = cheerio.load(sourceHtml);
  return JSON.parse($('phmainlist-comp').attr(':phcases'));
}

function getOutputFileName() {
  const timestamp = moment().format('YYYY-MM-DD-HHmmss');
  return `covid19ph-${timestamp}.json`;
}

function writeToFile(filePath, jsonData) {
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), (err) => {
      if (err) {
        return reject(err);
      }

      resolve();
    });
  });
}

async function main() {
  try {
    const sourceHtml = await getSourceHtml();
    const phCases = getDataFromSourceHtml(sourceHtml);
    const fileName = getOutputFileName();

    await writeToFile(`./${fileName}`, phCases)
    console.log(`Done! Data written in ${fileName}`);
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

main();