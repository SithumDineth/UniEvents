const { Expo } = require('expo-server-sdk');
const Notification = require('../models/Notification');

// Create a new Expo SDK client
// optionally providing an access token if you have enabled push security
let expo = new Expo();

/**
 * Sends push notifications and saves them to the database.
 * @param {Array<{userId: String, pushToken: String, title: String, body: String, data?: Object}>} messages 
 */
const sendPushNotifications = async (messages) => {
  let expoMessages = [];
  let dbNotifications = [];

  for (let msg of messages) {
    // 1. Prepare for saving to DB
    if (msg.userId) {
      dbNotifications.push({
        userId: msg.userId,
        title: msg.title,
        body: msg.body,
        data: msg.data || {},
      });
    }

    // 2. Prepare Expo message if token is valid
    if (msg.pushToken && Expo.isExpoPushToken(msg.pushToken)) {
      expoMessages.push({
        to: msg.pushToken,
        sound: 'default',
        title: msg.title,
        body: msg.body,
        data: msg.data || {},
      });
    } else {
      console.error(`Push token ${msg.pushToken} is not a valid Expo push token`);
    }
  }

  // Save to DB
  if (dbNotifications.length > 0) {
    try {
      await Notification.insertMany(dbNotifications);
    } catch (err) {
      console.error('Error saving notifications to DB:', err);
    }
  }

  // Send chunks to Expo
  let chunks = expo.chunkPushNotifications(expoMessages);
  let tickets = [];
  (async () => {
    for (let chunk of chunks) {
      try {
        let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error('Error sending push notifications chunk:', error);
      }
    }
  })();
};

module.exports = {
  sendPushNotifications,
};
