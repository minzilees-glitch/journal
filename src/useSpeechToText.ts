import { requireOptionalNativeModule } from 'expo';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

type Options = {
  onTranscript: (text: string) => void;
};

type ResultEvent = {
  isFinal?: boolean;
  results?: { transcript?: string }[];
};

type ErrorEvent = {
  error?: string;
  message?: string;
};

type SpeechNative = {
  requestPermissionsAsync?: () => Promise<{ granted: boolean }>;
  start: (options: Record<string, unknown>) => void;
  stop: () => void;
  addListener: (
    event: string,
    listener: (event: ResultEvent & ErrorEvent) => void,
  ) => { remove: () => void };
};

type WebSpeechCtor = new () => {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onresult: ((event: {
    resultIndex: number;
    results: ArrayLike<{ isFinal?: boolean; 0: { transcript: string } }>;
  }) => void) | null;
  start: () => void;
  stop: () => void;
};

function getNativeSpeech(): SpeechNative | null {
  try {
    return requireOptionalNativeModule<SpeechNative>('ExpoSpeechRecognition');
  } catch {
    return null;
  }
}

function getWebSpeechCtor(): WebSpeechCtor | null {
  if (typeof window === 'undefined') return null;
  const runtime = window as Window & {
    SpeechRecognition?: WebSpeechCtor;
    webkitSpeechRecognition?: WebSpeechCtor;
  };
  return runtime.SpeechRecognition ?? runtime.webkitSpeechRecognition ?? null;
}

const nativeSpeech = getNativeSpeech();

export function useSpeechToText({ onTranscript }: Options) {
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const onTranscriptRef = useRef(onTranscript);
  const webRecognitionRef = useRef<InstanceType<WebSpeechCtor> | null>(null);
  onTranscriptRef.current = onTranscript;

  const WebSpeech = Platform.OS === 'web' ? getWebSpeechCtor() : null;

  useEffect(() => {
    if (!nativeSpeech) return;

    const startSub = nativeSpeech.addListener('start', () => {
      setListening(true);
      setError(null);
    });
    const endSub = nativeSpeech.addListener('end', () => {
      setListening(false);
    });
    const resultSub = nativeSpeech.addListener('result', (event) => {
      const transcript = event.results?.[0]?.transcript?.trim();
      if (!transcript || !event.isFinal) return;
      onTranscriptRef.current(transcript);
    });
    const errorSub = nativeSpeech.addListener('error', (event) => {
      setListening(false);
      if (event.error === 'aborted' || event.error === 'no-speech') return;
      setError(event.message || event.error || '음성을 인식하지 못했습니다.');
    });

    return () => {
      startSub.remove();
      endSub.remove();
      resultSub.remove();
      errorSub.remove();
    };
  }, []);

  const start = useCallback(async () => {
    setError(null);

    if (WebSpeech) {
      try {
        const recognition = new WebSpeech();
        recognition.lang = 'ko-KR';
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.onstart = () => setListening(true);
        recognition.onend = () => {
          setListening(false);
          webRecognitionRef.current = null;
        };
        recognition.onerror = (event) => {
          setListening(false);
          if (event.error === 'aborted' || event.error === 'no-speech' || event.error === 'not-allowed') {
            if (event.error === 'not-allowed') setError('마이크 권한이 필요합니다.');
            return;
          }
          setError('음성을 인식하지 못했습니다.');
        };
        recognition.onresult = (event) => {
          for (let index = event.resultIndex; index < event.results.length; index += 1) {
            const result = event.results[index];
            const transcript = result?.[0]?.transcript?.trim();
            if (result.isFinal && transcript) {
              onTranscriptRef.current(transcript);
            }
          }
        };
        webRecognitionRef.current = recognition;
        recognition.start();
        return;
      } catch {
        setError('이 환경에서는 음성을 아직 쓸 수 없습니다.');
        return;
      }
    }

    if (nativeSpeech) {
      try {
        const permission = nativeSpeech.requestPermissionsAsync
          ? await nativeSpeech.requestPermissionsAsync()
          : { granted: true };
        if (!permission.granted) {
          setError('마이크 권한이 필요합니다.');
          return;
        }
        nativeSpeech.start({
          lang: 'ko-KR',
          interimResults: false,
          continuous: true,
          addsPunctuation: true,
        });
      } catch {
        setError('이 환경에서는 음성을 아직 쓸 수 없습니다.');
      }
      return;
    }

    setError('이 미리보기에서는 음성을 아직 쓸 수 없습니다.');
  }, [WebSpeech]);

  const stop = useCallback(() => {
    try {
      webRecognitionRef.current?.stop();
      nativeSpeech?.stop();
    } catch {
      setListening(false);
    }
  }, []);

  const toggle = useCallback(() => {
    if (listening) {
      stop();
      return;
    }
    void start();
  }, [listening, start, stop]);

  return { listening, error, toggle };
}
