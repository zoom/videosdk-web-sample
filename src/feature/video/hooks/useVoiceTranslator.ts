import { useCallback, useContext, useEffect } from 'react';
import ZoomContext from '../../../context/zoom-context';
import { message } from 'antd';
import { LiveTranscriptionLanguage } from '@zoom/videosdk';

export function useVoiceTranslator() {
  const zmClient = useContext(ZoomContext);

  const onTranslatedVoiceReceived = useCallback((payload: any) => {
    const { language } = payload;
    const languageEntry = Object.entries(LiveTranscriptionLanguage).find(([, value]) => value === language);
    message.info(`Translated voice received in ${languageEntry?.[0]}`);
  }, []);
  const onUnsupportedLanguage = useCallback((payload: any) => {
    const { displayName, speakingLanguage, listeningLanguage } = payload;
    const languageMapping = Object.entries(LiveTranscriptionLanguage);
    const speakingLanguageEntry = languageMapping.find(([, value]) => value === speakingLanguage);
    const listeningLanguageEntry = languageMapping.find(([, value]) => value === listeningLanguage);
    message.error(
      `Unsupported language pair: ${displayName}'s voice - ${speakingLanguageEntry?.[0]} to ${listeningLanguageEntry?.[0]}`
    );
  }, []);

  useEffect(() => {
    zmClient.on('voice-translator-started', onTranslatedVoiceReceived);
    zmClient.on('voice-translator-unsupported-language-pair', onUnsupportedLanguage);
    return () => {
      zmClient.off('voice-translator-started', onTranslatedVoiceReceived);
      zmClient.off('voice-translator-unsupported-language-pair', onUnsupportedLanguage);
    };
  }, [zmClient, onTranslatedVoiceReceived, onUnsupportedLanguage]);
}
