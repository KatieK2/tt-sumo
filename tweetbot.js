// From NodeSash: https://github.com/nodebotanist/NodeSash/blob/master/twitter-color-server.js

var Tessel = require("tessel-io");
var five = require("johnny-five");
var twit = require("twitter"), request = require("request");
secrets = require('./secrets');

var board = new five.Board({
  io: new Tessel()
});

var leftWheel = new five.Servo({ pin: "A5", type: 'continuous' }).stop();
var rightWheel = new five.Servo({ pin: "A6", type: 'continuous' }).stop();

var twitter_api = new twit(secrets);
var tweets_shown = [];
var hashtag = "nodebotUJS"

function mvForward() {
  leftWheel.ccw();
  rightWheel.cw();
  setTimeout(function() {
    leftWheel.stop();
    rightWheel.stop();
  }, 800);
}

function mvBackward() {
  leftWheel.cw();
  rightWheel.ccw();
  setTimeout(function() {
    leftWheel.stop();
    rightWheel.stop();
  }, 800);
}

function mvLeft() {
  console.log('Left');
  leftWheel.ccw();
  rightWheel.ccw();
  setTimeout(function() {
    leftWheel.stop();
    rightWheel.stop();
  }, 700);
  setTimeout(function() {
    mvForward();
  }, 750);
}

function mvRight() {
  leftWheel.ccw();
  rightWheel.ccw();
  setTimeout(function() {
    leftWheel.stop();
    rightWheel.stop();
  }, 700);
  setTimeout(function() {
    mvForward();
  }, 750);
}

function getNewHashtagTweets(){
  twitter_api.get('search/tweets.json', { q: '#' + hashtag }, function(err, tweets, resp){
    // console.log(err, tweets);

    var newTweets = tweets.statuses;

    newTweets.forEach(function(tweet){
      if(new Date(tweet.created_at).getTime() > (new Date().getTime() - 3600000)){ // Just tweets from the last 60 minutes

        if(tweets_shown.indexOf(tweet.id) == -1){
          tweets_shown.push(tweet.id);
          console.log(tweet.text);
          
          result = tweet.text;
          result = result.replace("#" + hashtag, "");
          result = result.match(/[u|d|l|r]/i); // Matches first instance of character only; including the hashtag. Because JS regexes don't support lookbehinds. 
          if ( result ) {
              result = result[0].toLowerCase();
            if(result == "d") {
              mvBackward();
            } else if(result == "l") {
              mvLeft();
            } else if(result == "r") {
              mvRight();
            } else {
              mvForward();
            }
          }
          else {
            console.log("  udlr not found");
          }

        } 
      }

    });
  });
}

board.on("ready", () => {
  setInterval(getNewHashtagTweets, 1000); //every 10 seconds
});
