import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, Download, Settings, Plus, Layers, Volume2, 
  Trash2, Loader2, Edit3, ArrowDown, ArrowUp, Upload, 
  Lock, ShieldCheck, LogOut, User, CheckCircle, Clock, 
  Database, Users, Shield, Globe, AlertCircle, X, Eye, EyeOff, KeyRound, Save, ArrowRight, History as HistoryIcon, Mic2, Languages, MessageSquare, Filter, FastForward, Sliders, StopCircle, Speaker, Key, Cpu, Hourglass, MapPin, Coffee, QrCode, ChevronDown, ChevronUp, Gift, Terminal, CreditCard, Menu, ExternalLink, FileText
} from 'lucide-react';

// FIREBASE IMPORTS
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// --- CẤU HÌNH ---
const GEMINI_MODEL = "gemini-2.5-flash-preview-tts";

// --- LINK ẢNH QR CODE ---
const YOUR_QR_IMAGE_URL = "https://i.ibb.co/TxQNVJ1G/QR-nghan.jpg"; 

// --- UI TEXT ---
const UI_TEXT = {
  vi: {
    welcome: "VoiceLab Community",
    single_mode: "Soạn Thảo",
    studio_mode: "Hội Thoại",
    read_pdf: "Đọc PDF",
    pdf_extracting: "Đang quét văn bản từ PDF...",
    system_ready: "Sẵn sàng",
    input_placeholder: "Nhập văn bản cần đọc tại đây (Tự động chia đoạn, không giới hạn)...",
    render_btn: "TẠO AUDIO",
    rendering: "ĐANG TẠO...",
    history: "LỊCH SỬ",
    no_history: "Chưa có lịch sử",
    download_ready: "Tải về",
    style_hint: "Gợi ý: Đọc chậm, diễn cảm...",
    voice_label: "Giọng",
    tone_label: "Cảm xúc",
    add_block: "Thêm Lời Thoại",
    delete_block: "Xóa",
    script_placeholder: "Nhập lời thoại...",
    gender_all: "Tất cả",
    gender_male: "Nam",
    gender_female: "Nữ",
    adv_speed: "Tốc độ",
    adv_stability: "Ổn định",
    adv_pitch: "Độ cao",
    pause_stream: "Tạm dừng",
    resume_stream: "Tiếp tục",
    stop_stream: "DỪNG NGAY",
    preview_voice: "Nghe thử",
    key_pool_title: "Quản Lý API Key",
    key_pool_btn: "KHO KEY CỦA BẠN",
    key_pool_placeholder: "Dán danh sách API Key vào đây.\nMỗi dòng 1 Key.\nHệ thống sẽ tự đổi Key khi lỗi.",
    save_keys: "Lưu & Đóng",
    test_key: "Kiểm tra Key",
    error_api: "Lỗi API: ",
    missing_key: "Chưa có Key! Vui lòng nhập Key.",
    model_label: "Model",
    slow_mode: "Chế độ An Toàn",
    waiting_quota: "Đang đợi hạn mức...",
    accent_label: "Khóa Giọng",
    accent_north: "Miền Bắc (Hà Nội)",
    accent_south: "Miền Nam (Sài Gòn)",
    accent_central: "Miền Trung (Huế)",
    accent_auto: "Tự nhiên",
    donate_title: "Mời tôi ly cà phê",
    donate_desc: "Nếu extension hữu ích, bạn có thể ủng hộ để tôi tiếp tục phát triển thêm tính năng mới",
    donate_footer: "Quét mã để ủng hộ qua Momo/Banking",
    coffee_btn: "Mời Coffee",
    key_guide_1: "Truy cập Google AI Studio",
    key_guide_2: "Nhấn 'Create API Key'",
    key_guide_3: "Copy và dán vào bên dưới (Mỗi dòng 1 Key)",
    load_text_tooltip: "Click để tải lại nội dung này vào khung soạn thảo",
    quota_hit: "Hết hạn mức (429)! Đang đợi Google mở lại..."
  },
  en: {
    welcome: "VoiceLab Community",
    single_mode: "Editor",
    studio_mode: "Studio",
    read_pdf: "Read PDF",
    pdf_extracting: "Extracting text from PDF...",
    system_ready: "Ready",
    input_placeholder: "Enter text here...",
    render_btn: "GENERATE AUDIO",
    rendering: "PROCESSING...",
    history: "HISTORY",
    no_history: "No history yet",
    download_ready: "Download",
    style_hint: "Hint: Slow pace, emotional...",
    voice_label: "Voice",
    tone_label: "Tone",
    add_block: "Add Dialogue",
    delete_block: "Delete",
    script_placeholder: "Enter dialogue...",
    gender_all: "All",
    gender_male: "Male",
    gender_female: "Female",
    adv_speed: "Speed",
    adv_stability: "Stability",
    adv_pitch: "Pitch",
    pause_stream: "Pause",
    resume_stream: "Resume",
    stop_stream: "STOP NOW",
    preview_voice: "Preview",
    key_pool_title: "Manage API Keys",
    key_pool_btn: "YOUR KEY POOL",
    key_pool_placeholder: "Paste API Keys here.\nOne key per line.",
    save_keys: "Save & Close",
    test_key: "Test Connection",
    error_api: "API Error: ",
    missing_key: "No Keys found!",
    model_label: "Model",
    slow_mode: "Safe Mode",
    waiting_quota: "Waiting for quota...",
    accent_label: "Accent Lock",
    accent_north: "Northern Accent",
    accent_south: "Southern Accent",
    accent_central: "Central Accent",
    accent_auto: "Natural",
    donate_title: "Buy me a coffee",
    donate_desc: "If useful, support me to develop more.",
    donate_footer: "Scan to support",
    coffee_btn: "Donate",
    key_guide_1: "Go to Google AI Studio",
    key_guide_2: "Click 'Create API Key'",
    key_guide_3: "Copy & paste below (One key per line)",
    load_text_tooltip: "Click to load this text into editor",
    quota_hit: "Quota Exceeded (429)! Waiting for reset..."
  }
};

