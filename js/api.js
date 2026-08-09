const ApiModule = {
  detectIntent(prompt) {
    const text = prompt.toLowerCase();
    if (text.includes("generate image") || text.includes("draw") || text.includes("create image")) return 'image';
    if (text.includes("text to audio") || text.includes("speak this") || text.includes("say out loud")) return 'tts';
    if (text.includes("scan url") || text.includes("virustotal") || text.includes("shodan")) return 'cyber';
    return 'chat';
  },

  async execute(prompt, isAuto = true, provider = 'gemini') {
    const type = isAuto ? this.detectIntent(prompt) : 'chat';

    if (type === 'image') {
      const res = await fetch('/api/generate-image', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt }) });
      const data = await res.json();
      return { type, html: `${data.reply || 'Image Generated:'}<br><img src="${data.imageUrl}" style="max-width:100%;border-radius:8px;margin-top:10px;">` };
    }

    if (type === 'tts') {
      const res = await fetch('/api/text-to-audio', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: prompt }) });
      const data = await res.json();
      return { type, html: `Generated Audio:<br><audio controls src="${data.audioUrl}"></audio>` };
    }

    const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: prompt, provider }) });
    const data = await res.json();
    return { type: 'chat', html: data.reply || data.error };
  }
};
