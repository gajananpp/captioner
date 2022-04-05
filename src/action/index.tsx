import React, {useEffect, useState} from 'react';
import ReactDOM from 'react-dom';

import styles from 'bootstrap/scss/bootstrap.scss';
import {Button, Form} from 'react-bootstrap';

const langs: {[langCode: string]: string} = {
  'zh-CN': 'Mandarin(China)',
  'zh-TW': 'Mandarin(Taiwan)',
  nl: 'Dutch',
  'en-US': 'English(US)',
  'en-AU': 'English(Australia)',
  'en-GB': 'English(UK)',
  'en-IN': 'English(India)',
  'en-NZ': 'English(New Zealand)',
  fr: 'French',
  'fr-CA': 'French(Canada)',
  de: 'German',
  hi: 'Hindi',
  id: 'Indonesian',
  it: 'Italian',
  ja: 'Japan',
  ko: 'Korean',
  pt: 'Portuguese',
  'pt-BR': 'Portuguese(Brazil)',
  ru: 'Russian',
  es: 'Spanish',
  'es-419': 'Spanish(Latin America)',
  sv: 'Swedish',
  tr: 'Turkish',
  uk: 'Ukrainian',
};

const App = () => {
  const [params, setParams] = useState<{[key: string]: string}>({
    deepgramApiKey: '',
    audioLang: 'en-US',
  });

  useEffect(() => {
    styles.use({
      target: document.head,
    });
  }, []);

  const startCaptioning = async () => {
    chrome.runtime.sendMessage({type: 'startCaptioning', ...params});
  };

  const handleParamChange = async (
    evt: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setParams(currState => ({
      ...currState,
      [evt.target.name]: evt.target.value,
    }));
  };

  return (
    <Form className="p-4 d-flex flex-column justify-content-center gap-3">
      <Form.Group>
        <Form.Label>Deepgram API Key</Form.Label>
        <Form.Control
          name="deepgramApiKey"
          onChange={handleParamChange}
          type="text"
          value={params.deepgramApiKey}
          placeholder="Paste Deepgram API key here"
        ></Form.Control>
      </Form.Group>
      <Form.Group>
        <Form.Label>Language of the audio</Form.Label>
        <Form.Select
          name="audioLang"
          onChange={handleParamChange}
          value={params.audioLang}
        >
          {Object.keys(langs).map((lang, idx) => (
            <option key={idx} value={lang}>
              {langs[lang]}
            </option>
          ))}
        </Form.Select>
      </Form.Group>
      <Button onClick={startCaptioning} variant="primary">
        Start captioning
      </Button>
    </Form>
  );
};

ReactDOM.render(<App />, document.querySelector('#root'));