const LANGUAGES = [
  { code: 'vi', label: 'Tiếng Việt' },
  { code: 'en', label: 'English' },
];

const GEMINI_MODELS = [
  { id: 'gemini-2.5-flash-preview-tts', name: 'Gemini 2.5 Flash TTS (Stable)' },
  { id: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash Exp (Fast)' },
];

const ACCENTS = [
  { id: 'auto', labelKey: 'accent_auto', prompt: "Natural Vietnamese accent" },
  { id: 'north', labelKey: 'accent_north', prompt: "Strong Northern Vietnamese (Hanoi) accent. Pronounce 'r' as 'z', 'd' as 'z'. Standard Hanoi dialect." },
  { id: 'south', labelKey: 'accent_south', prompt: "Strong Southern Vietnamese (Saigon) accent. Pronounce 'r' clearly, 'v' as 'y'. Authentic Saigon dialect." },
  { id: 'central', labelKey: 'accent_central', prompt: "Central Vietnamese (Hue) accent." },
];

const VOICES = [
  { name: 'Kore', gender: 'Nữ', desc: 'Dịu dàng' },
  { name: 'Fenrir', gender: 'Nữ', desc: 'Trầm ấm' }, 
  { name: 'Zephyr', gender: 'Nữ', desc: 'Thanh thoát' },
  { name: 'Aoede', gender: 'Nữ', desc: 'Sang trọng' },
  { name: 'Leda', gender: 'Nữ', desc: 'Tinh tế' },
  { name: 'Callirrhoe', gender: 'Nữ', desc: 'Sắc sảo' },
  { name: 'Autonoe', gender: 'Nữ', desc: 'Bí ẩn' },
  { name: 'Umbriel', gender: 'Nữ', desc: 'Bay bổng' },
  { name: 'Algieba', gender: 'Nữ', desc: 'Nghiêm túc' },
  { name: 'Despina', gender: 'Nữ', desc: 'Trẻ trung' },
  { name: 'Erinome', gender: 'Nữ', desc: 'Trưởng thành' },
  { name: 'Laomedeia', gender: 'Nữ', desc: 'ASMR' },
  { name: 'Alnilam', gender: 'Nữ', desc: 'Cao vút' },
  { name: 'Pulcherrima', gender: 'Nữ', desc: 'Quyến rũ' },
  { name: 'Vindemiatrix', gender: 'Nữ', desc: 'Cổ tích' },
  { name: 'Sadachbia', gender: 'Nữ', desc: 'Trợ lý ảo' },
  { name: 'Puck', gender: 'Nam', desc: 'Hài hước' },
  { name: 'Charon', gender: 'Nam', desc: 'Sâu sắc' },
  { name: 'Orus', gender: 'Nam', desc: 'Trung tính' },
  { name: 'Enceladus', gender: 'Nam', desc: 'Từng trải' },
  { name: 'Iapetus', gender: 'Nam', desc: 'Năng lượng' },
  { name: 'Algenib', gender: 'Nam', desc: 'Hoạt bát' },
  { name: 'Rasalgethi', gender: 'Nam', desc: 'Thư sinh' },
  { name: 'Achernar', gender: 'Nam', desc: 'Chững chạc' },
  { name: 'Schedar', gender: 'Nam', desc: 'Đọc sách' },
  { name: 'Gacrux', gender: 'Nam', desc: 'Lịch lãm' },
  { name: 'Sadaltager', gender: 'Nam', desc: 'Rất trầm' },
];

const TONES = [
  { id: 'neutral', label: 'Bình thường 😐' },
  { id: 'happy', label: 'Vui vẻ 😄' },
  { id: 'sad', label: 'Buồn 😢' },
  { id: 'angry', label: 'Tức giận 😡' },
  { id: 'whisper', label: 'Thì thầm 🤫' },
  { id: 'excited', label: 'Hào hứng 🤩' },
  { id: 'news', label: 'Tin tức 📰' },
  { id: 'story', label: 'Kể chuyện 📖' },
  { id: 'poem', label: 'Đọc thơ 📜' },
  { id: 'documentary', label: 'Tài liệu 📽️' },
];

// --- UTILS ---
const base64ToBytes = (base64) => {
  try {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
    return bytes;
  } catch (e) { console.error("Decode error", e); return new Uint8Array(0); }
};

const stripWavHeader = (bytes) => {
  if (bytes.length > 44 && bytes[0] === 82 && bytes[1] === 73 && bytes[2] === 70 && bytes[3] === 70) {
    return bytes.slice(44);
  }
  return bytes;
};

const mergeBuffers = (buffers) => {
  const totalLength = buffers.reduce((acc, curr) => acc + curr.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const buffer of buffers) { result.set(buffer, offset); offset += buffer.length; }
  return result;
};

const createWavUrl = (pcmData, sampleRate = 24000) => {
  if (!pcmData || pcmData.length === 0) return null;
  const wavHeader = new ArrayBuffer(44);
  const view = new DataView(wavHeader);
  const writeString = (view, offset, string) => { for (let i = 0; i < string.length; i++) view.setUint8(offset + i, string.charCodeAt(i)); };
  writeString(view, 0, 'RIFF'); view.setUint32(4, 36 + pcmData.length, true); writeString(view, 8, 'WAVE'); writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true); view.setUint32(24, sampleRate, true); view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true); view.setUint16(34, 16, true); writeString(view, 36, 'data'); view.setUint32(40, pcmData.length, true);
  const blob = new Blob([view, pcmData], { type: 'audio/wav' }); 
  return URL.createObjectURL(blob);
};

