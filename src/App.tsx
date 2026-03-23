import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { 
  Bell, 
  User, 
  Upload, 
  ChevronRight, 
  Clock, 
  FileText,
  Sparkles,
  Zap,
  Brain,
  Layout,
  Video,
  ArrowLeft,
  Star,
  Globe,
  ChevronDown,
  SquarePen,
  Copy,
  ArrowRight,
  Check,
  Plus,
  RefreshCw,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Components ---

const TomatoIcon = ({ className }: { className?: string }) => (
  <div className={`relative ${className}`}>
    {/* Tomato Body */}
    <div className="w-full h-full bg-primary rounded-[35%] shadow-lg shadow-primary/20 flex items-center justify-center overflow-hidden">
      {/* Highlight for depth */}
      <div className="absolute top-[15%] left-[20%] w-[25%] h-[15%] bg-white/30 rounded-full rotate-[-30deg]"></div>
    </div>
    {/* Stem/Leaves */}
    <div className="absolute -top-[15%] left-1/2 -translate-x-1/2 w-[60%] h-[40%] flex items-center justify-center">
      <div className="absolute w-[15%] h-[60%] bg-[#10B981] rounded-full -rotate-12 translate-y-[-20%]"></div>
      <div className="absolute w-[80%] h-[25%] bg-[#10B981] rounded-full"></div>
      <div className="absolute w-[25%] h-[80%] bg-[#10B981] rounded-full rotate-45 translate-x-[20%] translate-y-[10%]"></div>
      <div className="absolute w-[25%] h-[80%] bg-[#10B981] rounded-full -rotate-45 translate-x-[-20%] translate-y-[10%]"></div>
    </div>
  </div>
);

const Header = ({ showBack, onBack, title, currentStep = 1, hideSteps = false, hideTitle = false }: { showBack?: boolean, onBack?: () => void, title?: string, currentStep?: number, hideSteps?: boolean, hideTitle?: boolean }) => {
  return (
    <nav className={`${title ? 'sticky' : 'fixed'} top-0 left-0 right-0 z-50 h-20 px-8 flex items-center justify-between bg-transparent`}>
      <div className="flex items-center gap-12">
        <div className="flex items-center gap-4">
          {showBack ? (
            <button 
              onClick={onBack}
              className="p-2 hover:bg-surface-container rounded-full transition-colors text-on-surface-variant"
            >
              <ArrowLeft size={24} />
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <TomatoIcon className="w-10 h-10" />
              <span className="text-2xl font-extrabold text-primary font-headline tracking-tight">小番茄</span>
            </div>
          )}
          {title && !hideTitle && <span className="text-xl font-extrabold text-primary font-headline tracking-tight">{title}</span>}
        </div>
        
        <div className="hidden lg:flex items-center gap-12 text-[15px] font-semibold ml-16">
          {/* Steps */}
          {title && !hideSteps && (
            <div className="flex items-center gap-8">
              {[
                { id: 1, label: '剧本大纲' },
                { id: 2, label: '分镜图' },
                { id: 3, label: '分镜视频' }
              ].map((step) => (
                <div key={step.id} className={`flex flex-col items-center gap-1 ${step.id > currentStep ? 'opacity-50' : ''}`}>
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${step.id <= currentStep ? 'bg-primary text-on-primary' : 'bg-surface-container-highest text-outline'}`}>
                      {step.id}
                    </div>
                    <span className={`text-sm font-bold ${step.id <= currentStep ? 'text-primary' : 'text-outline'}`}>
                      {step.label}
                    </span>
                  </div>
                  <div className={`h-1 w-16 rounded-full mt-1 ${step.id <= currentStep ? 'bg-primary' : 'bg-surface-container-highest'}`}></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-full text-primary cursor-pointer hover:bg-primary/15 transition-colors">
          <Star size={16} fill="currentColor" />
          <span className="text-sm font-bold">971</span>
          <ChevronDown size={16} />
        </div>
        <button className="bg-on-surface text-surface px-4 py-1.5 rounded-full text-xs font-bold tracking-wide hover:bg-black transition-colors">
          {title ? '会员' : '订阅'}
        </button>
        <div className="flex items-center gap-1 text-outline mr-2">
          <button className="p-2 hover:text-on-surface transition-colors relative">
            <Bell size={20} />
            {!title && <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full border border-white"></span>}
          </button>
          <button className="p-2 hover:text-on-surface transition-colors"><Globe size={20} /></button>
        </div>
        <div className="flex items-center gap-2.5 bg-surface-container-low hover:bg-surface-container transition-colors px-4 py-2 rounded-full cursor-pointer group">
          <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center text-on-primary shadow-sm">
            <User size={16} fill="currentColor" />
          </div>
          <span className="text-[15px] font-bold text-on-surface">Admin</span>
        </div>
      </div>
    </nav>
  );
};

const Hero = () => {
  return (
    <div className="pt-40 pb-16 text-center max-w-4xl mx-auto px-6">
      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-[56px] leading-[1.1] font-extrabold text-on-surface mb-6 font-headline tracking-tight"
      >
        由 AI 驱动的创作空间
      </motion.h1>
      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-xl text-outline font-medium"
      >
        在这里，你的创意将通过大语言模型转化为精彩绝伦的剧本。
      </motion.p>
    </div>
  );
};

const CreatorSection = ({ onStartCreating }: { onStartCreating: () => void }) => {
  const [prompt, setPrompt] = useState('');
  const [videoStyle, setVideoStyle] = useState('3DCG动画东方奇幻');
  const [aspectRatio, setAspectRatio] = useState('16:9');

  const styles = [
    '2D国风半厚涂',
    '3DCG动画东方奇幻',
    '真人写实电影风格暗调冷色',
    '2D日漫半厚涂',
    '3D卡通暗黑奇幻',
    '+ 自定义风格'
  ];

  const ratios = [
    { label: '9:16', icon: <div className="w-3 h-5 border-2 border-current rounded-[2px]"></div> },
    { label: '16:9', icon: <div className="w-5 h-3 border-2 border-current rounded-[2px]"></div> }
  ];

  return (
    <section className="max-w-5xl mx-auto px-6 mb-32">
      <motion.div 
        key="ai-view"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        className="bg-white rounded-[48px] p-10 tonal-shadow relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-primary/10">
          <div className="h-full bg-primary w-1/3 rounded-r-full"></div>
        </div>

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles size={18} />
            <span className="text-[15px] font-bold">叙述你的构思</span>
          </div>
          <span className="text-sm font-medium text-slate-300">{prompt.length} / 2000 字</span>
        </div>

        <div className="bg-slate-50/50 rounded-[32px] p-8 mb-10 border border-slate-100/50">
          <textarea 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="在此输入你构思的完整故事内容。"
            className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-slate-500 placeholder:text-slate-300 resize-none min-h-[240px] leading-relaxed font-medium"
          />
        </div>

        <div className="mb-10 space-y-8">
          <div>
            <h3 className="text-[15px] font-bold text-slate-800 mb-4 flex items-center gap-1">
              画面风格 <span className="text-red-500">*</span>
            </h3>
            <div className="flex flex-wrap gap-3">
              {styles.map((style) => (
                <button
                  key={style}
                  onClick={() => setVideoStyle(style)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-all flex items-center gap-2 ${
                    videoStyle === style 
                      ? 'border-primary bg-primary/5 text-primary' 
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {style !== '+ 自定义风格' && (
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      videoStyle === style ? 'border-primary' : 'border-slate-200'
                    }`}>
                      {videoStyle === style && <div className="w-2 h-2 bg-primary rounded-full"></div>}
                    </div>
                  )}
                  {style}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-[15px] font-bold text-slate-800 mb-4 flex items-center gap-1">
              画面比例 <span className="text-red-500">*</span>
            </h3>
            <div className="flex gap-4">
              {ratios.map((ratio) => (
                <button
                  key={ratio.label}
                  onClick={() => setAspectRatio(ratio.label)}
                  className={`w-24 h-24 rounded-2xl border transition-all flex flex-col items-center justify-center gap-3 ${
                    aspectRatio === ratio.label 
                      ? 'border-primary bg-primary/5 text-primary' 
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {ratio.icon}
                  <span className="text-sm font-medium">{ratio.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <button 
            onClick={onStartCreating}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-500/30 px-12 py-5 rounded-full font-bold text-lg flex items-center gap-3 group transition-all duration-300"
          >
            开始创作
            <Zap size={20} className="group-hover:animate-pulse" />
          </button>
        </div>
      </motion.div>
    </section>
  );
};

const GenerationView = ({ onBack, onConfirm, skipLoading = false }: { onBack: () => void, onConfirm: () => void, skipLoading?: boolean }) => {
  const [isGenerating, setIsGenerating] = useState(!skipLoading);

  const [scriptContent, setScriptContent] = useState(
    "【核心梗】\n悲情英雄、惊天阴谋、涅槃复仇、轮回重启\n\n【故事背景】\n取经成功一万年后，三界看似太平，实则天庭与灵山勾结，以“因果”为名，通过收割众生信仰维持永生，众神皆沦为贪婪的食客。曾经的大圣被封为斗战胜佛，却在逐渐察觉真相后，被设计囚禁于幽冥深处。而八戒，这个昔日最没骨气的“呆子”，却在净坛使者的闲职中默默坚守着最后的一丝良知。\n\n【核心冲突】\n八戒偶然发现天庭正筹划一场名为“无生劫”的阴谋，旨在抹除凡间所有关于孙大圣的记忆。为了唤醒被囚的大哥，八戒毅然选择了一场自杀式的反抗。他在三界众神面前，剥落金身，以毕生修为和魂飞魄散为代价，撞开了幽冥之门的裂缝，那一抹残魂化作一滴血泪，落入了孙悟空空洞的眼眸中。\n\n【结局走向】\n八戒之死引发了三界的震颤。曾经那个胆小怕事的猪头消失了，换来的是齐天大圣的怒火重燃。大圣归来，不再是为了取经，而是为了杀穿这虚伪的天庭与灵山，为那个永远喊他“猴哥”的呆子讨回公道。最终，三界秩序崩塌，大圣在废墟中重新确立了“自由”的真义。\n\n【一句话卖点】\n“呆子以命换兄醒，大圣涅槃杀穿三界，只为重开天地！”"
  );

  // Simulate generation completion for demo purposes
  React.useEffect(() => {
    if (skipLoading) return;
    const timer = setTimeout(() => setIsGenerating(false), 3000);
    return () => clearTimeout(timer);
  }, [skipLoading]);

  return (
    <div className="min-h-screen bg-surface flex flex-col font-body">
      <Header showBack onBack={onBack} title="漫剧 Agent" currentStep={1} />

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto px-6 pt-24 pb-10 w-full">
        <AnimatePresence mode="wait">
          {isGenerating ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="h-[60vh] flex flex-col items-center justify-center text-center"
            >
              <div className="relative mb-12">
                <motion.div 
                  animate={{ 
                    scale: [1, 1.1, 1],
                    opacity: [0.3, 0.5, 0.3]
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-[-40px] bg-primary/10 rounded-full blur-2xl"
                ></motion.div>
                <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center relative z-10">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.05, 1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <TomatoIcon className="w-16 h-16" />
                  </motion.div>
                </div>
              </div>
              <h2 className="text-3xl font-extrabold text-on-surface mb-4 font-headline tracking-tight">生成剧本中</h2>
              <p className="text-outline font-medium max-w-md">
                正在根据你的描述生成剧本，预计3分钟左右
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full"
            >
              {/* Script Detail Card */}
              <div className="bg-surface-container-lowest rounded-[2rem] tonal-shadow overflow-hidden flex flex-col border border-surface-container">
                {/* Card Header */}
                <div className="px-10 pt-10 pb-6">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-extrabold text-on-surface tracking-tight font-headline">剧本正文</h2>
                  </div>
                </div>

                {/* Card Content */}
                <div className="px-10 pb-10">
                  <div className="bg-surface-container-low p-6 rounded-2xl">
                    <textarea 
                      value={scriptContent}
                      onChange={(e) => setScriptContent(e.target.value)}
                      className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-on-surface-variant resize-none p-0 leading-loose font-medium min-h-[400px]"
                    />
                  </div>
                </div>

                {/* Card Footer */}
                <div className="px-10 py-8 bg-surface-container-low flex justify-end items-center border-t border-surface-container">
                  <div className="flex items-center gap-6">
                    <button 
                      onClick={onConfirm}
                      className="bg-on-surface hover:bg-black text-surface px-10 py-4 rounded-2xl font-bold tracking-widest text-base shadow-xl active:scale-95 transition-all flex items-center gap-2 group"
                    >
                      确认剧本
                      <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

// --- Main App ---

type ViewState = 'HOME' | 'GENERATING' | 'STUDYING' | 'STORYBOARD' | 'STORYBOARD_VIDEO';

const StudyView = ({ onBack, onComplete }: { onBack: () => void, onComplete: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(() => onComplete(), 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="min-h-screen bg-surface flex flex-col font-body">
      <Header showBack onBack={onBack} title="漫剧 Agent" currentStep={1} />
      
      <main className="flex-grow flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center max-w-md w-full text-center">
          {/* Character Icon Container */}
          <motion.div 
            animate={{ 
              opacity: [1, 0.95, 1],
              scale: [1, 1.02, 1]
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="mb-8 relative"
          >
            {/* Circular light purple background */}
            <div className="w-32 h-32 md:w-40 md:h-40 bg-primary/5 rounded-full flex items-center justify-center overflow-hidden shadow-sm border border-primary/10">
              {/* Tomato Icon */}
              <TomatoIcon className="w-16 h-16 md:w-20 md:h-20" />
            </div>
          </motion.div>

          {/* Text Content */}
         <div>
            <h2 className="text-2xl font-extrabold text-on-surface mb-4 tracking-tight font-headline">研读剧本</h2>
            <p className="text-outline text-sm md:text-base leading-relaxed font-medium">
              正在揣摩故事内核，构思视觉风格，预计1分钟内
            </p>
          </div>
        </div> 
      </main>
      
      <footer className="h-24 pointer-events-none"></footer>
    </div>
  );
};

const SettingsView = ({ onBack, onConfirm }: { onBack: () => void, onConfirm: () => void }) => {
  const [projectName, setProjectName] = useState('八戒之死');
  const [selectedStyle, setSelectedStyle] = useState(1);
  const [selectedRatio, setSelectedRatio] = useState('16:9');
  const [agreed, setAgreed] = useState(true);
  const [generatingImages, setGeneratingImages] = useState(true);

  const [styles, setStyles] = useState([
    { id: 0, name: '2D国风半厚涂', prompt: '2D National Style Semi-Thick Painting, Chinese traditional art elements, vibrant colors, high quality, artistic', img: 'https://picsum.photos/seed/style1/600/800' },
    { id: 1, name: '3DCG动画东方奇幻', prompt: '3DCG Animation Oriental Fantasy, Pixar style, high detail, cinematic lighting, magical atmosphere', img: 'https://picsum.photos/seed/style2/600/800' },
    { id: 2, name: '真人写实电影风格暗调冷色', prompt: 'Live Action Realistic Movie Style, dark tones, cold color grading, cinematic, high fidelity, moody', img: 'https://picsum.photos/seed/style3/600/800' },
    { id: 3, name: '2D日漫半厚涂', prompt: '2D Anime Semi-Thick Painting, Japanese manga style, clean lines, expressive, high quality', img: 'https://picsum.photos/seed/style4/600/800' },
    { id: 4, name: '3D卡通暗黑奇幻', prompt: '3D Cartoon Dark Fantasy, Tim Burton style, whimsical but dark, stylized, high detail', img: 'https://picsum.photos/seed/style5/600/800' },
  ]);

  useEffect(() => {
    const generateImages = async () => {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const updatedStyles = [...styles];
        
        // Generate images in parallel
        const promises = styles.map(async (style, index) => {
          try {
            const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash-image',
              contents: {
                parts: [{ text: style.prompt }],
              },
              config: {
                imageConfig: {
                  aspectRatio: "3:4"
                }
              }
            });

            for (const part of response.candidates[0].content.parts) {
              if (part.inlineData) {
                const base64EncodeString = part.inlineData.data;
                updatedStyles[index] = {
                  ...style,
                  img: `data:image/png;base64,${base64EncodeString}`
                };
              }
            }
          } catch (err) {
            console.error(`Error generating image for ${style.name}:`, err);
          }
        });

        await Promise.all(promises);
        setStyles(updatedStyles);
      } catch (error) {
        console.error("Error initializing Gemini or generating images:", error);
      } finally {
        setGeneratingImages(false);
      }
    };

    generateImages();
  }, []);

  return (
    <div className="min-h-screen bg-surface flex flex-col font-body text-on-surface">
      <Header showBack onBack={onBack} title="八戒之死" currentStep={1} />
      
      <main className="max-w-5xl mx-auto px-6 py-12 w-full">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface-container-lowest rounded-[2rem] tonal-shadow p-12 relative overflow-hidden border border-surface-container"
        >
          {/* Editorial Header */}
          <header className="mb-12">
            <h1 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface mb-2">全局设定</h1>
            <p className="text-outline text-sm font-medium">定义您的剧本核心风格与视听参数</p>
          </header>

          <div className="space-y-10">
            {/* Project Name Section */}
            <section className="space-y-3">
              <label className="block text-sm font-bold text-on-surface">项目名称<span className="text-red-500 ml-1">*</span></label>
              <div className="relative group">
                <input 
                  className="w-full bg-surface-container-low border-none rounded-xl px-5 py-4 focus:ring-2 focus:ring-primary/20 text-on-surface font-medium transition-all outline-none" 
                  placeholder="请输入项目名称" 
                  type="text" 
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-xs text-outline font-medium">{projectName.length}/20</span>
              </div>
            </section>

            {/* Screen Style Section */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-bold text-on-surface">画面风格<span className="text-red-500 ml-1">*</span></label>
                {generatingImages && (
                  <div className="flex items-center gap-2 text-xs text-primary font-bold animate-pulse">
                    <div className="flex items-center gap-2 text-xs text-primary font-bold animate-pulse">
                    <Sparkles size={14} />
                    <span>AI 正在生成风格预览...</span>
                  </div>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {styles.map((style) => (
                  <div 
                    key={style.id} 
                    className="group cursor-pointer"
                    onClick={() => setSelectedStyle(style.id)}
                  >
                    <div className={`aspect-[3/4] rounded-2xl overflow-hidden mb-2 relative transition-all duration-300 ${selectedStyle === style.id ? 'ring-4 ring-primary shadow-lg scale-105' : 'ring-2 ring-transparent hover:ring-primary/30'}`}>
                      {generatingImages && !style.img.startsWith('data:') ? (
                        <div className="w-full h-full bg-surface-container animate-pulse flex items-center justify-center">
                          <Sparkles className="text-surface-container-highest" size={32} />
                        </div>
                      ) : (
                        <img 
                          alt={style.name} 
                          className="w-full h-full object-cover" 
                          src={style.img}
                          referrerPolicy="no-referrer"
                        />
                      )}
                      {selectedStyle === style.id ? (
                        <div className="absolute top-2 right-2 bg-primary text-on-primary rounded-full p-1 shadow-md">
                          <Check size={12} strokeWidth={4} />
                        </div>
                      ) : (
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>
                      )}
                    </div>
                    <p className={`text-[11px] text-center leading-tight transition-colors ${selectedStyle === style.id ? 'font-bold text-primary' : 'font-medium text-outline'}`}>
                      {style.name}
                    </p>
                  </div>
                ))}
              </div>
              {/* Custom Style Trigger */}
              <button className="flex items-center gap-2 text-primary font-bold text-sm mt-4 hover:translate-x-1 transition-transform">
                <Plus size={18} />
                <span>自定义风格</span>
              </button>
            </section>

            {/* Screen Ratio Section */}
            <section className="space-y-4">
              <label className="block text-sm font-bold text-on-surface">画面比例<span className="text-red-500 ml-1">*</span></label>
              <div className="flex gap-6">
                {/* 9:16 */}
                <div 
                  className="flex-1 max-w-[160px] cursor-pointer group"
                  onClick={() => setSelectedRatio('9:16')}
                >
                  <div className={`aspect-[9/16] rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-2 ${selectedRatio === '9:16' ? 'bg-primary/5 border-primary ring-4 ring-primary/5 shadow-md' : 'bg-surface-container-low border-transparent hover:border-surface-container'}`}>
                    <div className={`w-8 h-12 border-2 rounded-sm transition-colors ${selectedRatio === '9:16' ? 'border-primary bg-primary/10' : 'border-outline-variant'}`}></div>
                    <span className={`font-bold text-sm ${selectedRatio === '9:16' ? 'text-primary' : 'text-outline'}`}>9:16</span>
                    {selectedRatio === '9:16' && (
                      <div className="absolute top-3 right-3 bg-primary text-on-primary rounded-full p-0.5 scale-90">
                        <Check size={10} strokeWidth={4} />
                      </div>
                    )}
                  </div>
                </div>
                {/* 16:9 Selected */}
                <div 
                  className="flex-1 max-w-[160px] cursor-pointer group"
                  onClick={() => setSelectedRatio('16:9')}
                >
                  <div className={`aspect-[9/16] rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-2 relative ${selectedRatio === '16:9' ? 'bg-primary/5 border-primary ring-4 ring-primary/5 shadow-md' : 'bg-surface-container-low border-transparent hover:border-surface-container'}`}>
                    <div className={`w-16 h-9 border-2 rounded-sm transition-colors ${selectedRatio === '16:9' ? 'border-primary bg-primary/10' : 'border-outline-variant'}`}></div>
                    <span className={`font-bold text-sm ${selectedRatio === '16:9' ? 'text-primary' : 'text-outline'}`}>16:9</span>
                    {selectedRatio === '16:9' && (
                      <div className="absolute top-3 right-3 bg-primary text-on-primary rounded-full p-0.5 scale-90">
                        <Check size={10} strokeWidth={4} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Agreement Section */}
            <section className="flex items-start gap-4 p-5 rounded-2xl bg-surface-container-low/80 border border-surface-container">
              <div className="mt-1">
                <input 
                  type="checkbox" 
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary/20 cursor-pointer" 
                />
              </div>
              <div>
                <p className="text-sm font-bold text-on-surface">创作者承诺书</p>
                <p className="text-[12px] text-outline leading-relaxed font-medium">适用于创作过程中涉及人脸、声音相关功能及内容的创作者</p>
              </div>
            </section>
          </div>

          {/* Bottom Action */}
          <footer className="mt-16 flex justify-end items-center gap-4">
            <button 
              onClick={onBack}
              className="px-10 py-3 rounded-full border border-surface-container font-bold text-outline hover:bg-surface-container-low transition-colors text-sm"
            >
              取消
            </button>
            <button 
              onClick={onConfirm}
              disabled={!agreed}
              className="px-14 py-3 rounded-full bg-on-surface text-surface font-bold hover:bg-black transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              确认
            </button>
          </footer>
        </motion.div>
      </main>

      {/* Decorative background elements */}
      <div className="fixed top-[20%] right-[-100px] w-[300px] h-[300px] bg-primary/5 rounded-full blur-3xl -z-10"></div>
      <div className="fixed bottom-[10%] left-[-100px] w-[400px] h-[400px] bg-primary/5 rounded-full blur-3xl -z-10"></div>
    </div>
  );
};

const StoryboardView = ({ onBack, onConfirm }: { onBack: () => void, onConfirm: () => void }) => {
  return (
    <div className="min-h-screen bg-surface-bright flex flex-col font-body text-on-surface">
      <Header showBack onBack={onBack} title="漫剧 Agent" currentStep={2} />
      
      <main className="flex-1 px-12 pt-2 pb-12">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold font-headline text-on-surface tracking-tight inline-block relative">
            分镜图
            <div className="absolute -bottom-2 left-0 w-full h-1 bg-primary rounded-full opacity-30"></div>
          </h1>
          <p className="text-on-surface-variant mt-4 font-medium max-w-2xl">
            正在根据您的剧本生成对应的视觉分镜图。请稍候，我们将为您创建高品质的创意镜头。
          </p>
        </div>

        {/* Storyboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Card 1 (85%) */}
          <div className="flex flex-col gap-3">
            <div className="aspect-video bg-surface-container-low rounded-2xl flex items-center justify-center relative overflow-hidden group shadow-[0px_20px_40px_rgba(110,59,216,0.03)] border border-white/50">
              <div className="relative flex flex-col items-center gap-3">
                <div className="relative w-16 h-16">
                  <svg className="w-full h-full">
                    <circle className="text-primary/10" cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" strokeWidth="4"></circle>
                    <circle className="text-primary progress-ring-circle" cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" strokeDasharray="175.9" strokeDashoffset="26.4" strokeLinecap="round" strokeWidth="4"></circle>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-black text-primary">85%</div>
                </div>
                <span className="text-sm font-bold text-primary-dim tracking-wider">生成中...</span>
              </div>
            </div>
            <div className="px-2">
              <h3 className="font-bold text-on-surface text-sm">镜头 1: 城市远景</h3>
              <p className="text-xs text-on-surface-variant line-clamp-2 mt-1">未来感十足的城市天际线，霓虹灯光在细雨中闪烁。</p>
            </div>
          </div>

          {/* Card 2 (62%) */}
          <div className="flex flex-col gap-3">
            <div className="aspect-video bg-surface-container-low rounded-2xl flex items-center justify-center relative overflow-hidden group shadow-[0px_20px_40px_rgba(110,59,216,0.03)] border border-white/50">
              <div className="relative flex flex-col items-center gap-3">
                <div className="relative w-16 h-16">
                  <svg className="w-full h-full">
                    <circle className="text-primary/10" cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" strokeWidth="4"></circle>
                    <circle className="text-primary progress-ring-circle" cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" strokeDasharray="175.9" strokeDashoffset="66.8" strokeLinecap="round" strokeWidth="4"></circle>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-black text-primary">62%</div>
                </div>
                <span className="text-sm font-bold text-primary-dim tracking-wider">生成中...</span>
              </div>
            </div>
            <div className="px-2">
              <h3 className="font-bold text-on-surface text-sm">镜头 2: 主角特写</h3>
              <p className="text-xs text-on-surface-variant line-clamp-2 mt-1">主角在喧闹的街道中心停下，眼神流露出迷茫。</p>
            </div>
          </div>

          {/* Card 3 (45%) */}
          <div className="flex flex-col gap-3">
            <div className="aspect-video bg-surface-container-low rounded-2xl flex items-center justify-center relative overflow-hidden group shadow-[0px_20px_40px_rgba(110,59,216,0.03)] border border-white/50">
              <div className="relative flex flex-col items-center gap-3">
                <div className="relative w-16 h-16">
                  <svg className="w-full h-full">
                    <circle className="text-primary/10" cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" strokeWidth="4"></circle>
                    <circle className="text-primary progress-ring-circle" cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" strokeDasharray="175.9" strokeDashoffset="96.7" strokeLinecap="round" strokeWidth="4"></circle>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-black text-primary">45%</div>
                </div>
                <span className="text-sm font-bold text-primary-dim tracking-wider">生成中...</span>
              </div>
            </div>
            <div className="px-2">
              <h3 className="font-bold text-on-surface text-sm">镜头 3: 街道细节</h3>
              <p className="text-xs text-on-surface-variant line-clamp-2 mt-1">积水中的倒影被急速驶过的悬浮车溅开。</p>
            </div>
          </div>

          {/* Card 4 (30%) */}
          <div className="flex flex-col gap-3">
            <div className="aspect-video bg-surface-container-low rounded-2xl flex items-center justify-center relative overflow-hidden group shadow-[0px_20px_40px_rgba(110,59,216,0.03)] border border-white/50">
              <div className="relative flex flex-col items-center gap-3">
                <div className="relative w-16 h-16">
                  <svg className="w-full h-full">
                    <circle className="text-primary/10" cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" strokeWidth="4"></circle>
                    <circle className="text-primary progress-ring-circle" cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" strokeDasharray="175.9" strokeDashoffset="123.1" strokeLinecap="round" strokeWidth="4"></circle>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-black text-primary">30%</div>
                </div>
                <span className="text-sm font-bold text-primary-dim tracking-wider">生成中...</span>
              </div>
            </div>
            <div className="px-2">
              <h3 className="font-bold text-on-surface text-sm">镜头 4: 仰视视角</h3>
              <p className="text-xs text-on-surface-variant line-clamp-2 mt-1">巨大的全息广告牌投射出刺眼的光芒。</p>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Action */}
      <div className="px-12 py-6 bg-surface border-t border-surface-container flex justify-end items-center sticky bottom-0 z-10">
        <button 
          onClick={onConfirm}
          className="bg-on-surface hover:bg-black text-surface px-10 py-4 rounded-2xl font-bold tracking-widest text-base shadow-xl active:scale-95 transition-all flex items-center gap-2 group"
        >
          生成视频
          <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Decorative background elements */}
      <div className="fixed top-[20%] right-[-100px] w-[300px] h-[300px] bg-primary/5 rounded-full blur-3xl -z-10"></div>
      <div className="fixed bottom-[10%] left-[-100px] w-[400px] h-[400px] bg-primary/5 rounded-full blur-3xl -z-10"></div>
    </div>
  );
};

const StoryboardVideoView = ({ onBack, onConfirm }: { onBack: () => void, onConfirm: () => void }) => {
  return (
    <div className="min-h-screen bg-surface-bright flex flex-col font-body text-on-surface">
      <Header showBack onBack={onBack} title="漫剧 Agent" currentStep={3} />
      
      <main className="flex-1 px-12 pt-2 pb-12">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold font-headline text-on-surface tracking-tight inline-block relative">
            分镜视频
            <div className="absolute -bottom-2 left-0 w-full h-1 bg-primary rounded-full opacity-30"></div>
          </h1>
          <p className="text-on-surface-variant mt-4 font-medium max-w-2xl">
            正在根据您的剧本生成对应的分镜视频。请稍候，我们将为您创建高品质的创意镜头。
          </p>
        </div>

        {/* Storyboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Card 1 (85%) */}
          <div className="flex flex-col gap-3">
            <div className="aspect-video bg-surface-container-low rounded-2xl flex items-center justify-center relative overflow-hidden group shadow-[0px_20px_40px_rgba(110,59,216,0.03)] border border-white/50">
              <div className="relative flex flex-col items-center gap-3">
                <div className="relative w-16 h-16">
                  <svg className="w-full h-full">
                    <circle className="text-primary/10" cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" strokeWidth="4"></circle>
                    <circle className="text-primary progress-ring-circle" cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" strokeDasharray="175.9" strokeDashoffset="26.4" strokeLinecap="round" strokeWidth="4"></circle>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-black text-primary">85%</div>
                </div>
                <span className="text-sm font-bold text-primary-dim tracking-wider">生成中...</span>
              </div>
            </div>
            <div className="px-2">
              <h3 className="font-bold text-on-surface text-sm">镜头 1: 城市远景</h3>
              <p className="text-xs text-on-surface-variant line-clamp-2 mt-1">未来感十足的城市天际线，霓虹灯光在细雨中闪烁。</p>
            </div>
          </div>

          {/* Card 2 (62%) */}
          <div className="flex flex-col gap-3">
            <div className="aspect-video bg-surface-container-low rounded-2xl flex items-center justify-center relative overflow-hidden group shadow-[0px_20px_40px_rgba(110,59,216,0.03)] border border-white/50">
              <div className="relative flex flex-col items-center gap-3">
                <div className="relative w-16 h-16">
                  <svg className="w-full h-full">
                    <circle className="text-primary/10" cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" strokeWidth="4"></circle>
                    <circle className="text-primary progress-ring-circle" cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" strokeDasharray="175.9" strokeDashoffset="66.8" strokeLinecap="round" strokeWidth="4"></circle>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-black text-primary">62%</div>
                </div>
                <span className="text-sm font-bold text-primary-dim tracking-wider">生成中...</span>
              </div>
            </div>
            <div className="px-2">
              <h3 className="font-bold text-on-surface text-sm">镜头 2: 主角特写</h3>
              <p className="text-xs text-on-surface-variant line-clamp-2 mt-1">主角在喧闹的街道中心停下，眼神流露出迷茫。</p>
            </div>
          </div>

          {/* Card 3 (45%) */}
          <div className="flex flex-col gap-3">
            <div className="aspect-video bg-surface-container-low rounded-2xl flex items-center justify-center relative overflow-hidden group shadow-[0px_20px_40px_rgba(110,59,216,0.03)] border border-white/50">
              <div className="relative flex flex-col items-center gap-3">
                <div className="relative w-16 h-16">
                  <svg className="w-full h-full">
                    <circle className="text-primary/10" cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" strokeWidth="4"></circle>
                    <circle className="text-primary progress-ring-circle" cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" strokeDasharray="175.9" strokeDashoffset="96.7" strokeLinecap="round" strokeWidth="4"></circle>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-black text-primary">45%</div>
                </div>
                <span className="text-sm font-bold text-primary-dim tracking-wider">生成中...</span>
              </div>
            </div>
            <div className="px-2">
              <h3 className="font-bold text-on-surface text-sm">镜头 3: 街道细节</h3>
              <p className="text-xs text-on-surface-variant line-clamp-2 mt-1">积水中的倒影被急速驶过的悬浮车溅开。</p>
            </div>
          </div>

          {/* Card 4 (30%) */}
          <div className="flex flex-col gap-3">
            <div className="aspect-video bg-surface-container-low rounded-2xl flex items-center justify-center relative overflow-hidden group shadow-[0px_20px_40px_rgba(110,59,216,0.03)] border border-white/50">
              <div className="relative flex flex-col items-center gap-3">
                <div className="relative w-16 h-16">
                  <svg className="w-full h-full">
                    <circle className="text-primary/10" cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" strokeWidth="4"></circle>
                    <circle className="text-primary progress-ring-circle" cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" strokeDasharray="175.9" strokeDashoffset="123.1" strokeLinecap="round" strokeWidth="4"></circle>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-black text-primary">30%</div>
                </div>
                <span className="text-sm font-bold text-primary-dim tracking-wider">生成中...</span>
              </div>
            </div>
            <div className="px-2">
              <h3 className="font-bold text-on-surface text-sm">镜头 4: 仰视视角</h3>
              <p className="text-xs text-on-surface-variant line-clamp-2 mt-1">巨大的全息广告牌投射出刺眼的光芒。</p>
            </div>
          </div>
        </div>
      </main>

      {/* Decorative background elements */}
      <div className="fixed top-[20%] right-[-100px] w-[300px] h-[300px] bg-primary/5 rounded-full blur-3xl -z-10"></div>
      <div className="fixed bottom-[10%] left-[-100px] w-[400px] h-[400px] bg-primary/5 rounded-full blur-3xl -z-10"></div>
    </div>
  );
};

export default function App() {
  const [view, setView] = useState<ViewState>('HOME');
  const [hasGeneratedScript, setHasGeneratedScript] = useState(false);

  const renderView = () => {
    switch (view) {
      case 'GENERATING':
        return (
          <GenerationView 
            skipLoading={hasGeneratedScript}
            onBack={() => {
              setView('HOME');
              setHasGeneratedScript(false);
            }} 
            onConfirm={() => {
              setHasGeneratedScript(true);
              setView('STORYBOARD');
            }}
          />
        );
      case 'STORYBOARD':
        return (
          <StoryboardView 
            onBack={() => setView('GENERATING')} 
            onConfirm={() => setView('STORYBOARD_VIDEO')}
          />
        );
      case 'STORYBOARD_VIDEO':
        return (
          <StoryboardVideoView 
            onBack={() => setView('STORYBOARD')} 
            onConfirm={() => setView('HOME')}
          />
        );
      default:
        return (
          <div className="min-h-screen selection:bg-primary/20 selection:text-primary">
            <Header />
            
            <main>
              <Hero />
              <CreatorSection onStartCreating={() => setView('GENERATING')} />
            </main>

            <footer className="py-12 text-center text-slate-300 text-sm font-medium border-t border-slate-100">
       
            </footer>

            {/* Decorative background elements */}
            <div className="fixed top-0 left-1/2 -translate-x-1/2 -z-10 w-full h-full pointer-events-none overflow-hidden">
              <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 blur-[140px] rounded-full"></div>
              <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 blur-[140px] rounded-full"></div>
            </div>
          </div>
        );
    }
  };

  return renderView();
}
