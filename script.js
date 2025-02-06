let mediaRecorder;
let recordedChunks = [];

document.getElementById('startBtn').addEventListener('click', async () => {
    try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });

        // Merge screen and microphone audio
        const combinedStream = new MediaStream([
            ...screenStream.getVideoTracks(),
            ...audioStream.getAudioTracks()
        ]);

        mediaRecorder = new MediaRecorder(combinedStream);
        
        mediaRecorder.ondataavailable = event => recordedChunks.push(event.data);
        
        mediaRecorder.onstop = () => {
            const blob = new Blob(recordedChunks, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            const downloadLink = document.getElementById('downloadLink');
            downloadLink.href = url;
            downloadLink.classList.remove('hidden');
        };

        mediaRecorder.start();
        document.getElementById('startBtn').disabled = true;
        document.getElementById('stopBtn').disabled = false;
    } catch (error) {
        displayErrorMessage(error ? error : "⚠️ Oops! Can't access your device media. Please check your permissions.");
        console.error("Error accessing media devices.", error);
    }
});

document.getElementById('stopBtn').addEventListener('click', () => {
    mediaRecorder.stop();
    document.getElementById('startBtn').disabled = false;
    document.getElementById('stopBtn').disabled = true;
});

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