const smartChunking = (text) => {
  const sentences = text.match(/[^.!?\n]+[.!?\n]+|[^.!?\n]+$/g) || [text];
  const chunks = [];
  let currentChunk = "";
  sentences.forEach(s => {
      if ((currentChunk + s).length < 2500) currentChunk += s; 
      else { chunks.push(currentChunk); currentChunk = s; }
  });
  if (currentChunk) chunks.push(currentChunk);
  return chunks;
};
const sanitizeEmail = (email) => email.toLowerCase().trim().replace(/\./g, '_');
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// --- PDF EXTRACTION UTILS ---
const loadPdfJs = () => {
  return new Promise((resolve, reject) => {
    if (window.pdfjsLib) { resolve(window.pdfjsLib); return; }
    const script = document.createElement('script');
    script.src = PDFJS_SRC;
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_SRC;
      resolve(window.pdfjsLib);
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

const extractTextFromPdf = async (file) => {
  const pdfjsLib = await loadPdfJs();
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    fullText += textContent.items.map(item => item.str).join(" ") + "\n\n";
  }
  return fullText;
};

// --- VISUALIZER ---
const AudioVisualizer = ({ isPlaying }) => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); let animationId;
    const barCount = 64; const barWidth = canvas.width / barCount; const bars = Array(barCount).fill(0).map(() => Math.random() * 50);
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height); gradient.addColorStop(0, '#a855f7'); gradient.addColorStop(1, '#3b82f6');
      ctx.fillStyle = gradient;
      for (let i = 0; i < barCount; i++) {
        if (isPlaying) { const noise = (Math.random() - 0.5) * 20; bars[i] = Math.max(5, Math.min(canvas.height - 10, bars[i] + noise)); if (Math.random() > 0.5) bars[i] = (bars[i] + (Math.random() * canvas.height * 0.5)) / 2; } else { bars[i] = Math.max(2, bars[i] * 0.9); }
        const x = i * barWidth; const height = bars[i]; const y = (canvas.height - height) / 2;
        ctx.beginPath(); ctx.roundRect(x + 1, y, barWidth - 2, height, 4); ctx.fill();
      } animationId = requestAnimationFrame(draw);
    }; draw(); return () => cancelAnimationFrame(animationId);
  }, [isPlaying]); return <canvas ref={canvasRef} width={600} height={120} className="w-full h-full object-cover" />;
};

// --- KEY POOL MODAL ---
const KeyPoolModal = ({ onClose, t, keys, setKeys, onTest }) => {
    const [testStatus, setTestStatus] = useState(null);
    const handleTest = async () => {
        setTestStatus("Testing...");
        const keyList = keys.split('\n').map(k=>k.trim()).filter(k=>k);
        if(keyList.length===0) { setTestStatus("Empty!"); return; }
        const success = await onTest(keyList[0]);
        setTestStatus(success ? "OK! ✅" : "Failed ❌");
    };
    return (
      <div className="fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
        <div className="bg-slate-900 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-700">
            <div className="flex justify-between items-center mb-4"><h3 className="text-lg font-bold text-white flex items-center gap-2"><Key size={18} className="text-purple-500"/> {t.key_pool_title}</h3><button onClick={onClose} className="text-slate-400 hover:text-white"><X size={20}/></button></div>
            <div className="mb-4 bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
                <p className="mb-1 flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-blue-900 text-blue-300 flex items-center justify-center text-[8px] font-bold">1</span> {t.key_guide_1}: <a href="https://aistudio.google.com/api-keys" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline flex items-center gap-1 inline-flex">Link <ExternalLink size={10}/></a></p>
                <p className="mb-1 flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-blue-900 text-blue-300 flex items-center justify-center text-[8px] font-bold">2</span> {t.key_guide_2}</p>
                <p className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-blue-900 text-blue-300 flex items-center justify-center text-[8px] font-bold">3</span> {t.key_guide_3}</p>
            </div>
            <textarea value={keys} onChange={e=>setKeys(e.target.value)} placeholder={t.key_pool_placeholder} className="w-full bg-black border border-slate-700 rounded-xl p-4 text-xs font-mono text-slate-300 h-32 resize-none outline-none focus:border-purple-500 placeholder:text-slate-600 mb-4" spellCheck="false"/>
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2"><span className="text-xs text-slate-500">{keys.split('\n').filter(k=>k.trim()).length} Keys</span><button onClick={handleTest} className="text-[10px] bg-slate-800 hover:bg-slate-700 text-white px-2 py-1 rounded border border-slate-600">{testStatus || t.test_key}</button></div>
                <button onClick={onClose} className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-6 rounded-lg text-sm">{t.save_keys}</button>
            </div>
        </div>
      </div>
    );
};

// --- DONATE MODAL ---
const DonateModal = ({ onClose, t }) => (
  <div className="fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
    <div className="bg-white rounded-[32px] p-2 w-full max-w-sm shadow-2xl relative transform transition-all scale-100 border border-blue-100">
      <div className="border-[3px] border-blue-100 rounded-[28px] p-6 text-center bg-white h-full">
        <button onClick={onClose} className="absolute top-5 right-5 text-slate-300 hover:text-red-500 transition-colors"><X size={24}/></button>
        <div className="flex justify-center mb-4"><div className="flex items-center gap-2"><Gift size={24} className="text-red-500"/><h3 className="text-xl font-bold text-slate-800">{t.donate_title}</h3></div></div>
        <p className="text-sm text-slate-500 mb-4 leading-relaxed px-2">{t.donate_desc}</p>
        <div className="bg-[#fffced] p-4 rounded-2xl mb-4 inline-block shadow-sm"><div className="w-48 h-48 bg-white rounded-lg flex items-center justify-center overflow-hidden relative border border-slate-100"><img src={YOUR_QR_IMAGE_URL} alt="QR Code" className="w-full h-full object-contain" referrerPolicy="no-referrer"/></div></div>
        <div className="mb-4 p-3 bg-blue-50 rounded-xl border border-blue-100"><p className="text-xs text-blue-800 font-medium flex items-center justify-center gap-1"><CreditCard size={14}/> Paypal: <span className="font-bold select-all">holuc1991@gmail.com</span></p></div>
        <p className="text-xs text-slate-400 font-medium">{t.donate_footer}</p>
      </div>
    </div>
  </div>
);

