'use strict';

const express = require('express');
const app = express();

const line = require('@line/bot-sdk');
const axios = require('axios');
const PORT = process.env.PORT || 3000;

require('dotenv').config();


const config = {
  channelSecret: process.env.CHANNEL_SECRET,
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN
};

app.get('/', (req, res) => res.send('Hello LINE BOT!(GET):')); //ブラウザ確認用(無くても問題ない)

app.post('/webhook', line.middleware(config), (req, res) => {

    //ここのif分はdeveloper consoleの"接続確認"用なので削除して問題ないです。
    if(req.body.events[0].replyToken === '00000000000000000000000000000000' && req.body.events[1].replyToken === 'ffffffffffffffffffffffffffffffff'){
        res.send('Hello LINE BOT!(POST)');
        console.log('疎通確認用');
        return; 
    }

    Promise
      .all(req.body.events.map(handleEvent))
      .then((result) => res.json(result));
});

const client = new line.Client(config);

function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }

  getPict(event.source.userId,event.message.text); 
  
  return client.replyMessage(event.replyToken, {
    type: 'text',
    text: event.message.text //実際に返信の言葉を入れる箇所
  });
}

const getPict = async (userId,mes) => {

  const res = await axios.get('https://api.unsplash.com/search/photos?page=1&query='+ mes + '&client_id=' + process.env.UNSPLASHCLIENT_ID);
  const item = res.data;
  
  await client.pushMessage(userId, {
      //type: 'image',
      //originalContentUrl: item.results[0].urls.regular,
      //previewImageUrl: item.results[0].urls.thumb

      type: 'template',
      altText: 'this is a image carousel template',
      template: {
        type: 'image_carousel',
        columns: [
            {
              imageUrl: item.results[0].urls.thumb,
              action: {
                type:'uri',
                //label:'View details',
                uri: item.results[0].urls.regular,
              }
            },
            {
              imageUrl: item.results[1].urls.thumb,
              action: {
                type:'uri',
                //label:'View details',
                uri: item.results[1].urls.regular,
              }
            },
            {
              imageUrl: item.results[2].urls.thumb,
              action: {
                type:'uri',
                //label:'View details',
                uri: item.results[2].urls.regular,
              }
            },
            {
              imageUrl: item.results[3].urls.thumb,
              action: {
                type:'uri',
                //label:'View details',
                uri: item.results[3].urls.regular,
              }
            },
            {
              imageUrl: item.results[4].urls.thumb,
              action: {
                type:'uri',
                //label:'View details',
                uri: item.results[4].urls.regular,
              }
            }
        ]
      }

    });
};

(process.env.NOW_REGION) ? module.exports = app : app.listen(PORT);
console.log(`Server running at ${PORT}`);

