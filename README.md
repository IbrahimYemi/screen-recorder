# Screen Recorder

A simple screen recorder built with HTML, Tailwind CSS, and JavaScript. This app allows users to record their screen with audio, providing an easy way to capture screen activities.

## Features

- **Record Screen**: Capture both screen video and microphone audio.
- **Download Recording**: After stopping the recording, you can download the video as a `.webm` file.
- **Responsive UI**: Built using Tailwind CSS, making it mobile-friendly and responsive.

## How It Works

1. **Start Recording**: Click the **Start Recording** button to begin capturing your screen and microphone audio.
2. **Stop Recording**: Once finished, click the **Stop Recording** button to stop the recording.
3. **Download**: After stopping the recording, a download link will appear, allowing you to download the recorded video.

## Prerequisites

- A modern web browser that supports the `MediaRecorder` API.
- Microphone and screen-sharing permissions granted in your browser.

## Setup

1. Clone this repository:

    ```bash
    git clone https://github.com/your-repo/screen-recorder.git
    cd screen-recorder
    ```

2. Open `index.html` in your browser to use the screen recorder.

## File Structure

- **index.html**: Contains the main UI structure.
- **script.js**: Contains the logic to start/stop recording and handle errors.
- **tailwind.css (via CDN)**: For styling the UI.

## Usage

- **Start Recording**: Click the **Start Recording** button. You will be prompted to grant permissions to share your screen and microphone.
- **Stop Recording**: Once you're done, click the **Stop Recording** button to stop the recording.
- **Download Recording**: The **Download Recording** link will appear. Click it to download the `.webm` video file.

## Error Handling

In case of issues with accessing your device media, an error message will appear, prompting you to check your permissions.

## Demo

Check out the live demo: [Demo Link](#)

## Contributing

Feel free to fork and improve this project! If you encounter any issues or have suggestions, open an issue or submit a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgements

- Tailwind CSS for beautiful, responsive design.
- The `MediaRecorder` API for recording audio and video streams.

---

Made with ❤️ by [Ibrahim Yemi](https://github.com/IbrahimYemi)

⭐ If you like this project, consider giving it a star on [GitHub](https://github.com/IbrahimYemi/screen-recorder.git)!
