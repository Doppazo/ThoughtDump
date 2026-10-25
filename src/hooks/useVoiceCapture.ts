"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";

// Type definitions for Web Speech API
interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
      isFinal: boolean;
      length: number;
    };
    length: number;
  };
}

interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  }
}

export function useVoiceCapture() {
  const { getToken } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(true);

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const useAudioFallbackRef = useRef(false);
  const fullTranscriptRef = useRef("");

  useEffect(() => {
    const hasSpeech = typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);
    setVoiceSupported(Boolean(hasSpeech || (typeof navigator !== "undefined" && navigator.mediaDevices)));
  }, []);

  const startMediaRecorderFallback = async () => {
    try {
      useAudioFallbackRef.current = true;
      audioChunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      let mimeType = "audio/webm";
      if (typeof MediaRecorder !== "undefined") {
        if (MediaRecorder.isTypeSupported("audio/webm")) {
          mimeType = "audio/webm";
        } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
          mimeType = "audio/mp4";
        } else if (MediaRecorder.isTypeSupported("audio/aac")) {
          mimeType = "audio/aac";
        }
      }

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.start(250);
      setIsRecording(true);
      setTranscript("(Recording audio...)");
    } catch (err) {
      console.error("Failed to start MediaRecorder:", err);
      setIsRecording(false);
      setTranscript("");
    }
  };

  const startRecording = useCallback(async () => {
    fullTranscriptRef.current = "";
    setTranscript("");
    useAudioFallbackRef.current = false;

    const SpeechRecognition =
      typeof window !== "undefined" ? window.SpeechRecognition || window.webkitSpeechRecognition : null;

    if (!SpeechRecognition) {
      // Use fallback directly
      await startMediaRecorderFallback();
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event: SpeechRecognitionEventLike) => {
        let interimText = "";
        let finalSegment = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            finalSegment += item[0].transcript + " ";
          } else {
            interimText += item[0].transcript;
          }
        }

        if (finalSegment) {
          fullTranscriptRef.current += finalSegment;
        }

        const currentDisplay = (fullTranscriptRef.current + " " + interimText).trim();
        setTranscript(currentDisplay);
      };

      recognition.onerror = async (event: { error: string }) => {
        console.warn("Speech recognition error:", event.error);
        if (event.error !== "no-speech") {
          // Switch automatically to audio fallback
          recognition.abort();
          recognitionRef.current = null;
          await startMediaRecorderFallback();
        }
      };

      recognition.onend = () => {
        // Recognition completed
      };

      recognition.start();
      setIsRecording(true);
    } catch (e) {
      console.warn("Could not start Web Speech, switching to fallback:", e);
      await startMediaRecorderFallback();
    }
  }, []);

  const stopRecording = useCallback(async (): Promise<string> => {
    setIsRecording(false);

    // If using Web Speech API
    if (recognitionRef.current && !useAudioFallbackRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
      const finalText = fullTranscriptRef.current.trim() || transcript.trim();
      setTranscript(finalText);
      return finalText;
    }

    // If using MediaRecorder fallback
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      setIsTranscribing(true);
      return new Promise((resolve) => {
        const recorder = mediaRecorderRef.current!;

        recorder.onstop = async () => {
          try {
            // Stop mic track
            recorder.stream.getTracks().forEach((track) => track.stop());

            const mimeType = recorder.mimeType || "audio/webm";
            const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });

            if (audioBlob.size === 0) {
              setIsTranscribing(false);
              resolve("");
              return;
            }

            const formData = new FormData();
            formData.append("audio", audioBlob, `recording.${mimeType.includes("mp4") ? "mp4" : "webm"}`);

            const token = await getToken();
            const res = await fetch("/api/transcribe", {
              method: "POST",
              headers: { Authorization: `Bearer ${token}` },
              body: formData,
            });

            if (res.ok) {
              const data = await res.json();
              const text = data.transcript || "";
              setTranscript(text);
              setIsTranscribing(false);
              resolve(text);
            } else {
              setIsTranscribing(false);
              resolve("");
            }
          } catch (err) {
            console.error("Error transcribing audio:", err);
            setIsTranscribing(false);
            resolve("");
          }
        };

        recorder.stop();
      });
    }

    return fullTranscriptRef.current.trim() || transcript.trim();
  }, [transcript, getToken]);

  return {
    isRecording,
    transcript,
    isTranscribing,
    voiceSupported,
    startRecording,
    stopRecording,
    setTranscript,
  };
}
