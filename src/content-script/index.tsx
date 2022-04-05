import React, {useEffect, useRef, useState} from 'react';
import {createRoot} from 'react-dom/client';

import styles from 'bootstrap/scss/bootstrap.scss';
import {Card} from 'react-bootstrap';

function connectToDeepgram(
  audioRecorder: MediaRecorder,
  dgApiKey: string,
  audioLang: string
) {
  const sock = new WebSocket(
    `wss://api.deepgram.com/v1/listen?language=${audioLang}`,
    ['token', dgApiKey]
  );

  sock.addEventListener('open', () => {
    audioRecorder.addEventListener('dataavailable', async evt => {
      if (evt.data.size > 0 && sock.readyState === 1) sock.send(evt.data);
    });
    audioRecorder.start(250);
  });

  sock.addEventListener('close', () => {
    audioRecorder.stream.getAudioTracks().forEach(track => track.stop());
    audioRecorder.stop();
  });

  const audioTracks = audioRecorder.stream.getAudioTracks();
  audioTracks[0].addEventListener('ended', () => {
    sock.close();
  });

  return sock;
}

async function startCaptioning(dgApiKey: string, audioLang: string) {
  const stream = await navigator.mediaDevices.getDisplayMedia({
    video: true,
    audio: true,
  });
  const audioRecorder = new MediaRecorder(stream, {
    mimeType: 'audio/webm',
  });
  return connectToDeepgram(audioRecorder, dgApiKey, audioLang);
}

function Caption(props: {dgSocket: WebSocket}) {
  const [caption, setCaption] = useState('');
  const timerRef = useRef<number>();

  useEffect(() => {
    props.dgSocket.addEventListener('message', ({data}) => {
      const msg = JSON.parse(data);
      const transcript = msg.channel.alternatives[0].transcript;
      // if (transcript && msg.is_final) setCaption(transcript);
      if (transcript) setCaption(transcript);
      if (timerRef.current !== null) clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => setCaption(''), 5 * 1000);
    });

    props.dgSocket.addEventListener('close', () => setCaption(''));
  }, [props.dgSocket]);

  return caption.length ? (
    <Card
      style={{
        backgroundColor: '#000',
        color: '#fff',
        fontSize: '24px',
        zIndex: 9999,
      }}
      className="position-fixed bottom-0 w-75 start-50 translate-middle border border-4 border-danger"
    >
      <Card.Body>{caption}</Card.Body>
    </Card>
  ) : null;
}

function appendCaptioner(dgSocket: WebSocket) {
  const captioner = document.querySelector('#captioner');
  if (!captioner) {
    const captionerEl = document.createElement('div');
    captionerEl.id = 'captioner';
    const captionerShadowEl = captionerEl.attachShadow({mode: 'open'});
    styles.use({
      target: captionerShadowEl,
    });
    const root = createRoot(captionerShadowEl);
    root.render(<Caption dgSocket={dgSocket} />);
    document.body.appendChild(captionerEl);
  }
}

chrome.runtime.onMessage.addListener(async msg => {
  if (msg.type === 'startCaptioning') {
    const socket = await startCaptioning(msg.deepgramApiKey, msg.audioLang);
    appendCaptioner(socket);
  }
});
