let db;
let firebaseReady = false;

const firebaseConfig = {
  apiKey: "AIzaSyAkiOXMgi64zQeE0ohJfI-HofgdxAw5W5I",
  authDomain: "sun-vs-moon.firebaseapp.com",
  databaseURL: "https://sun-vs-moon-default-rtdb.firebaseio.com",
  projectId: "sun-vs-moon",
  storageBucket: "sun-vs-moon.firebasestorage.app",
  messagingSenderId: "514030388533",
  appId: "1:514030388533:web:eb2c325146c1a4957f387c",
  measurementId: "G-E26HS1PVXJ"
};


/****************************************************
 *  INITIALIZE FIREBASE
 ****************************************************/
function initFirebase() {
  firebase.initializeApp(firebaseConfig);
  db = firebase.database();
  firebaseReady = true;
  console.log("Firebase v8 initialized.");
}

initFirebase();

/****************************************************
 *  GAME VARIABLES
 ****************************************************/
let sunPoints = 0;
let moonPoints = 0;
let totalGoal = 1000000000;

/****************************************************
 *  PLAYER ID
 ****************************************************/
function getPlayerId() {
  let id = localStorage.getItem("playerId");
  if (!id) {
    id = "player_" + Math.random().toString(36).slice(2);
    localStorage.setItem("playerId", id);
  }
  return id;
}

/****************************************************
 *  FIREBASE LISTENERS
 ****************************************************/
function setupFirebaseListeners() {
  db.ref("global/sunPoints").on("value", snap => {
    sunPoints = snap.val() || 0;
  });

  db.ref("global/moonPoints").on("value", snap => {
    moonPoints = snap.val() || 0;
  });
}

/****************************************************
 *  P5 SETUP
 ****************************************************/
function setup() {
  if (!firebaseReady) return;

  createCanvas(800, 500);
  textAlign(CENTER, CENTER);
  textSize(32);

  setupFirebaseListeners();
}

/****************************************************
 *  P5 DRAW LOOP
 ****************************************************/
function draw() {
  if (!firebaseReady) return;

  background(20);

  // Sun side
  fill(255, 180, 0);
  rect(0, 0, width / 2, height);
  fill(0);
  text("SUN", width * 0.25, 60);
  text(sunPoints.toLocaleString(), width * 0.25, 120);

  // Moon side
  fill(80, 120, 255);
  rect(width / 2, 0, width / 2, height);
  fill(0);
  text("MOON", width * 0.75, 60);
  text(moonPoints.toLocaleString(), width * 0.75, 120);

  drawProgressBar();
}

/****************************************************
 *  PROGRESS BAR
 ****************************************************/
function drawProgressBar() {
  let barY = height * 0.85;
  let barH = 40;
  let barW = width * 0.9;
  let barX = width * 0.05;

  let sunRatio = sunPoints / totalGoal;
  let moonRatio = moonPoints / totalGoal;

  fill(255, 200, 0);
  rect(barX, barY, barW * sunRatio, barH);

  fill(100, 140, 255);
  rect(barX + barW * sunRatio, barY, barW * moonRatio, barH);

  noFill();
  stroke(255);
  strokeWeight(3);
  rect(barX, barY, barW, barH);
  noStroke();
}

/****************************************************
 *  CLICK HANDLING
 ****************************************************/
function mousePressed() {
  if (!firebaseReady) return;

  if (mouseX < width / 2) {
    sendClick("sun");
  } else {
    sendClick("moon");
  }
}

/****************************************************
 *  WRITE TO FIREBASE
 ****************************************************/
function sendClick(team) {
  db.ref("global/" + team + "Points").transaction(v => (v || 0) + 1);

  let id = getPlayerId();
  db.ref("players/" + id + "/contribution/" + team)
    .transaction(v => (v || 0) + 1);
}