// --- MAIN APP ---
export default function VoiceLabApp() {
  const [db, setDb] = useState(null);
  const [appId, setAppId] = useState('');
  const [firebaseAuthUser, setFirebaseAuthUser] = useState(null); 
  const [appLang, setAppLang] = useState(() => localStorage.getItem('vl_pref_lang') || 'vi');
  const [mode, setMode] = useState('single'); 
  const [text, setText] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [keyPoolInput, setKeyPoolInput] = useState(() => localStorage.getItem('vl_user_keys') || '');
  const [showKeyPool, setShowKeyPool] = useState(false); 
  const [singleVoice, setSingleVoice] = useState(() => { const s = localStorage.getItem('vl_pref_voice'); return s ? JSON.parse(s) : VOICES[0]; });
  const [singleTone, setSingleTone] = useState(() => localStorage.getItem('vl_pref_tone') || 'neutral');
  const [stylePrompt, setStylePrompt] = useState(() => localStorage.getItem('vl_pref_prompt') || '');
  const [genderFilter, setGenderFilter] = useState(() => localStorage.getItem('vl_pref_gender') || 'All');
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [advSpeed, setAdvSpeed] = useState(1.0); 
  const [advStability, setAdvStability] = useState(0.5); 
  const [advPitch, setAdvPitch] = useState(0); 
  const [selectedModel, setSelectedModel] = useState(GEMINI_MODELS[0].id);
  const [slowMode, setSlowMode] = useState(true);
  const [selectedAccent, setSelectedAccent] = useState('auto'); 

  const [scriptBlocks, setScriptBlocks] = useState([{ id: 1, voice: 'Kore', tone: 'neutral', text: '' }]);
  const [history, setHistory] = useState([]); 
  const [playingHistoryId, setPlayingHistoryId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [downloadReady, setDownloadReady] = useState(false);
  const [finalDownloadUrl, setFinalDownloadUrl] = useState(null);
  const [lastError, setLastError] = useState(null); 
  const [countdown, setCountdown] = useState(0); 
  const [showDonate, setShowDonate] = useState(false);

  const playbackAudioRef = useRef(null);
  const audioContextRef = useRef(null);
  const nextStartTimeRef = useRef(0);
  const fileInputRef = useRef(null);
  const pdfInputRef = useRef(null);
  const abortControllerRef = useRef(null);

  const t = UI_TEXT[appLang] || UI_TEXT['en'];
  const filteredVoices = genderFilter === 'All' ? VOICES : VOICES.filter(v => v.gender === (genderFilter === 'Male' ? 'Nam' : 'Nữ'));

  useEffect(() => {
    if (typeof window !== 'undefined' && !playbackAudioRef.current) { playbackAudioRef.current = new Audio(); }
    try {
        if (typeof __firebase_config === 'undefined') return;
        const firebaseConfig = JSON.parse(__firebase_config);
        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const firestore = getFirestore(app);
        setDb(firestore);
        setAppId(typeof __app_id !== 'undefined' ? __app_id : 'default-app-id');
        const unsubscribe = onAuthStateChanged(auth, (user) => { setFirebaseAuthUser(user); });
        signInAnonymously(auth).catch(e => console.error("Anon auth failed", e));
        return () => unsubscribe();
    } catch (e) { console.error("Init error", e); }
  }, []);

  useEffect(() => {
      localStorage.setItem('vl_pref_lang', appLang);
      localStorage.setItem('vl_pref_voice', JSON.stringify(singleVoice));
      localStorage.setItem('vl_pref_tone', singleTone);
      localStorage.setItem('vl_pref_prompt', stylePrompt);
      localStorage.setItem('vl_pref_gender', genderFilter);
      localStorage.setItem('vl_user_keys', keyPoolInput); 
  }, [appLang, singleVoice, singleTone, stylePrompt, genderFilter, keyPoolInput]);

  const getValidKeys = () => keyPoolInput.split('\n').map(k => k.trim()).filter(k => k.length > 0);

  const stopAllAudio = () => {
      if (playbackAudioRef.current) { playbackAudioRef.current.pause(); playbackAudioRef.current.currentTime = 0; }
      setIsPlaying(false); setPlayingHistoryId(null);
      if (audioContextRef.current) { audioContextRef.current.close().then(() => { audioContextRef.current = null; }); }
      if (abortControllerRef.current) { abortControllerRef.current.abort(); abortControllerRef.current = null; }
      setLoading(false); setProgress(''); setCountdown(0);
  };

  const handleFileUpload = (e) => { const file = e.target.files[0]; if(!file) return; const reader = new FileReader(); reader.onload = (ev) => setText(ev.target.result); reader.readAsText(file); };
  
  const handlePdfUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setLoading(true); setProgress(t.pdf_extracting);
    try { const text = await extractTextFromPdf(file); setText(text); setMode('single'); if(isMobileMenuOpen) setIsMobileMenuOpen(false); } catch (err) { setLastError("PDF Error: " + err.message); } finally { setLoading(false); setProgress(''); }
  };

  const pauseStream = () => { if (audioContextRef.current) audioContextRef.current.suspend(); setIsPaused(true); setIsPlaying(false); };
  const resumeStream = () => { if (audioContextRef.current) audioContextRef.current.resume(); setIsPaused(false); setIsPlaying(true); };
  const stopStream = () => { stopAllAudio(); setProgress(t.stop_stream); };
  const visualWait = async (ms) => { if (!abortControllerRef.current || abortControllerRef.current.signal.aborted) return; const steps = Math.floor(ms / 1000); for (let i = steps; i > 0; i--) { if (!abortControllerRef.current || abortControllerRef.current.signal.aborted) return; setCountdown(i); await wait(1000); } setCountdown(0); };

  const testKey = async (key) => {
    try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${key}`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, mode: 'cors',
            body: JSON.stringify({ contents: [{ parts: [{ text: "Hi" }] }] })
        });
        return res.ok;
    } catch(e) { return false; }
  };

  const playPreview = async (voice) => {
      stopAllAudio(); 
      try {
          const keys = getValidKeys(); if (keys.length === 0) return alert(t.missing_key);
          const apiKey = keys[0]; 
          const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, mode: 'cors',
            body: JSON.stringify({ contents: [{ parts: [{ text: `Xin chào.` }] }], generationConfig: { responseModalities: ["AUDIO"], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice.name } } } } })
          });
          const data = await res.json();
          if (data.error) throw new Error(data.error.message);
          if (data.candidates?.[0]?.content?.parts?.[0]?.inlineData) {
              const pcm = base64ToBytes(data.candidates[0].content.parts[0].inlineData.data);
              const url = createWavUrl(pcm);
              if (url && playbackAudioRef.current) { playbackAudioRef.current.src = url; playbackAudioRef.current.play().catch(console.error); }
          }
      } catch(e) { console.error(e); alert(e.message); }
  };

  const togglePlayMain = () => {
      if (!playbackAudioRef.current) return;
      if (finalDownloadUrl && playbackAudioRef.current.src !== finalDownloadUrl) playbackAudioRef.current.src = finalDownloadUrl;
      if (playbackAudioRef.current.paused) { if (playbackAudioRef.current.src) { setPlayingHistoryId(null); playbackAudioRef.current.playbackRate = playbackSpeed; playbackAudioRef.current.play().catch(console.error); setIsPlaying(true); playbackAudioRef.current.onended = () => setIsPlaying(false); } } else { playbackAudioRef.current.pause(); setIsPlaying(false); }
  };

  const togglePlayHistory = (item) => {
      if (!playbackAudioRef.current) return;
      if (playingHistoryId === item.id && !playbackAudioRef.current.paused) { playbackAudioRef.current.pause(); setPlayingHistoryId(null); setIsPlaying(false); return; }
      stopAllAudio();
      if (item.url) { playbackAudioRef.current.src = item.url; playbackAudioRef.current.playbackRate = playbackSpeed; playbackAudioRef.current.play().catch(console.error); setPlayingHistoryId(item.id); setIsPlaying(true); setFinalDownloadUrl(item.url); setDownloadReady(true); playbackAudioRef.current.onended = () => { setPlayingHistoryId(null); setIsPlaying(false); }; }
  };

  const loadTextFromHistory = (item) => { stopAllAudio(); const textToLoad = item.fullText || item.text; setText(textToLoad); setMode('single'); if(isMobileMenuOpen) setIsMobileMenuOpen(false); };
  const initAudioContext = () => { if (!audioContextRef.current) { audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)(); nextStartTimeRef.current = audioContextRef.current.currentTime + 0.5; } else if (audioContextRef.current.state === 'suspended') audioContextRef.current.resume(); };

  const playPcmChunk = (pcmData) => {
    if (!audioContextRef.current || !pcmData || pcmData.length === 0) return;
    const ctx = audioContextRef.current;
    if (nextStartTimeRef.current < ctx.currentTime) nextStartTimeRef.current = ctx.currentTime + 0.1; 
    const f32 = new Float32Array(pcmData.length / 2);
    const dv = new DataView(pcmData.buffer);
    for (let i = 0; i < f32.length; i++) f32[i] = dv.getInt16(i * 2, true) / 32768.0;
    if (f32.length > 0) { const buf = ctx.createBuffer(1, f32.length, 24000); buf.getChannelData(0).set(f32); const src = ctx.createBufferSource(); src.buffer = buf; src.connect(ctx.destination); src.start(nextStartTimeRef.current); nextStartTimeRef.current += buf.duration; }
  };

  const fetchAudioChunk = async (text, voice, tone, retryCount = 0) => {
    if (abortControllerRef.current && abortControllerRef.current.signal.aborted) return null;
    const keys = getValidKeys();
    if (keys.length === 0) throw new Error(t.missing_key);
    const apiKey = keys[retryCount % keys.length];

    let styleInstruction = stylePrompt ? `${stylePrompt}` : "Natural";
    if (tone !== 'neutral') { const map = { happy: "Cheerfully", sad: "Sadly", angry: "Angrily", whisper: "Whispering", excited: "Excitedly", news: "Professional News Anchor", story: "Storytelling", poem: "Poetic", documentary: "Documentary Narrator" }; styleInstruction += `, ${map[tone]}`; }
    if (advSpeed > 1.2) styleInstruction += ", fast pace"; else if (advSpeed < 0.8) styleInstruction += ", slow pace";
    if (advPitch > 1) styleInstruction += ", high pitch"; else if (advPitch < -1) styleInstruction += ", deep voice";
    if (advStability > 0.8) styleInstruction += ", consistent"; else if (advStability < 0.3) styleInstruction += ", emotional";
    
    const accentObj = ACCENTS.find(a => a.id === selectedAccent);
    const accentPrompt = accentObj ? accentObj.prompt : "Natural Vietnamese";
    const fullPrompt = `SYSTEM: You are a professional Vietnamese voice actor. You MUST speak with a strict ${accentPrompt}. Do NOT change accent.
    USER REQUEST:
    Role: Voice Actor.
    Style: ${styleInstruction}.
    Text to read: "${text}"`;

    try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, mode: 'cors',
            signal: abortControllerRef.current.signal,
            body: JSON.stringify({ contents: [{ parts: [{ text: fullPrompt }] }], generationConfig: { responseModalities: ["AUDIO"], temperature: 0.0, topK: 1, topP: 0.1, speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } } } })
        });
        const data = await res.json();
        if (!res.ok) {
            if ((res.status === 429 || res.status >= 500) && retryCount < (keys.length * 2)) { 
                const waitTime = 40000; // QUOTA GUARD: WAIT 40s IF 429
                setLastError(t.quota_hit);
                await visualWait(waitTime);
                setLastError(null);
                return fetchAudioChunk(text, voice, tone, retryCount + 1);
            }
            throw new Error(`Google API Error: ${data.error?.message || res.statusText}`);
        }
        const part = data.candidates?.[0]?.content?.parts?.[0];
        if (part?.inlineData) return base64ToBytes(part.inlineData.data);
        else if (part?.text) throw new Error(`Model refused: "${part.text.substring(0, 50)}..."`);
        throw new Error("No audio data received");
    } catch (e) { if (e.name === 'AbortError') return null; throw e; }
  };

  const handleGenerate = async () => {
    try {
      setLastError(null); stopAllAudio();
      abortControllerRef.current = new AbortController();
      setLoading(true); setIsPlaying(true); setDownloadReady(false); setProgress(t.rendering);
      initAudioContext();
      const allBuf = [];
      let chunks = mode === 'single' ? smartChunking(text).map(t => ({ text: t, voice: singleVoice.name, tone: singleTone })) : scriptBlocks.filter(b => b.text.trim()).map(b => ({ text: b.text, voice: b.voice, tone: b.tone }));

      for (let i = 0; i < chunks.length; i++) {
          if (!abortControllerRef.current || abortControllerRef.current.signal.aborted) break;
          const pct = Math.round(((i) / chunks.length) * 100);
          setProgress(`Đang xử lý ${pct}% (Đoạn ${i + 1}/${chunks.length})...`);
          const pcm = await fetchAudioChunk(chunks[i].text, chunks[i].voice, chunks[i].tone);
          if (pcm && pcm.length > 0) { const rawPcm = stripWavHeader(pcm); playPcmChunk(rawPcm); allBuf.push(rawPcm); }
          if (i < chunks.length - 1) { const delayTime = slowMode ? 3000 : 200; await visualWait(delayTime); }
      }
      
      if (abortControllerRef.current && !abortControllerRef.current.signal.aborted) {
          if (allBuf.length > 0) {
            const finalWav = createWavUrl(mergeBuffers(allBuf));
            setFinalDownloadUrl(finalWav); setDownloadReady(true); setProgress('Done');
            const histText = mode === 'single' ? text.substring(0, 40) + '...' : 'Studio Project';
            const fullTextToSave = mode === 'single' ? text : scriptBlocks.map(b => b.text).join('\n\n');
            setHistory(prev => [{ id: Date.now(), text: histText, fullText: fullTextToSave, time: new Date().toLocaleTimeString(), url: finalWav, voice: mode==='single'?singleVoice.name:'Multi' }, ...prev].slice(0, 20));
          } else { setLastError("Không tạo được audio. Kiểm tra Key/Model."); setProgress('Failed'); }
      } else { setProgress('ĐÃ DỪNG'); }
      
      if (audioContextRef.current) {
          const delay = (nextStartTimeRef.current - audioContextRef.current.currentTime) * 1000;
          setTimeout(() => { setIsPlaying(false); if(audioContextRef.current) audioContextRef.current.close().then(()=>audioContextRef.current=null); }, Math.max(0, delay));
      } else { setIsPlaying(false); }

    } catch (e) { if (e.name !== 'AbortError') setLastError(e.message); setIsPlaying(false); } finally { setLoading(false); setCountdown(0); abortControllerRef.current = null; }
  };

  const updateBlock=(id,f,v)=>setScriptBlocks(p=>p.map(b=>b.id===id?{...b,[f]:v}:b));
  const addBlock=()=>setScriptBlocks(p=>[...p,{id:Date.now(),voice:'Kore',tone:'neutral',text:''}]);
  const removeBlock=(id)=>setScriptBlocks(p=>p.filter(b=>b.id!==id));
  const changeSpeed = () => { if (!playbackAudioRef.current) return; const s=[0.5,1.0,1.25,1.5,2.0]; const n=s[(s.indexOf(playbackSpeed)+1)%s.length]; setPlaybackSpeed(n); playbackAudioRef.current.playbackRate=n; };
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 font-sans overflow-hidden relative">
        <button onClick={()=>setShowDonate(true)} className="fixed bottom-24 left-6 z-[9999] bg-gradient-to-r from-yellow-500 to-orange-600 text-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform animate-bounce-slow group" title={t.donate_title}><Coffee size={24} fill="currentColor"/><span className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-white text-slate-800 text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-md">{t.donate_title}</span></button>
        {isMobileMenuOpen && (<div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={()=>setIsMobileMenuOpen(false)}></div>)}
        <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
            <div className="p-6 flex items-center justify-between"><div className="flex items-center gap-2 text-purple-400 font-bold text-xl"><Volume2 size={28}/><span>VoiceLab <span className="text-white bg-green-600 px-1.5 py-0.5 rounded text-[10px] align-top">COM</span></span></div><button onClick={()=>setIsMobileMenuOpen(false)} className="md:hidden text-slate-400"><X size={24}/></button></div>
            <nav className="flex-1 px-4 space-y-2 overflow-y-auto"><button onClick={()=>{setMode('single'); setIsMobileMenuOpen(false)}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${mode==='single'?'bg-purple-600 text-white shadow-lg':'text-slate-400 hover:bg-slate-800'}`}><Edit3 size={18}/><span className="font-medium text-sm">{t.single_mode}</span></button><button onClick={()=>{setMode('studio'); setIsMobileMenuOpen(false)}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${mode==='studio'?'bg-purple-600 text-white shadow-lg':'text-slate-400 hover:bg-slate-800'}`}><Layers size={18}/><span className="font-medium text-sm">{t.studio_mode}</span></button><button onClick={()=>{pdfInputRef.current.click()}} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 border border-slate-800 hover:border-slate-600 transition-colors mt-2"><FileText size={18}/><span className="font-medium text-sm">{t.read_pdf}</span></button><input type="file" ref={pdfInputRef} onChange={handlePdfUpload} accept=".pdf" className="hidden"/><div className="mt-4 pt-4 border-t border-slate-800"><button onClick={()=>setShowKeyPool(true)} className="w-full flex items-center justify-between text-xs font-bold text-slate-500 mb-2 uppercase px-1 hover:text-white border border-slate-800 p-2 rounded-lg hover:border-slate-600 transition-all"><span className="flex items-center gap-1"><Key size={12}/> {t.key_pool_btn}</span><span className="bg-slate-800 text-[10px] px-1.5 rounded-full">{getValidKeys().length}</span></button></div></nav>
            <div className="p-4 bg-slate-900 border-t border-slate-800"><div className="flex justify-between items-center mb-2"><span className="text-xs text-slate-500">Ngôn ngữ:</span><div className="flex gap-1">{LANGUAGES.map(l=><button key={l.code} onClick={()=>setAppLang(l.code)} className={`text-[10px] px-1.5 py-0.5 rounded ${appLang===l.code?'bg-purple-900 text-white':'bg-slate-800 text-slate-400'}`}>{l.code.toUpperCase()}</button>)}</div></div></div>
        </div>
        <div className="flex-1 flex flex-col relative">
            <header className="h-14 border-b border-slate-800 flex items-center justify-between px-4 md:px-6 bg-slate-950"><button onClick={toggleMobileMenu} className="md:hidden text-slate-400 hover:text-white mr-4"><Menu size={24}/></button><div className="flex items-center gap-2 text-xs font-medium text-slate-400"><span className={`w-2 h-2 rounded-full ${getValidKeys().length>0?'bg-green-500 animate-pulse':'bg-red-500'}`}></span><span>{getValidKeys().length > 0 ? t.system_ready : t.missing_key}</span></div></header>
            <main className="flex-1 overflow-y-auto p-4 flex gap-4 flex-col lg:flex-row">
                <div className="flex-1 flex flex-col gap-3 h-full overflow-hidden min-h-[400px]">
                    {(lastError || countdown > 0) && (<div className={`border p-3 rounded-xl flex items-center justify-between ${lastError ? 'bg-red-900/20 border-red-900' : 'bg-yellow-900/20 border-yellow-700'}`}><div className="flex items-center gap-2">{countdown > 0 && <Hourglass size={16} className="animate-spin text-yellow-500"/>}<span className={`text-xs font-mono ${lastError ? 'text-red-400' : 'text-yellow-400'}`}>{lastError ? lastError : `${t.waiting_quota}: ${countdown}s`}</span></div><button onClick={()=>{setLastError(null); setCountdown(0);}} className="text-slate-500 hover:text-white"><X size={14}/></button></div>)}
                    <div className="bg-slate-900 rounded-xl p-3 border border-slate-800 flex flex-wrap gap-4 items-center"><div className="flex items-center gap-2 text-xs font-bold text-purple-400"><Sliders size={14}/> CÀI ĐẶT</div><div className="flex items-center gap-2 border-r border-slate-800 pr-4"><span className="text-xs text-slate-500">{t.model_label}:</span><select value={selectedModel} onChange={e=>setSelectedModel(e.target.value)} className="bg-slate-800 text-slate-300 text-xs px-2 py-1 rounded border border-slate-700 outline-none">{GEMINI_MODELS.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</select></div><div className="flex items-center gap-2 border-r border-slate-800 pr-4"><span className="text-xs text-slate-500"><MapPin size={12} className="inline mr-1"/>{t.accent_label}:</span><select value={selectedAccent} onChange={e=>setSelectedAccent(e.target.value)} className="bg-slate-800 text-slate-300 text-xs px-2 py-1 rounded border border-slate-700 outline-none">{ACCENTS.map(a=><option key={a.id} value={a.id}>{t[a.labelKey]}</option>)}</select></div><div className="flex items-center gap-2 border-r border-slate-800 pr-4"><input type="checkbox" checked={slowMode} onChange={e=>setSlowMode(e.target.checked)} className="accent-purple-500"/><span className="text-xs text-slate-400 cursor-pointer" onClick={()=>setSlowMode(!slowMode)}>{t.slow_mode}</span></div><input value={stylePrompt} onChange={e=>setStylePrompt(e.target.value)} placeholder={t.style_hint} className="flex-1 bg-slate-950/50 border border-slate-800 rounded px-2 py-1 text-xs text-slate-300 focus:border-purple-500 outline-none min-w-[150px]"/></div>
                    {mode === 'single' && (<><div className="bg-slate-900 rounded-xl p-3 flex flex-wrap gap-2 border-b border-slate-800 items-center"><div className="flex gap-2 flex-1"><div className="relative"><select onChange={e=>setGenderFilter(e.target.value)} className="h-full bg-slate-800 text-slate-300 px-2 rounded-lg text-xs border border-slate-700 outline-none w-20"><option value="All">{t.gender_all}</option><option value="Male">{t.gender_male}</option><option value="Female">{t.gender_female}</option></select></div><select onChange={e=>setSingleVoice(VOICES.find(v=>v.name===e.target.value))} className="bg-slate-800 text-white px-3 py-2 rounded-lg text-sm border border-slate-700 outline-none flex-1">{filteredVoices.map(v=><option key={v.name} value={v.name}>{v.name} ({v.gender}) - {v.desc}</option>)}</select><button onClick={()=>playPreview(singleVoice)} className="bg-slate-700 hover:bg-slate-600 text-white px-2 rounded text-xs" title={t.preview_voice}><Speaker size={14}/></button></div><div className="flex gap-2 flex-1"><select onChange={e=>setSingleTone(e.target.value)} className="w-32 bg-slate-950 text-purple-300 px-3 py-2 rounded-lg text-sm border border-slate-800 outline-none">{TONES.map(t=><option key={t.id} value={t.id}>{t.icon} {t.label}</option>)}</select></div><button onClick={()=>fileInputRef.current.click()} className="bg-slate-800 text-slate-300 px-3 py-2 rounded-lg text-xs hover:bg-slate-700"><Upload size={14}/></button><input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden"/></div><div className="flex-1 relative"><textarea value={text} onChange={e=>setText(e.target.value)} className="w-full h-full bg-slate-900/30 border border-slate-800/50 rounded-xl p-4 text-slate-300 resize-none outline-none focus:ring-1 focus:ring-purple-500/30 leading-7 text-lg" placeholder={t.input_placeholder}/><div className="absolute bottom-3 right-4 text-xs text-slate-600">{text.length} / 50000 chars</div></div></>)}
                    {mode === 'studio' && (<div className="flex-1 flex flex-col gap-2 h-full"><div className="overflow-y-auto flex-1 pr-2 space-y-2">{scriptBlocks.map((block) => (<div key={block.id} className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex gap-3 group hover:border-slate-700 transition-colors"><div className="flex-1 space-y-2"><div className="flex gap-2 items-center"><select value={block.voice} onChange={e => updateBlock(block.id, 'voice', e.target.value)} className="bg-slate-800 text-white text-xs px-2 py-1.5 rounded border border-slate-700 outline-none">{VOICES.map(v => <option key={v.name} value={v.name}>{v.name} ({v.gender})</option>)}</select><select value={block.tone} onChange={e => updateBlock(block.id, 'tone', e.target.value)} className="bg-slate-950 text-purple-300 text-xs px-2 py-1.5 rounded border border-slate-800 outline-none">{TONES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}</select><button onClick={()=>playPreview(VOICES.find(v=>v.name===block.voice))} className="text-slate-500 hover:text-white"><Speaker size={12}/></button><button onClick={() => removeBlock(block.id)} className="ml-auto text-slate-600 hover:text-red-500"><Trash2 size={14}/></button></div><textarea value={block.text} onChange={e => updateBlock(block.id, 'text', e.target.value)} placeholder={t.script_placeholder} className="w-full bg-transparent text-slate-300 text-sm resize-none outline-none h-16 focus:border-b border-slate-700"/></div></div>))}</div><button onClick={addBlock} className="py-3 border-2 border-dashed border-slate-800 rounded-xl text-slate-500 hover:text-white hover:border-slate-600 transition-colors flex items-center justify-center gap-2 text-sm font-bold"><Plus size={16}/> {t.add_block}</button></div>)}
                </div>
                <div className="w-full lg:w-[360px] flex flex-col gap-4 shrink-0">
                    {!loading ? (<button onClick={handleGenerate} className={`w-full py-4 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-purple-500/50`}><Play fill="currentColor"/> {t.render_btn}</button>) : (<div className="flex gap-2"><button onClick={pauseStream} className={`flex-1 py-4 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all ${isPaused ? 'bg-green-600' : 'bg-yellow-600'}`}>{isPaused ? <Play fill="currentColor"/> : <Pause fill="currentColor"/>} {isPaused ? t.resume_stream : t.pause_stream}</button><button onClick={stopStream} className="px-4 py-4 rounded-xl font-bold text-white shadow-lg bg-red-600 hover:bg-red-500 flex items-center justify-center gap-2"><StopCircle size={20}/> {t.stop_stream}</button></div>)}
                    {loading && <div className="text-xs text-center text-purple-400 font-mono animate-pulse">{progress}</div>}
                    <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl"><div className="h-32 bg-black relative w-full group cursor-pointer" onClick={togglePlayMain}><AudioVisualizer isPlaying={isPlaying}/><div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/30 transition-colors">{isPlaying ? <Pause size={32} className="text-white drop-shadow-lg"/> : <Play size={32} className="text-white drop-shadow-lg"/>}</div></div><div className="p-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between"><button onClick={changeSpeed} className="text-xs font-mono bg-slate-800 text-purple-300 px-2 py-1 rounded border border-slate-700 hover:bg-slate-700 flex items-center gap-1"><FastForward size={12}/> {playbackSpeed}x</button>{downloadReady ? <a href={finalDownloadUrl} download="voice-lab-audio.wav" className="text-green-400 hover:text-white transition-colors"><Download size={20}/></a> : <span className="text-slate-600"><Download size={20}/></span>}</div></div>
                    <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden flex-1 flex flex-col max-h-64"><div className="p-3 bg-slate-950 border-b border-slate-800 text-xs font-bold text-slate-500 flex items-center justify-between"><div className="flex items-center gap-2"><HistoryIcon size={14}/> {t.history}</div><button onClick={()=>setHistory([])} className="text-slate-600 hover:text-red-500"><Trash2 size={12}/></button></div><div className="overflow-y-auto p-2 space-y-1">{history.length === 0 && <div className="text-center text-[10px] text-slate-600 py-4">{t.no_history}</div>}{history.map(item => (<div key={item.id} className="p-2 rounded hover:bg-slate-800 cursor-pointer group flex items-center gap-3 border border-transparent hover:border-slate-700"><div className="flex-1 overflow-hidden" onClick={() => loadTextFromHistory(item)} title={t.load_text_tooltip}><div className="text-xs text-slate-300 truncate font-medium group-hover:text-purple-400 transition-colors flex items-center gap-2">{item.id === playingHistoryId && <span className="text-green-500 text-[10px] font-bold animate-pulse">▶ Playing</span>}{String(item.text)}</div><div className="text-[10px] text-slate-500">{item.voice} • {item.time}</div></div><div className="flex gap-2 opacity-50 group-hover:opacity-100"><button onClick={(e) => { e.stopPropagation(); togglePlayHistory(item); }}>{item.id === playingHistoryId ? <Pause size={14} className="text-purple-400"/> : <Play size={14} className="text-slate-400"/>}</button><a href={item.url} download={`history-${item.id}.wav`} onClick={(e)=>e.stopPropagation()} className="text-slate-600 hover:text-green-400"><Download size={14}/></a></div></div>))}</div></div>
                </div>
            </main>
            {showDonate && <DonateModal onClose={()=>setShowDonate(false)} t={t} />}
            {showKeyPool && <KeyPoolModal onClose={()=>setShowKeyPool(false)} t={t} keys={keyPoolInput} setKeys={setKeyPoolInput} onTest={testKey} />}
        </div>
    </div>
  );
}