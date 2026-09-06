'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';
import {
  Shield,
  ArrowLeft,
  ArrowRight,
  MapPin,
  Camera,
  Mic,
  MicOff,
  Languages,
  CheckCircle2,
  Upload,
  X,
  AlertCircle,
  Loader2,
  Globe,
 Network } from 'lucide-react';
import {
  createReport,
  uploadReportMedia,
  getCategories,
  reverseGeocode,
  translateText,
  transcribeAudio,
} from '@/lib/api';
import type { Category, ReportCreateResponse, ReverseGeocodeResponse } from '@/types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

type Step = 'describe' | 'location' | 'images' | 'review' | 'success';

export default function ReportPage() {
  // Step management
  const [step, setStep] = useState<Step>('describe');

  // Form data
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [description, setDescription] = useState('');
  const [englishDescription, setEnglishDescription] = useState('');
  const [language, setLanguage] = useState('en');
  const [isTranslated, setIsTranslated] = useState(false);

  // Location
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [geocodeResult, setGeocodeResult] = useState<ReverseGeocodeResponse | null>(null);

  // Images
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // Speech
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [transcribing, setTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Translation
  const [translating, setTranslating] = useState(false);

  // Submission
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdReport, setCreatedReport] = useState<ReportCreateResponse | null>(null);

  // Loading categories
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setCategories([]))
      .finally(() => setCategoriesLoading(false));
  }, []);

  // ---------- Speech-to-text ----------
  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach((t) => t.stop());
        // Auto-transcribe
        setTranscribing(true);
        try {
          const file = new File([blob], 'recording.webm', { type: 'audio/webm' });
          const result = await transcribeAudio(file);
          if (result.text) {
            setDescription((prev) => (prev ? prev + ' ' + result.text : result.text));
          }
          if (result.detected_language && result.detected_language !== 'en') {
            setLanguage(result.detected_language);
          }
        } catch {
          // Transcription failed silently - user can type
        } finally {
          setTranscribing(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch {
      // Microphone not available
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  }

  // ---------- Translation ----------
  async function handleTranslate() {
    if (!description.trim() || language === 'en') {
      setEnglishDescription(description);
      setIsTranslated(true);
      return;
    }
    setTranslating(true);
    try {
      const result = await translateText(description, language, 'en');
      setEnglishDescription(result.translated_text);
      setIsTranslated(true);
    } catch {
      setEnglishDescription(description);
      setIsTranslated(true);
    } finally {
      setTranslating(false);
    }
  }

  // ---------- Location ----------
  const requestLocation = useCallback(() => {
    setLocationLoading(true);
    setLocationError(null);
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      setLocationLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setLatitude(lat);
        setLongitude(lng);
        try {
          const geo = await reverseGeocode(lat, lng);
          setGeocodeResult(geo);
        } catch {
          // Geocoding failed - coordinates still available
        }
        setLocationLoading(false);
      },
      (err) => {
        setLocationError(
          err.code === 1
            ? 'Location permission denied. Please allow location access.'
            : 'Unable to determine your location. Please try again.'
        );
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }, []);

  // ---------- Image handling ----------
  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(
      (f) => f.type.startsWith('image/') && f.size <= 10 * 1024 * 1024
    );
    setImages((prev) => [...prev, ...validFiles].slice(0, 5));
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreviews((prev) => [...prev, reader.result as string].slice(0, 5));
      };
      reader.readAsDataURL(file);
    });
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  }

  // ---------- Submission ----------
  async function handleSubmit() {
    if (!selectedCategory || !description.trim() || latitude === null || longitude === null) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const finalEnglishDesc = englishDescription || description;
      const report = await createReport({
        category: selectedCategory,
        original_description: description,
        english_description: finalEnglishDesc,
        original_language: language,
        latitude,
        longitude,
        address: geocodeResult?.address,
        locality: geocodeResult?.locality ?? undefined,
        district: geocodeResult?.district ?? undefined,
        state: geocodeResult?.state ?? undefined,
        country: geocodeResult?.country ?? undefined,
      });

      // Upload images
      for (const img of images) {
        try {
          await uploadReportMedia(report.id, img);
        } catch {
          // Continue even if one upload fails
        }
      }

      setCreatedReport(report);
      setStep('success');
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  }

  // ---------- Navigation ----------
  function canProceed(): boolean {
    switch (step) {
      case 'describe':
        return !!selectedCategory && description.trim().length >= 5;
      case 'location':
        return latitude !== null && longitude !== null;
      case 'images':
        return true; // Images are optional
      case 'review':
        return true;
      default:
        return false;
    }
  }

  const steps: Step[] = ['describe', 'location', 'images', 'review'];
  const stepIndex = steps.indexOf(step);

  function nextStep() {
    if (step === 'describe' && language !== 'en' && !isTranslated) {
      handleTranslate();
    }
    if (step === 'describe' && language === 'en') {
      setEnglishDescription(description);
      setIsTranslated(true);
    }
    if (stepIndex < steps.length - 1) {
      setStep(steps[stepIndex + 1]);
      if (steps[stepIndex + 1] === 'location' && latitude === null) {
        requestLocation();
      }
    }
  }

  function prevStep() {
    if (stepIndex > 0) setStep(steps[stepIndex - 1]);
  }

  // ---------- Render ----------
  if (categoriesLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      {/* Navigation Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-indigo-950 rounded-xl flex items-center justify-center border border-indigo-900/50 group-hover:bg-indigo-900 transition-colors">
                <Network className="h-5 w-5 text-cyan-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight leading-none">NASMR</span>
                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] hidden sm:block mt-1">
                  National AI System for Municipal & Regional Development
                </span>
              </div>
            </Link>
            
            <div className="flex items-center gap-4 text-sm font-medium">
              <Link href="/track" className="text-indigo-600 hover:text-indigo-700 transition-colors bg-indigo-50/80 px-4 py-2 rounded-full border border-indigo-100/50 shadow-sm hidden sm:block">
                Track Report
              </Link>
              <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block"></div>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        
        {step !== 'success' && (
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">Report a Civic Issue</h1>
            <p className="text-slate-600 dark:text-slate-300 text-lg max-w-2xl">
              Help improve your community by reporting infrastructure and civic issues. Our AI-assisted platform ensures your report reaches the right authorities.
            </p>

            {/* Progress Indicator */}
            <div className="flex items-center justify-between max-w-2xl mt-8">
              {steps.map((s, i) => {
                const isActive = i === stepIndex;
                const isCompleted = i < stepIndex;
                return (
                  <div key={s} className="flex flex-col items-center relative flex-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold z-10 transition-colors ${
                      isActive ? 'bg-indigo-600 text-white shadow-md' :
                      isCompleted ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-500 dark:text-slate-400'
                    }`}>
                      {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : i + 1}
                    </div>
                    <span className={`text-xs mt-2 font-medium uppercase tracking-wider hidden sm:block ${
                      isActive ? 'text-indigo-900' : 
                      isCompleted ? 'text-indigo-700' : 'text-slate-500 dark:text-slate-400'
                    }`}>
                      {s}
                    </span>
                    {/* Connecting line */}
                    {i < steps.length - 1 && (
                      <div className={`absolute top-4 left-[50%] w-full h-[2px] -z-0 ${
                        isCompleted ? 'bg-indigo-200' : 'bg-slate-200'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          {/* ===== STEP: DESCRIBE ===== */}
          {step === 'describe' && (
            <div className="p-6 sm:p-10 space-y-10">
              
              {/* Category selection */}
              <div>
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">What&apos;s the issue?</h2>
                  <p className="text-slate-500 dark:text-slate-400 mt-1">Select the most accurate category for the problem you&apos;ve observed.</p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.name)}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        selectedCategory === cat.name
                          ? 'border-indigo-500 bg-indigo-50/50 text-indigo-700 shadow-sm ring-1 ring-indigo-500/50'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 hover:border-indigo-300 hover:bg-slate-50 dark:bg-slate-950'
                      }`}
                    >
                      <span className={`block font-medium ${selectedCategory === cat.name ? 'text-indigo-900' : 'text-slate-900 dark:text-slate-100'}`}>
                        {cat.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <div className="flex justify-between items-end mb-3">
                  <label className="block text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                    Description <span className="text-red-500">*</span>
                  </label>
                  
                  {/* Language Selector */}
                  <div className="flex items-center gap-2">
                    <Languages className="h-4 w-4 text-slate-400" />
                    <select
                      value={language}
                      onChange={(e) => {
                        setLanguage(e.target.value);
                        setIsTranslated(false);
                      }}
                      className="text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md py-1 px-2 text-slate-700 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="en">English</option>
                      <option value="es">Español</option>
                      <option value="fr">Français</option>
                      <option value="zh">中文</option>
                      <option value="ar">العربية</option>
                      <option value="hi">हिन्दी</option>
                    </select>
                  </div>
                </div>
                
                <div className="relative">
                  <textarea
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value);
                      setIsTranslated(false);
                    }}
                    rows={6}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-slate-900 dark:text-slate-100 focus:ring-indigo-500 focus:border-indigo-500 resize-y transition-colors"
                    placeholder="Please describe the issue in detail. Include any helpful landmarks, severity indicators, or context."
                    minLength={5}
                    maxLength={5000}
                  />
                  
                  {/* Speech button floating inside textarea */}
                  <div className="absolute bottom-4 right-4 flex gap-2">
                    <button
                      type="button"
                      onClick={isRecording ? stopRecording : startRecording}
                      className={`p-2.5 rounded-full shadow-sm transition-all ${
                        isRecording
                          ? 'bg-red-100 text-red-600 hover:bg-red-200 animate-pulse'
                          : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200'
                      }`}
                      title="Dictate description"
                    >
                      {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-2 px-1">
                  <span className={`text-xs ${description.length > 4000 ? 'text-orange-500' : 'text-slate-400'}`}>
                    {description.length}/5000 characters
                  </span>
                  {transcribing && (
                    <span className="text-xs text-indigo-600 flex items-center animate-pulse">
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" /> Processing speech...
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ===== STEP: LOCATION ===== */}
          {step === 'location' && (
            <div className="p-6 sm:p-10 space-y-8">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Where is the issue?</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                  Accurate location data helps authorities respond faster.
                </p>
              </div>

              {locationError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{locationError}</p>
                </div>
              )}

              {/* Automatic Location */}
              {latitude && longitude ? (
                <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start">
                      <div className="bg-indigo-100 p-2 rounded-lg mr-4 mt-1">
                        <MapPin className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">Location Captured</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-300 font-mono">
                          {latitude.toFixed(6)}, {longitude.toFixed(6)}
                        </p>
                        {geocodeResult && (
                          <div className="mt-3">
                            <p className="text-sm font-medium text-slate-800">{geocodeResult.address}</p>
                            {geocodeResult.locality && (
                              <p className="text-xs text-indigo-600 mt-0.5 uppercase font-bold tracking-wider">
                                {geocodeResult.locality}{geocodeResult.district ? `, ${geocodeResult.district}` : ''}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-6">
                    <button onClick={requestLocation} className="text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center transition-colors">
                      <MapPin className="h-4 w-4 mr-1" />
                      Refresh Location
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-slate-300 rounded-2xl p-10 text-center hover:bg-slate-50 dark:bg-slate-950 transition-colors">
                  <MapPin className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600 dark:text-slate-300 mb-6 max-w-md mx-auto">
                    Click the button below to securely share your device&apos;s GPS location.
                  </p>
                  <button onClick={requestLocation} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-slate-800 transition-colors inline-flex items-center shadow-sm">
                    {locationLoading ? (
                      <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> Detecting...</>
                    ) : (
                      <><MapPin className="h-5 w-5 mr-2" /> Share My Location</>
                    )}
                  </button>
                </div>
              )}

              {/* Manual coordinates */}
              <div className="pt-6">
                <p className="text-sm font-bold text-slate-700 mb-4 uppercase tracking-wider">Or enter coordinates manually</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      min={-90}
                      max={90}
                      value={latitude ?? ''}
                      onChange={(e) => setLatitude(e.target.value ? parseFloat(e.target.value) : null)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="e.g., 28.6139"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      min={-180}
                      max={180}
                      value={longitude ?? ''}
                      onChange={(e) => setLongitude(e.target.value ? parseFloat(e.target.value) : null)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="e.g., 77.2090"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===== STEP: IMAGES ===== */}
          {step === 'images' && (
            <div className="p-6 sm:p-10 space-y-8">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Add Photos (Optional)</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                  Upload up to 5 photos. Visual evidence significantly improves prioritization speed.
                </p>
              </div>

              {/* Image upload */}
              <div>
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-2xl p-12 cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 transition-colors">
                  <Camera className="h-12 w-12 text-slate-400 mb-4" />
                  <span className="text-base font-semibold text-slate-700">
                    Click to upload or take a photo
                  </span>
                  <span className="text-sm text-slate-400 mt-2">
                    JPEG, PNG, WebP • Max 10MB each
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    multiple
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Image previews */}
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {imagePreviews.map((src, i) => (
                    <div key={i} className="relative group rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800">
                      <img
                        src={src}
                        alt={`Upload ${i + 1}`}
                        className="object-cover h-40 w-full"
                      />
                      <button
                        onClick={() => removeImage(i)}
                        className="absolute top-2 right-2 p-1.5 bg-slate-900/70 hover:bg-red-600 rounded-lg text-white backdrop-blur-sm transition-colors"
                        aria-label="Remove image"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ===== STEP: REVIEW ===== */}
          {step === 'review' && (
            <div className="p-6 sm:p-10 space-y-8">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Review Your Report</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                  Please verify the details below before submitting to the NASMR network.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
                {/* Category */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 sm:mb-0">Category</span>
                  <span className="text-base font-bold text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 px-3 py-1 rounded-md border border-slate-200 dark:border-slate-800">{selectedCategory}</span>
                </div>

                {/* Description */}
                <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
                  <span className="block text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Description</span>
                  <p className="text-slate-800 leading-relaxed bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">{description}</p>
                  {englishDescription && englishDescription !== description && (
                    <div className="mt-3 bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                      <p className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-2">English Translation</p>
                      <p className="text-sm text-indigo-900">{englishDescription}</p>
                    </div>
                  )}
                </div>

                {/* Location */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 sm:mb-0">Location</span>
                  <span className="text-sm font-medium text-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-800">
                    {geocodeResult?.address || `${latitude?.toFixed(4)}, ${longitude?.toFixed(4)}`}
                  </span>
                </div>

                {/* Photos */}
                <div className="pt-2">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Attached Media</span>
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-200 px-2 py-1 rounded-full">{images.length} photos</span>
                  </div>
                  {imagePreviews.length > 0 && (
                    <div className="flex flex-wrap gap-3 mt-3">
                      {imagePreviews.map((src, i) => (
                        <img
                          key={i}
                          src={src}
                          alt={`Preview ${i + 1}`}
                          className="h-20 w-20 rounded-lg object-cover border border-slate-200 dark:border-slate-800 shadow-sm"
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {submitError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{submitError}</p>
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full bg-indigo-600 text-white font-bold text-lg py-4 rounded-xl hover:bg-indigo-700 transition-colors shadow-md flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-6 w-6 mr-2 animate-spin" />
                    Processing Report...
                  </>
                ) : (
                  <>
                    <Upload className="h-6 w-6 mr-2" />
                    Submit Report to Network
                  </>
                )}
              </button>
            </div>
          )}

          {/* ===== SUCCESS ===== */}
          {step === 'success' && createdReport && (
            <div className="p-10 sm:p-16 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 mb-6 shadow-sm ring-8 ring-emerald-50">
                <CheckCircle2 className="h-10 w-10 text-emerald-600" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-3">Report Submitted Successfully</h2>
              <p className="text-slate-600 dark:text-slate-300 mb-8 max-w-lg mx-auto text-lg">
                Your report has been securely logged into the NASMR network and is currently undergoing AI prioritization.
              </p>
              
              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 mb-8 inline-block shadow-sm">
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Your Tracking Number</p>
                <p className="text-4xl sm:text-5xl font-bold text-indigo-600 font-mono tracking-tight select-all">
                  {createdReport.public_reference}
                </p>
              </div>
              
              <p className="text-slate-500 dark:text-slate-400 mb-10 max-w-md mx-auto">
                Please save this reference number. You can use it at any time to track the status and resolution progress of your issue.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-xl mx-auto">
                <Link href={`/track?q=${createdReport.public_reference}`} className="flex-1 bg-indigo-600 text-white font-bold py-3.5 px-6 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm">
                  Track Report
                </Link>
                <Link href="/report" className="flex-1 bg-white dark:bg-slate-900 text-slate-700 border border-slate-300 font-bold py-3.5 px-6 rounded-xl hover:bg-slate-50 dark:bg-slate-950 transition-colors shadow-sm">
                  Submit Another
                </Link>
                <Link href="/" className="flex-1 bg-slate-100 text-slate-700 font-bold py-3.5 px-6 rounded-xl hover:bg-slate-200 transition-colors">
                  Return Home
                </Link>
              </div>
            </div>
          )}

          {/* Navigation buttons inside card footer */}
          {step !== 'success' && (
            <div className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
              {stepIndex > 0 ? (
                <button onClick={prevStep} className="flex items-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:text-slate-100 font-medium px-4 py-2 rounded-lg hover:bg-slate-200/50 transition-colors">
                  <ArrowLeft className="h-4 w-4 mr-2" /> Back
                </button>
              ) : (
                <div />
              )}

              {step !== 'review' && (
                <button
                  onClick={nextStep}
                  disabled={!canProceed()}
                  className="flex items-center bg-indigo-600 text-white font-bold px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  Continue <ArrowRight className="h-4 w-4 ml-2" />
                </button>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
