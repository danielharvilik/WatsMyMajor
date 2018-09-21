const admin = require('firebase-admin');

// Enable hiding of API Key
require('dotenv').config();

const serviceAccount = JSON.parse(process.env.FIREBASE);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://watsmymajor.firebaseio.com",
  storageBucket: "watsmymajor.appspot.com"
});

const classesRef = admin.database().ref('/classes/');
const courseListRef = admin.database().ref('/courseList/');
const coursesRef = admin.database().ref('/courses/');
const emailsRef = admin.database().ref('/emails/');
const facebookUsersRef = admin.database().ref('/facebookUsers/');
const majorsRef = admin.database().ref('/majors/');
const reqsRef = admin.database().ref('/reqs/');
const statsRef = admin.database().ref('/stats/');
const usersRef = admin.database().ref('/users/');
const watchlistRef = admin.database().ref('/watchlist/');
const profilePicBucket = admin.storage().bucket();

module.exports = {
  classesRef,
  courseListRef,
  coursesRef,
  emailsRef,
  facebookUsersRef,
  majorsRef,
  reqsRef,
  statsRef,
  usersRef,
  watchlistRef,
  profilePicBucket,
};