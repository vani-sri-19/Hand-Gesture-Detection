//Hand Gesture Detection for certain gestures using MediaPipe API.

//CSS Elements
$('body').css("margin", "20px");
$('body').css("padding", "20px");
document.body.style.background = "#ffffcc";

// Add Canvas and Video Elements to the DOM
document.write(`

    <h1>Hand Gesture Detection (MediaPipe)</h1>
    <p>This world uses MediaPipe to detect the following hand gestures:</p>
    <ul>
        <li>Thumbs Up</li>
        <li>V (Peace)</li>
        <li>I Love You</li>
        <li>Fist</li>
        <li>Hello</li>
    </ul>
    <canvas id="mediaPipeCanvas" style="width: 640px; height: 480px; border: 1px solid black;"></canvas>
`);

// Load MediaPipe Hands library
const handsScript = document.createElement('script');
handsScript.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/hands';
handsScript.onload = () => {
    console.log('MediaPipe Hands library loaded successfully!');
    initializeHands(); // Initialize hands after library is loaded
};
document.head.appendChild(handsScript);

// Load MediaPipe Camera library
const cameraScript = document.createElement('script');
cameraScript.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils';
cameraScript.onload = () => {
    console.log('MediaPipe Camera Utils library loaded successfully!');
};
document.head.appendChild(cameraScript);

let hands;

// Function to initialize MediaPipe Hands
function initializeHands() {
    hands = new Hands({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
        maxNumHands: 1, // Detect one hand
        modelComplexity: 1, // High-quality model
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
    });

    hands.onResults(onResults);
    console.log('MediaPipe Hands initialized!');
}

// Set up video and canvas elements
const videoElement = document.createElement('video');
videoElement.style.display = 'none'; // Hide video element
videoElement.autoplay = true;
document.body.appendChild(videoElement);

const canvasElement = document.getElementById('mediaPipeCanvas');
const canvasCtx = canvasElement.getContext('2d');

async function startCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoElement.srcObject = stream;

    const camera = new Camera(videoElement, {
        onFrame: async () => {
            if (hands) await hands.send({ image: videoElement });
        },
        width: 640,
        height: 480,
    });
    camera.start();
}

let lastGesture = ""; // Track the last detected gesture
let cooldown = false; // Cooldown flag to prevent rapid detections

// Declare variables
if (typeof sentence === "undefined") {
    var sentence = "";
}
if (typeof stableGesture === "undefined") {
    var stableGesture = ""; // Stores the currently stable gesture
}
if (typeof stabilityCounter === "undefined") {
    var stabilityCounter = 0; // Counter for stabilizing gestures
}

function onResults(results) {
    let detectedGesture = "";

    // Clear the canvas and draw the video frame
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);

    // Detect single hand gestures
    if (results.multiHandLandmarks.length === 1) {
        const landmarks = results.multiHandLandmarks[0];

        const thumbTip = landmarks[4];
        const thumbBase = landmarks[2];
        const indexTip = landmarks[8];
        const middleTip = landmarks[12];
        const ringTip = landmarks[16];
        const pinkyTip = landmarks[20];

        const indexBase = landmarks[6];
        const middleBase = landmarks[10];
        const ringBase = landmarks[14];
        const pinkyBase = landmarks[18];

        // Thumbs Up
        const isThumbUp =
            thumbTip.y < indexTip.y &&
            thumbTip.y < middleTip.y &&
            thumbTip.y < ringTip.y &&
            thumbTip.y < pinkyTip.y &&
            Math.abs(thumbTip.x - landmarks[6].x) > 0.05;
        if (isThumbUp) {
            detectedGesture = "Thumbs Up";
        }

        // Fist
        const isFist =
            !detectedGesture &&
            thumbTip.y > indexBase.y &&
            indexTip.y > indexBase.y &&
            middleTip.y > middleBase.y &&
            ringTip.y > ringBase.y &&
            pinkyTip.y > pinkyBase.y;
        if (isFist) {
            detectedGesture = "Fist";
        }

        // V Gesture (Peace)
        const isVGesture =
            !detectedGesture &&
            indexTip.y < indexBase.y &&
            middleTip.y < middleBase.y &&
            ringTip.y > ringBase.y &&
            pinkyTip.y > pinkyBase.y;
        if (isVGesture) {
            detectedGesture = "V Gesture (Peace)";
        }

        // Hello (Open palm raised)
        const isHello =
            !detectedGesture &&
            thumbTip.y < thumbBase.y &&
            indexTip.y < indexBase.y &&
            middleTip.y < middleBase.y &&
            ringTip.y < ringBase.y &&
            pinkyTip.y < pinkyBase.y &&
            Math.abs(indexTip.x - middleTip.x) > 0.05 &&
            Math.abs(middleTip.x - ringTip.x) > 0.05;
        if (isHello) {
            detectedGesture = "Hello";
        }

        // I Love You (Thumb, index, and pinky raised)
        const isILoveYou =
            !detectedGesture &&
            thumbTip.y < indexBase.y &&
            indexTip.y < middleBase.y &&
            middleTip.y > ringBase.y &&
            ringTip.y > ringBase.y &&
            pinkyTip.y < ringBase.y;
        if (isILoveYou) {
            detectedGesture = "I Love You";
        }
    }

    // Stabilize the gesture to avoid noise
    if (detectedGesture === stableGesture) {
        stabilityCounter++;
    } else {
        stabilityCounter = 0;
        stableGesture = detectedGesture;
    }

    // Display the gesture on the canvas
    if (detectedGesture) {
        canvasCtx.font = "15px Arial";
        canvasCtx.fillStyle = "red";
        canvasCtx.fillText(`Gesture: ${detectedGesture}`, 10, 30);
    }

    // If the gesture is stable for 3 consecutive frames, add it to the sentence
    if (stabilityCounter >= 3 && stableGesture && !sentence.includes(stableGesture)) {
        sentence = `${stableGesture}! `;
        console.log(`Sentence: ${sentence}`);
        stableGesture = ""; // Reset stable gesture after adding it
        stabilityCounter = 0; // Reset stability counter
    }
}


// Start everything after scripts load
startCamera();
