import React from 'react';
import { EnhancementOptions } from '../types';

type Props = {
  options: EnhancementOptions;
  setOptions: (o: EnhancementOptions) => void;
  onGenerate: () => void;
  onCancel?: () => void;
  isProcessing?: boolean;
};

export const GenerationControls: React.FC<Props> = ({ options, setOptions, onGenerate, onCancel, isProcessing }) => {
  return (
    <div className="mt-6 flex flex-col md:flex-row items-center gap-3">
      <div className="flex items-center gap-2">
        <label className="text-sm text-stone-500">Format</label>
        <select value={options.format || 'png'} onChange={e=>setOptions({...options, format: e.target.value as any})} className="border rounded px-2 py-1">
          <option value="png">PNG</option>
          <option value="jpeg">JPEG</option>
          <option value="webp">WebP</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm text-stone-500">Resolution</label>
        <select value={options.width || 3840} onChange={e=>setOptions({...options, width: Number(e.target.value)})} className="border rounded px-2 py-1">
          <option value={3840}>4K (3840)</option>
          <option value={2560}>2K (2560)</option>
          <option value={1920}>1080 (1920)</option>
        </select>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button onClick={onGenerate} disabled={isProcessing} className="px-4 py-2 bg-stone-900 text-white rounded">{isProcessing? 'Working...' : 'Generate'}</button>
        {onCancel && <button onClick={onCancel} className="px-4 py-2 border rounded">Cancel</button>}
      </div>
    </div>
  );
};

export default GenerationControls;
