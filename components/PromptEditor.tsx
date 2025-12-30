import React, { useState, useEffect } from 'react';

type Props = {
  prompt: string;
  setPrompt: (p: string) => void;
  livePreview?: boolean;
  setLivePreview?: (v: boolean) => void;
};

export const PromptEditor: React.FC<Props> = ({ prompt, setPrompt, livePreview = false, setLivePreview }) => {
  const [local, setLocal] = useState(prompt);

  useEffect(() => setLocal(prompt), [prompt]);

  const saveTemplate = () => {
    const key = 'bildovido_prompt_templates_v1';
    const raw = localStorage.getItem(key);
    const arr = raw ? JSON.parse(raw) : [];
    arr.unshift({ id: Date.now(), text: local });
    localStorage.setItem(key, JSON.stringify(arr.slice(0, 10)));
    alert('Template saved');
  };

  const loadTemplate = (t: any) => {
    setLocal(t.text);
    setPrompt(t.text);
  };

    const templates = (() => {
    try {
      const raw = localStorage.getItem('bildovido_prompt_templates_v1');
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  })();

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-stone-500 mb-2">Prompt</label>
      <textarea value={local} onChange={e=>setLocal(e.target.value)} onBlur={()=>setPrompt(local)} rows={4} className="w-full border rounded p-2" />
      <div className="mt-2 flex items-center gap-2">
        <button onClick={()=>{ setPrompt(local); }} className="px-3 py-1 bg-stone-900 text-white rounded">Apply</button>
        <button onClick={saveTemplate} className="px-3 py-1 border rounded">Save Template</button>
        <label className="text-sm text-stone-500 ml-4">Live</label>
        {setLivePreview && <input type="checkbox" checked={livePreview} onChange={e=>setLivePreview(e.target.checked)} />}
        <div className="ml-auto">
          <select onChange={e=>loadTemplate(JSON.parse(e.target.value))} className="border rounded px-2 py-1">
            <option value="">Load template...</option>
            {templates.map((t:any)=>(<option key={t.id} value={JSON.stringify(t)}>{t.text.slice(0,60)}</option>))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default PromptEditor;
