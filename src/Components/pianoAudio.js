const audioContext = require.context('../assets/pianosound', false, /\.mp3$/);

const audioFiles = [];

audioContext.keys().forEach((key, index) => {
  const audio = new Audio(audioContext(key));
  audioFiles.push(audio);
});

export default audioFiles;