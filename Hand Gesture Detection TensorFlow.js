//Hand Gesture Detection for certain gestures using TensorFlow API.

// Load TensorFlow library
const tensorflowScript = document.createElement('script');
tensorflowScript.src = 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs';
tensorflowScript.onload = () => {
    console.log('TensorFlow library loaded successfully!');
};
document.head.appendChild(tensorflowScript);

const tensorflowScript2 = document.createElement('script');
tensorflowScript2.src = 'https://cdn.jsdelivr.net/npm/@tensorflow-models/handpose';
tensorflowScript2.onload = () => {
    console.log('TensorFlow Handpose library loaded successfully!');
};
document.head.appendChild(tensorflowScript2);

//CSS Elements
$('body').css( "margin", "20px" );
$('body').css( "padding", "20px" );
document.body.style.background = "#ffffcc";

// Add Canvas to the DOM
document.write(`
    <h1>Hand Gesture Detection (TensorFlow)</h1>
    <p>This world uses tensorflow to detect the following hand gestures:</p>
    <ul>
        <li>Thumbs Up</li>
        <li>V (Peace)</li>
        <li>I Love You</li>
        <li>Hello</li>
        <li>Thumbs Down</li>
    </ul>
    <p>[Please Wait for few seconds/Refresh The Page until the Video Element loads]</p>
    <canvas id="tensorflowCanvas" style="width: 640px; height: 480px; border: 1px solid black;"></canvas>
`);

// Global variables
let handposeModel; // TensorFlow model
const tensorflowCanvas = document.getElementById('tensorflowCanvas');
const tensorflowCtx = tensorflowCanvas.getContext('2d');

// Initialize TensorFlow Handpose
async function initializeTensorFlow() {
    handposeModel = await handpose.load();
    console.log('TensorFlow Handpose model loaded.');
}

// Process frame using TensorFlow
async function processTensorFlow(videoElement) {
    if (handposeModel) {
        const predictions = await handposeModel.estimateHands(videoElement);
        tensorflowCtx.clearRect(0, 0, tensorflowCanvas.width, tensorflowCanvas.height);
        tensorflowCtx.drawImage(videoElement, 0, 0, tensorflowCanvas.width, tensorflowCanvas.height);
        let gesture = "";
        if (predictions.length > 0) {
            predictions.forEach((prediction) => {
                drawHand(prediction.landmarks, tensorflowCtx, "blue");
                gesture = detectGestureFromTensorFlow(prediction.landmarks);
            });
        }
        displayText(tensorflowCtx, gesture, 10, 30, "blue");
    }
    requestAnimationFrame(() => processTensorFlow(videoElement));
}

// Utility function to draw blue dots to display hand landmarks
function drawHand(landmarks, ctx, color) {
    ctx.fillStyle = color;
    landmarks.forEach(([x, y]) => {
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fill();
    });
}

// Utility function to display text
function displayText(ctx, text, x, y, color) {
    ctx.font = "15px Arial";
    ctx.fillStyle = color;
    ctx.fillText(`Gesture: ${text}`, x, y);
}

// Detect gestures for TensorFlow landmarks
function detectGestureFromTensorFlow(landmarks) {
    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];
    const middleTip = landmarks[12];
    const ringTip = landmarks[16];
    const pinkyTip = landmarks[20];

    const thumbBase = landmarks[2];
    const indexBase = landmarks[5];
    const middleBase = landmarks[9];
    const ringBase = landmarks[13];
    const pinkyBase = landmarks[17];

    // Thumbs Up
    if (thumbTip[1] < indexTip[1] && thumbTip[1] < middleTip[1]) {
        return "Thumbs Up";
    }

    // Peace Gesture
    if (
        indexTip[1] < ringTip[1] && indexTip[1] < pinkyTip[1] &&
        middleTip[1] < ringTip[1] && middleTip[1] < pinkyTip[1] &&
        ringTip[1] > indexTip[1] && pinkyTip[1] > indexTip[1]
    ) {
        return "Peace";
    }

    // I Love You Gesture
    if (
        thumbTip[1] < middleBase[1] &&
        indexTip[1] < middleBase[1] &&
        middleTip[1] > middleBase[1] &&
        ringTip[1] > ringBase[1] &&
        pinkyTip[1] < ringBase[1]
    ) {
        return "I Love You";
    }

    // Hello (Flat Hand)
    if (
        thumbTip[1] < thumbBase[1] &&
        indexTip[1] < indexBase[1] &&
        middleTip[1] < middleBase[1] &&
        ringTip[1] < ringBase[1] &&
        pinkyTip[1] < pinkyBase[1]
    ) {
        return "Hello";
    }

    // Thumbs Down
    if (thumbTip[1] > indexTip[1] && thumbTip[1] > middleTip[1]) {
        return "Thumbs Down";
    }
    return "No Gesture";
}

// Start the webcam and process frames
const videoElement = document.createElement('video');
videoElement.style.display = 'none'; // Hide the video element
videoElement.autoplay = true;
document.body.appendChild(videoElement);

// Start camera and TensorFlow processing
async function startCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoElement.srcObject = stream;

    initializeTensorFlow();

    // Start TensorFlow processing
    processTensorFlow(videoElement);
}

// Start the system
startCamera();