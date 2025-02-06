let mediaRecorder;
let videoUrl;
let recordedChunks = [];
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
let currentStreams = [];  // To store the active streams for cleanup

// Start recording
startBtn.addEventListener('click', async () => {
    hideErrorMessage();
    startRecording();
});

// Stop recording
stopBtn.addEventListener('click', () => {
    stopRecording();
});

// Start the recording process
async function startRecording() {
    try {
        if (videoUrl) {
            displayErrorMessage("⚠️ Cannot start new recording while previous one is still in preview");
            return;
        }

        toggleButtonState(startBtn, 'disabled');
        toggleButtonState(stopBtn, 'active');

        // Access media streams
        const [screenStream, audioStream] = await Promise.all([
            navigator.mediaDevices.getDisplayMedia({ video: true, audio: true }),
            navigator.mediaDevices.getUserMedia({ audio: true })
        ]);

        screenStream.getTracks().forEach(track => {
            track.onended = function () {
                stopRecording();
            };
        })

        // Combine the screen and audio streams
        const combinedStream = new MediaStream([
            ...screenStream.getVideoTracks(),
            ...audioStream.getAudioTracks()
        ]);

        // Store streams for cleanup later
        currentStreams = [screenStream, audioStream];

        // Initialize media recorder
        mediaRecorder = new MediaRecorder(combinedStream);
        mediaRecorder.ondataavailable = event => recordedChunks.push(event.data);
        mediaRecorder.onstop = handleStopRecording;

        mediaRecorder.start();
        
    } catch (error) {
        toggleButtonState(startBtn, 'active');
        toggleButtonState(stopBtn, 'disabled');
        handleMediaError(error);
    }
}

// Stop the recording and cleanup
function stopRecording() {
    // Stop the media recorder
    mediaRecorder.stop();

    // Stop the tracks from the streams
    currentStreams.forEach(stream => {
        stream.getTracks().forEach(track => track.stop());
    });

    // Clear the current streams array after stopping
    currentStreams = [];
}

// Handle media recording stop
function handleStopRecording() {
    toggleButtonState(startBtn, 'active');
    toggleButtonState(stopBtn, 'disabled');
    
    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    videoUrl = URL.createObjectURL(blob);

    // Show preview
    const previewVideo = document.getElementById('previewVideo');
    previewVideo.src = videoUrl;
    document.getElementById('videoPreview').classList.remove('hidden');

    // Setup download and discard options
    setupDownloadLink();
    setupDiscardButton();
}

function setupDownloadLink() {
    const downloadLink = document.getElementById('downloadLink');
    downloadLink.href = videoUrl;

    document.getElementById('saveBtn').addEventListener('click', () => {
        downloadLink.click();
    });
}

function setupDiscardButton() {
    document.getElementById('discardBtn').addEventListener('click', () => {
        const previewVideo = document.getElementById('previewVideo');
        previewVideo.src = '';
        videoUrl = null;
        recordedChunks = [];
        document.getElementById('videoPreview').classList.add('hidden');
        document.getElementById('downloadLink').classList.add('hidden');
    });
}

function toggleButtonState(button, state) {
    const buttonClasses = {
        startActive: 'bg-green-500 hover:bg-green-600 cursor-pointer',  // Green for start (active)
        stopActive: 'bg-red-500 hover:bg-red-600 cursor-pointer',  // Red for stop (active)
        disabled: 'bg-gray-600 hover:bg-gray-600 cursor-not-allowed'  // Disabled (grey)
    };

    btnStatus = state === 'disabled';
    button.disabled = btnStatus;
    
    if (button === startBtn) {
        oldClass = btnStatus ? buttonClasses.startActive : buttonClasses.disabled;
        newClass = btnStatus ? buttonClasses.disabled : buttonClasses.startActive;
        handleDisabledBtn(startBtn, oldClass, newClass);
    } else if (button === stopBtn) {
        oldClass = btnStatus ? buttonClasses.stopActive : buttonClasses.disabled;
        newClass = btnStatus ? buttonClasses.disabled : buttonClasses.stopActive;
        handleDisabledBtn(stopBtn, oldClass, newClass);
    }
}

function handleDisabledBtn(element, oldClass, newClass) {
    // Split the class strings by space into individual classes
    const oldClasses = oldClass.split(' ');
    const newClasses = newClass.split(' ');

    // Remove old classes
    oldClasses.forEach(className => {
        element.classList.remove(className);
    });

    // Add new classes
    newClasses.forEach(className => {
        element.classList.add(className);
    });
}

// Handle media errors with appropriate messages
function handleMediaError(error) {
    let errorMessage = "⚠️ Oops! Something went wrong.";

    switch (error.name) {
        case "NotAllowedError":
            errorMessage = "⚠️ Permission denied. Please allow access to your screen and microphone.";
            break;
        case "NotFoundError":
            errorMessage = "⚠️ No media devices found. Ensure your device has a screen and microphone.";
            break;
        case "NotSupportedError":
            errorMessage = "⚠️ Screen sharing is not supported on your device or browser.";
            break;
        case "TypeError":
            errorMessage = "⚠️ Device not supported. Try a different device.";
            break;
        default:
            console.error("Error accessing media devices:", error);
    }

    displayErrorMessage(errorMessage);
}

function displayErrorMessage(message) {
    let errorContainer = document.getElementById("error-message");

    if (!errorContainer) {
        errorContainer = document.createElement("div");
        errorContainer.id = "error-message";
        errorContainer.className = "bg-red-500 text-white p-3 rounded-lg mt-4 text-center shadow-md max-w-md";
        document.body.appendChild(errorContainer);
    }

    errorContainer.innerHTML = message;
}

function hideErrorMessage() {
    let errorContainer = document.getElementById("error-message");
    if (errorContainer) {
        errorContainer.style.display = 'none';
    }
}
