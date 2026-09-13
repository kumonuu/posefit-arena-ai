# PoseFit Arena

Build a premium browser-based AI fitness game called “PoseFit Arena” that delivers an engaging sports-training experience with real-time webcam-based motion tracking and responsive exercise feedback. Build the frontend with React and Vite, use the device webcam through the WebRTC/getUserMedia browser API, and use TensorFlow.js with MoveNet pose-detection models to track the player’s body landmarks and recognize exercise movements in real time. The game must accurately detect and count squats, jumps, push-ups, and lunges, validating movements using relevant body-joint positions, angles, and motion states. Maintain a global score variable that automatically increases whenever the player successfully completes a detected exercise repetition, with clear visual feedback for progress and scoring. Include an intuitive interface that makes the experience feel like a polished, premium fitness/sports game rather than a basic workout tracker. Allow players to create custom exercises, defining the exercise name and movement/pose requirements so the AI can track and score them where possible. Structure the application for modern browser performance, responsive design, and smooth real-time inference. Use Lovable for AI-assisted application development, Vite as the build/development tool, and Cloudflare Pages/Workers for production deployment and hosting.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://posefit-arena-ai.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/6bc00fbd-201e-4fb2-aa26-1eac70daa278).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
