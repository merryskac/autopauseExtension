let videoStream;

chrome.contentSettings.camera.set(
  {
    primaryPattern: 'https://*.youtube.com/*',
    setting: 'allow',
    resourceIdentifier: { id: 'camera' },
  },
  () => {
    // console.log('camera set');
  }
);

chrome.tabs.onUpdated.addListener((tabId, data, tab) => {
	// console.log(tab.url);
	if (tab.url && tab.url.includes('youtube.com/watch')) {

		chrome.scripting.executeScript({
			target: { tabId: tabId },
			function: () => {
				// console.log('camera rolling')
				// navigator.mediaDevices
				// 	.getUserMedia({ video: true })
				// 	.then(function (stream) {
				// 		// console.log(stream)
				// 		console.log('stream');
				// 		videoStream = stream;
				// 		chrome.runtime.sendMessage({
				// 			action: 'startStream',
				// 			stream: stream,
				// 		});
				// 		// Lakukan sesuatu dengan aliran video
				// 	})
				// 	.catch(function (error) {
				// 		console.error('Error accessing camera:', error);
				// 	});
			},
		});
		// console.log('youtube');

		// chrome.tabs.sendMessage(tabId, {
		// 	action: 'startStream',
		// 	stream: videoStream,
		// });
	}
});
