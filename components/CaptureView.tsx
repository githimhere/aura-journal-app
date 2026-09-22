import React, { useState, useRef, useEffect } from 'react';
import { NeuButton, NeuTextArea, GlassCard, NeuInput } from './UIComponents';
import { fileToBase64, compressImage } from '../services/imageUtils';
import { ViewState } from '../types';

interface Props {
  mode: ViewState;
  onSave: (type: 'photo' | 'text' | 'audio', content: string | null, note: string, audioBlob?: string, mimeType?: string) => void;
  onCancel: () => void;
}

export const CaptureView: React.FC<Props> = ({ mode, onSave, onCancel }) => {
  const [image, setImage] = useState<string | null>(null);
  const [audioData, setAudioData] = useState<string | null>(null);
  const [recordedMimeType, setRecordedMimeType] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  // Photo Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Audio Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    // Auto-trigger camera if in photo mode and no image yet
    if (mode === ViewState.CAPTURE_PHOTO && !image) {
      fileInputRef.current?.click();
    }
  }, [mode, image]);

  // --- Photo Handlers ---
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsProcessing(true);
      try {
        const base64 = await fileToBase64(e.target.files[0]);
        const compressed = await compressImage(base64);
        setImage(compressed);
      } catch (err) {
        console.error("Image processing error", err);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  // --- Audio Handlers (iOS Fixed) ---
  
  const getSupportedMimeType = () => {
    if (typeof MediaRecorder === 'undefined') return undefined;
    
    // iOS Safari typically supports mp4/aac. 
    // Chrome/Android typically supports webm.
    const types = [
      'audio/mp4',
      'audio/aac',
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/wav'
    ];
    
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    return undefined; // Let browser choose default
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mimeType = getSupportedMimeType();
      const options = mimeType ? { mimeType } : undefined;

      // Initialize with supported type
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Use the mime type that was actually used
        const finalMimeType = mediaRecorder.mimeType || mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: finalMimeType });
        const base64Audio = await fileToBase64(audioBlob);
        
        setAudioData(base64Audio);
        setRecordedMimeType(finalMimeType);
        
        // Stop all tracks to release mic
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err: any) {
      console.error("Error accessing microphone", err);
      let msg = "Could not access microphone.";
      if (err.name === 'NotAllowedError') msg = "Permission denied. Please allow microphone access in your settings.";
      else if (err.name === 'NotFoundError') msg = "No microphone found.";
      else if (err.name === 'NotSupportedError') msg = "Audio recording is not supported on this device/browser.";
      
      alert(msg);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // --- Save Handler ---
  const handleSave = () => {
    if (mode === ViewState.CAPTURE_PHOTO) {
      if (image) onSave('photo', image, note);
    } else if (mode === ViewState.CAPTURE_TEXT) {
      if (note.trim()) onSave('text', null, note);
    } else if (mode === ViewState.CAPTURE_AUDIO) {
      // Pass the detected mime type up to App.tsx
      if (audioData) onSave('audio', null, note || 'Audio Note', audioData, recordedMimeType || undefined);
    }
  };

  // --- RENDERERS ---

  // 1. Photo Mode
  if (mode === ViewState.CAPTURE_PHOTO) {
    if (!image) {
      return (
        <div className="h-full flex flex-col items-center justify-center animate-fade-in p-6">
          <input 
            type="file" 
            ref={fileInputRef} 
            accept="image/*" 
            capture="environment" 
            className="hidden" 
            onChange={handleFileChange}
          />
          <div className="text-center space-y-4">
             <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full mx-auto flex items-center justify-center animate-pulse">
               <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
             </div>
             <p className="text-gray-500">Opening Camera...</p>
             <NeuButton onClick={onCancel} variant="default">Cancel</NeuButton>
          </div>
        </div>
      );
    }

    return (
      <div className="h-full flex flex-col p-4 animate-fade-in pb-24 overflow-y-auto">
        <GlassCard className="mb-6 overflow-hidden rounded-3xl">
          <img src={image} alt="Preview" className="w-full max-h-[50vh] object-contain bg-black/5" />
        </GlassCard>
        <div className="space-y-4">
          <NeuTextArea 
            placeholder="Add a caption to this moment..." 
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            autoFocus
          />
          <div className="flex gap-4 mt-4">
             <NeuButton onClick={() => setImage(null)} className="flex-1" variant="danger">Retake</NeuButton>
             <NeuButton onClick={handleSave} className="flex-1" variant="primary">Save Snap</NeuButton>
          </div>
        </div>
      </div>
    );
  }

  // 2. Text Mode
  if (mode === ViewState.CAPTURE_TEXT) {
    return (
      <div className="h-full flex flex-col p-6 animate-fade-in pb-24">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Yap it out 📝</h2>
        <GlassCard className="flex-1 p-4 mb-6 flex flex-col">
          <textarea 
            className="w-full h-full bg-transparent resize-none outline-none text-lg text-gray-700 dark:text-gray-200 placeholder-gray-400"
            placeholder="Dear Diary, today the vibes were..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            autoFocus
          />
        </GlassCard>
        <div className="flex gap-4">
           <NeuButton onClick={onCancel} className="flex-1">Cancel</NeuButton>
           <NeuButton onClick={handleSave} disabled={!note.trim()} className="flex-1" variant="primary">Save Note</NeuButton>
        </div>
      </div>
    );
  }

  // 3. Audio Mode
  if (mode === ViewState.CAPTURE_AUDIO) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 animate-fade-in pb-24">
         
         {!audioData ? (
           <>
             <div className={`relative w-48 h-48 rounded-full flex items-center justify-center transition-all duration-500 ${isRecording ? 'bg-red-50 shadow-[0_0_50px_rgba(239,68,68,0.4)]' : 'bg-gray-100 dark:bg-gray-800'}`}>
                {isRecording && (
                  <div className="absolute inset-0 rounded-full border-4 border-red-400 animate-ping opacity-20"></div>
                )}
                <button 
                  onClick={isRecording ? stopRecording : startRecording}
                  className="z-10 p-8 rounded-full bg-neu-base dark:bg-gray-700 shadow-lg hover:scale-105 transition-transform"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-16 h-16 ${isRecording ? 'text-red-500' : 'text-gray-400'}`}>
                    <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
                    <path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.751 6.751 0 01-6 6.709v2.291h3a.75.75 0 010 1.5h-7.5a.75.75 0 010-1.5h3v-2.291a6.751 6.751 0 01-6-6.709v-1.5A.75.75 0 016 10.5z" />
                  </svg>
                </button>
             </div>
             <p className="mt-8 text-xl font-bold text-gray-600 dark:text-gray-300">
               {isRecording ? 'Listening...' : 'Tap to Record'}
             </p>
             {isRecording && <p className="text-red-400 text-sm animate-pulse mt-2">Recording Audio...</p>}
             <NeuButton onClick={onCancel} className="mt-12 w-full max-w-xs">Cancel</NeuButton>
           </>
         ) : (
           <div className="w-full space-y-6">
             <GlassCard className="p-6 text-center">
                <h3 className="text-lg font-bold mb-4">Audio Captured! 🎤</h3>
                {/* Audio Preview */}
                <audio controls src={audioData} className="w-full" />
             </GlassCard>
             <NeuInput 
               placeholder="Give this rant a title (optional)"
               value={note}
               onChange={(e) => setNote(e.target.value)}
             />
             <div className="flex gap-4">
               <NeuButton onClick={() => setAudioData(null)} className="flex-1" variant="danger">Delete</NeuButton>
               <NeuButton onClick={handleSave} className="flex-1" variant="primary">Save Audio</NeuButton>
            </div>
           </div>
         )}
      </div>
    );
  }

  return null;
};
