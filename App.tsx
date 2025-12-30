
import React, { useState, useRef, useCallback } from 'react';
import { Button } from './components/Button';
import { SAMPLE_IMAGES } from './constants';
import { EnhancementState, EnhancementOptions } from './types';
import { generateImage, enhanceImage as aiEnhance } from './services/aiService';
import PromptEditor from './components/PromptEditor';
import GenerationControls from './components/GenerationControls';

const App: React.FC = () => {
  const [state, setState] = useState<EnhancementState>({
    originalImage: null,
    enhancedImage: null,
    isProcessing: false,
    error: null,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [outputFormat, setOutputFormat] = useState<'png'|'jpeg'|'webp'>('png');
  const [resolutionPreset, setResolutionPreset] = useState<'4k'|'2k'|'1080'|'custom'>('4k');
  const [customWidth, setCustomWidth] = useState<number | ''>('' as unknown as number);
  const [customHeight, setCustomHeight] = useState<number | ''>('' as unknown as number);
  const [prompt, setPrompt] = useState<string>('Studio product photo of {{product}} in {{color}}, centered, ultra-sharp focus, commercial lighting, pristine background');
  const [livePreview, setLivePreview] = useState<boolean>(false);
  const [genOptions, setGenOptions] = useState<EnhancementOptions>({ width: 3840, format: 'png', quality: 0.92 });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setState(prev => ({
          ...prev,
          originalImage: e.target?.result as string,
          enhancedImage: null,
          error: null
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectSample = (url: string) => {
    setState(prev => ({
      ...prev,
      originalImage: url,
      enhancedImage: null,
      error: null
    }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEnhance = async () => {
    // allow generate from prompt or enhance uploaded image
    if (!state.originalImage && !prompt) return;

    setState(prev => ({ ...prev, isProcessing: true, error: null }));
    try {
      const options: EnhancementOptions = {
        width: genOptions.width,
        height: genOptions.height,
        format: genOptions.format,
        quality: genOptions.quality,
      };

      if (state.originalImage) {
        const res = await aiEnhance(state.originalImage, options);
        setState(prev => ({ ...prev, enhancedImage: res.dataUrl, isProcessing: false }));
      } else {
        const res = await generateImage(prompt, options);
        setState(prev => ({ ...prev, enhancedImage: res.dataUrl, isProcessing: false }));
      }
    } catch (err: any) {
      console.error(err);
      setState(prev => ({ 
        ...prev, 
        isProcessing: false, 
        error: err.message || "Failed to enhance or generate image." 
      }));
    }
  };

  const handleReset = () => {
    setState({
      originalImage: null,
      enhancedImage: null,
      isProcessing: false,
      error: null,
    });
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Navigation / Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-stone-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-stone-900 rounded-xl flex items-center justify-center text-white font-bold">B</div>
            <h1 className="text-xl font-semibold tracking-tight text-stone-900">Bildovido AI</h1>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-stone-500">
            <a href="#" className="hover:text-stone-900 transition-colors">How it works</a>
            <a href="#" className="hover:text-stone-900 transition-colors">Pricing</a>
            <Button variant="outline" className="h-9 py-0">Dashboard</Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 pt-12">
        <div className="text-center mb-12">
          <h2 className="serif text-5xl md:text-6xl text-stone-900 mb-6 leading-tight">
            Elevate your products <br />
            <span className="italic text-stone-400">to studio quality.</span>
          </h2>
          <p className="text-lg text-stone-500 max-w-2xl mx-auto">
            Our AI transforms casual photos into high-end commercial photography 
            while preserving your product's authentic details and colors.
          </p>
        </div>

          {/* Prompt Editor */}
          <PromptEditor prompt={prompt} setPrompt={setPrompt} livePreview={livePreview} setLivePreview={setLivePreview} />

          {/* Action Center */}
          <section className="bg-white rounded-[2rem] border border-stone-200 p-6 md:p-12 shadow-sm mb-16">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            
            {/* Left side: Upload or Preview Original */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-widest text-stone-400">Input Phase</h3>
                {state.originalImage && (
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="text-sm font-medium text-stone-900 hover:underline"
                  >
                    Replace Image
                  </button>
                )}
              </div>

              <div 
                className={`relative aspect-square rounded-2xl overflow-hidden bg-stone-50 border-2 border-dashed transition-all duration-300 ${
                  state.originalImage ? 'border-transparent' : 'border-stone-200 hover:border-stone-400'
                }`}
              >
                {state.originalImage ? (
                  <img 
                    src={state.originalImage} 
                    alt="Original" 
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-stone-900 font-medium mb-1">Click to upload product photo</p>
                    <p className="text-sm text-stone-400">SVG, PNG, JPG or WebP (max 10MB)</p>
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      className="absolute inset-0 opacity-0 cursor-pointer" 
                      onChange={handleFileUpload}
                      accept="image/*"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Right side: Process or Enhanced Output */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-widest text-stone-400">Enhancement</h3>
                {state.enhancedImage && (
                  <a 
                    href={state.enhancedImage} 
                    download="enhanced-product.png"
                    className="text-sm font-medium text-stone-900 hover:underline"
                  >
                    Download 4K
                  </a>
                )}
              </div>

              <div className="relative aspect-square rounded-2xl overflow-hidden bg-stone-100/50 flex items-center justify-center border border-stone-200">
                {state.isProcessing ? (
                  <div className="text-center animate-pulse">
                    <div className="w-12 h-12 bg-stone-900 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                    <p className="text-stone-900 font-medium">Applying studio lighting...</p>
                    <p className="text-sm text-stone-500">Usually takes 5-10 seconds</p>
                  </div>
                ) : state.enhancedImage ? (
                  <img 
                    src={state.enhancedImage} 
                    alt="Enhanced" 
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-center p-8">
                    <svg className="w-12 h-12 text-stone-200 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <p className="text-stone-300 font-medium">AI magic will appear here</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-12">
            <GenerationControls options={genOptions} setOptions={setGenOptions} onGenerate={handleEnhance} isProcessing={state.isProcessing} />
            <div className="mt-4 flex gap-3">
              {state.enhancedImage && (
                <>
                  <a href={state.enhancedImage} download={`enhanced-product.${genOptions.format || 'png'}`} className="text-sm font-medium text-stone-900 hover:underline">Download</a>
                  <Button variant="secondary" onClick={handleReset} className="w-full md:w-auto">Start New Project</Button>
                </>
              )}
              {!state.enhancedImage && (
                <Button onClick={handleEnhance} disabled={state.isProcessing} isLoading={state.isProcessing}>Generate</Button>
              )}
            </div>
          </div>
                {state.enhancedImage && (
                  <a 
                    href={state.enhancedImage} 
                    download={`enhanced-product.${outputFormat}`}
                    className="text-sm font-medium text-stone-900 hover:underline"
                  >
                    Download
                  </a>
                )}

          {state.error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm flex items-center gap-3">
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {state.error}
            </div>
          )}
        </section>

        {/* Quick Starts */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-semibold text-stone-900">Try with examples</h3>
            <p className="text-stone-400 text-sm font-medium">Select a category to see the transformation</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {SAMPLE_IMAGES.map((img) => (
              <button
                key={img.id}
                onClick={() => handleSelectSample(img.url)}
                className="group relative aspect-[4/5] rounded-2xl overflow-hidden bg-stone-100 text-left transition-transform active:scale-95"
              >
                <img 
                  src={img.url} 
                  alt={img.label}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-white text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all">
                    {img.category}
                  </p>
                  <p className="text-white font-medium opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all delay-75">
                    {img.label}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Features List */}
        <section className="mt-32 grid md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center text-stone-900">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <h4 className="text-xl font-semibold">Realistic Depth</h4>
            <p className="text-stone-500 leading-relaxed">Artificial intelligence simulates high-end lenses like the 85mm f/1.2 to create beautiful, soft backgrounds.</p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center text-stone-900">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h4 className="text-xl font-semibold">Studio Lighting</h4>
            <p className="text-stone-500 leading-relaxed">Transforms messy room lighting into professional softbox or ring light setups with soft natural shadows.</p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center text-stone-900">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z" />
              </svg>
            </div>
            <h4 className="text-xl font-semibold">4K Detail Retention</h4>
            <p className="text-stone-500 leading-relaxed">Unlike simple filters, we regenerate textures to maintain crisp focus and clean surfaces for e-commerce use.</p>
          </div>
        </section>
      </main>

      <footer className="mt-32 border-t border-stone-100 pt-12 text-center text-stone-400 text-sm">
        <p>&copy; {new Date().getFullYear()} Bildovido AI. Powered by Gemini Pro Vision.</p>
        <div className="flex items-center justify-center gap-4 mt-4">
          <a href="#" className="hover:text-stone-900">Terms</a>
          <a href="#" className="hover:text-stone-900">Privacy</a>
          <a href="#" className="hover:text-stone-900">Support</a>
        </div>
      </footer>
    </div>
  );
};

export default App;
