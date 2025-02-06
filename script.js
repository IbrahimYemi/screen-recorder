let mediaRecorder;
let recordedChunks = [];

document.getElementById('startBtn').addEventListener('click', async () => {
    try {
        // Attempt to access screen and audio streams
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });

        // Merge screen and microphone audio
        const combinedStream = new MediaStream([
            ...screenStream.getVideoTracks(),
            ...audioStream.getAudioTracks()
        ]);

        // Initialize media recorder
        mediaRecorder = new MediaRecorder(combinedStream);

        mediaRecorder.ondataavailable = event => recordedChunks.push(event.data);

        mediaRecorder.onstop = () => {
            const blob = new Blob(recordedChunks, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            const downloadLink = document.getElementById('downloadLink');
            downloadLink.href = url;
            downloadLink.classList.remove('hidden');
        };

        // Start recording
        mediaRecorder.start();
        document.getElementById('startBtn').disabled = true;
        document.getElementById('stopBtn').disabled = false;
    } catch (error) {
        handleMediaError(error);
    }
});

document.getElementById('stopBtn').addEventListener('click', () => {
    mediaRecorder.stop();
    document.getElementById('startBtn').disabled = false;
    document.getElementById('stopBtn').disabled = true;
});

// Enhanced error handling function
function handleMediaError(error) {
    let errorMessage = "⚠️ Oops! Something went wrong.";

    if (error.name === "NotAllowedError") {
        errorMessage = "⚠️ Permission to access media was denied. Please allow access to your screen and microphone.";
    } else if (error.name === "NotFoundError") {
        errorMessage = "⚠️ No media devices found. Make sure your device has a screen and microphone available.";
    } else if (error.name === "NotSupportedError") {
        errorMessage = "⚠️ Screen sharing is not supported in this browser or device.";
    } else if (error.name === "TypeError") {
        errorMessage = "⚠️ Device not supported! Please try a different device.";
    } else {
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