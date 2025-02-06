let mediaRecorder;
let videoUrl;
let recordedChunks = [];
let timerInterval;
let recordingDuration = 0;
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
let currentStreams = [];  // To store the active streams for cleanup
const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
const modifierKey = isMac ? 'metaKey' : 'ctrlKey';
const startShortcut = document.getElementById('startShortcut');
const stopShortcut = document.getElementById('stopShortcut');
const pauseBtn = document.getElementById('pauseBtn');
const recordingControls = document.getElementById('recordingControls');

// Update shortcuts display
startShortcut.textContent = `${isMac ? '⌘' : 'Ctrl'} + R`;
stopShortcut.textContent = `${isMac ? '⌘' : 'Ctrl'} + S`;

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
     // Start recording with Cmd/Ctrl + R
     if (e[modifierKey] && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        const startBtn = document.getElementById('startBtn');
        if (!startBtn.disabled) {
            startBtn.click();
        }
    }
    
    // Stop recording with Cmd/Ctrl + S
    if (e[modifierKey] && e.key.toLowerCase() === 's') {
        e.preventDefault();
        const stopBtn = document.getElementById('stopBtn');
        if (!stopBtn.disabled) {
            stopBtn.click();
        }
    }
    
    // Discard recording with Escape
    if (e.key === 'Escape') {
        const discardBtn = document.getElementById('discardBtn');
        if (discardBtn && !discardBtn.closest('#videoPreview').classList.contains('hidden')) {
            discardBtn.click();
        }
    }
});

// Start recording
startBtn.addEventListener('click', async () => {
    hideErrorMessage();
    startRecording();
});

// Stop recording
stopBtn.addEventListener('click', () => {
    stopRecording();
});

// pause button event listener
pauseBtn.addEventListener('click', () => {
    if (mediaRecorder.state === 'recording') {
        pauseRecording();
        pauseBtn.textContent = '▶ Resume';
        pauseBtn.classList.remove('bg-yellow-500', 'hover:bg-yellow-600');
        pauseBtn.classList.add('bg-green-500', 'hover:bg-green-600');
    } else if (mediaRecorder.state === 'paused') {
        resumeRecording();
        pauseBtn.textContent = '⏸ Pause';
        pauseBtn.classList.remove('bg-green-500', 'hover:bg-green-600');
        pauseBtn.classList.add('bg-yellow-500', 'hover:bg-yellow-600');
    }
});

// timer functions
function startTimer() {
    recordingDuration = 0;
    updateTimerDisplay();
    timerInterval = setInterval(() => {
        recordingDuration++;
        updateTimerDisplay();
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
    recordingDuration = 0;
    updateTimerDisplay();
}

function updateTimerDisplay() {
    const hours = Math.floor(recordingDuration / 3600);
    const minutes = Math.floor((recordingDuration % 3600) / 60);
    const seconds = recordingDuration % 60;
    const timerDisplay = document.getElementById('timerDisplay');
    timerDisplay.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Add pause/resume functions
function pauseRecording() {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.pause();
        clearInterval(timerInterval);
    }
}

function resumeRecording() {
    if (mediaRecorder && mediaRecorder.state === 'paused') {
        mediaRecorder.resume();
        startTimer();
    }
}

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
        startTimer();
        recordingControls.classList.remove('hidden');
    } catch (error) {
        toggleButtonState(startBtn, 'active');
        toggleButtonState(stopBtn, 'disabled');
        handleMediaError(error);
    }
}

// Stop the recording and cleanup
function stopRecording() {
    stopTimer();
    recordingControls.classList.add('hidden');

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
    errorContainer.style.display = 'block';

    errorContainer.innerHTML = message;
}

function hideErrorMessage() {
    let errorContainer = document.getElementById("error-message");
    if (errorContainer) {
        errorContainer.style.display = 'none';
    }
}
