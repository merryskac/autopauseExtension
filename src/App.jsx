import { useEffect, useRef, useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import * as tf from '@tensorflow/tfjs';
import * as handpose from '@tensorflow-models/handpose';
import * as fp from 'fingerpose';
import Webcam from 'react-webcam';

function App() {
	const webcamRef = useRef(null);
	const canvasRef = useRef(null);
	const pause = useRef(false);
	const detected = useRef(false);
	const isDetecting = useRef(false);
	const [isLoading, setIsLoading] = useState(false);

	const [isPause, setIsPause] = useState(false);

	const drawHand = (predictions, ctx) => {
		if (predictions.length > 0) {
			predictions.forEach((prediction) => {
				const landmarks = prediction.landmarks;

				for (let i = 0; i < landmarks.length; i++) {
					const x = landmarks[i][0];
					const y = landmarks[i][1];

					ctx.beginPath();
					ctx.arc(x, y, 5, 0, 3 * Math.PI);

					ctx.fillStyle = 'indigo';
					ctx.fill();
				}
			});
		}
	};

	const runHandPose = async () => {
		setIsLoading(true);
		const net = await handpose.load();
		console.log('Handpose model loaded.');
		setInterval(() => {
			detect(net);
		}, 1000);
	};

	const detect = async (net) => {
		if (
			typeof webcamRef.current !== 'undefined' &&
			webcamRef.current !== null &&
			webcamRef.current.video.readyState === 4
		) {
			const video = webcamRef.current.video;
			const videoWidth = webcamRef.current.video.videoWidth;
			const videoHeight = webcamRef.current.video.videoHeight;

			// Set video width
			webcamRef.current.video.width = videoWidth;
			webcamRef.current.video.height = videoHeight;

			// Set canvas height and width
			canvasRef.current.width = videoWidth;
			canvasRef.current.height = videoHeight;

			// Make Detections
			const hand = await net.estimateHands(video);
			// console.log(hand);

			const ctx = canvasRef.current.getContext('2d');

			if(hand){
				setIsLoading(false);
			}

			if (hand?.length > 0) {
				const GE = new fp.GestureEstimator([fp.Gestures.ThumbsUpGesture]);
				const gesture = await GE.estimate(hand[0].landmarks, 9);

				if (gesture.gestures !== undefined && gesture.gestures.length > 0) {
					drawHand(hand, ctx);

					isDetecting.current = true;
					// console.log(detected.current !== isDetecting.current)
					if (detected.current !== isDetecting.current) {
						pause.current = !pause.current;
						updateUI(pause.current);
					}
					detected.current = isDetecting.current;
					console.log('pause ', pause.current);
					// console.log('det ', detected.current);

					// console.log(pose);

					const confidence = gesture.gestures.map(
						(prediction) => prediction.confidence
					);
					const maxConfidence = confidence.indexOf(
						Math.max.apply(null, confidence)
					);
				} else {
					isDetecting.current = false;
					detected.current = isDetecting.current;
					// isNowPause.current = !isNowPause
				}
			} else {
				isDetecting.current = false;
				detected.current = isDetecting.current;
			}
		}
	};

	const updateUI = (paused) => {
		setIsPause(paused);
		console.log(paused);
	};

	console.log(isPause);

	const mainFunction = async () => {
		let [tab] = await chrome.tabs.query({ active: true });
		chrome.scripting.executeScript({
			target: { tabId: tab.id },
			args: [webcamRef, isPause],
			func: (webcamRef, isPause) => {
				// console.log(webcamRef.current.video);
				console.log(isPause);
				console.log();
				if (isPause) {
					document.querySelector('video').pause();
				} else {
					document.querySelector('video').play();
				}
			},
		});
	};

	mainFunction();

	useEffect(() => {
		runHandPose();
	}, []);

	return (
		<div className="App">
			{/* <header className="App-header"> */}

			<Webcam
				ref={webcamRef}
				style={{
					// position: "absolute",
					marginLeft: 'auto',
					marginRight: 'auto',
					left: 0,
					right: 0,
					textAlign: 'center',
					zindex: 9,
					width: 240,
					height: 240,
				}}
			/>

			<canvas
				ref={canvasRef}
				style={{
					position: 'absolute',
					marginLeft: 'auto',
					marginRight: 'auto',
					left: 0,
					right: 0,
					textAlign: 'center',
					zindex: 9,
					width: 240,
					height: 240,
				}}
			/>
			<p>{isPause ? 'pause' : 'play'}</p>
			<p>{isLoading ? '...Load hand model, show your hand to camera' : 'All good!'}</p>
			{/* </header> */}
		</div>
	);
}

export default App;
