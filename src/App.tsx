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
  Info,
  Trash2,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  formatScriptJsonForDisplay,
  getFirstCharacterPromptForShot,
  parseCharacterRequirements,
  parseSceneRequirements,
  parseShotsFromScriptJson,
  pickShotRoleAndSceneUrls
} from '@/shared/parseScriptJson';

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

const Header = ({ showBack, onBack, onHome, onStepClick, canStepNavigate = false, maxReachedStep = 1, title, currentStep = 1, hideSteps = false, hideTitle = false }: { showBack?: boolean, onBack?: () => void, onHome?: () => void, onStepClick?: (step: number) => void, canStepNavigate?: boolean, maxReachedStep?: number, title?: string, currentStep?: number, hideSteps?: boolean, hideTitle?: boolean }) => {
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
            <button
              onClick={onHome}
              className="flex items-center gap-3 cursor-pointer"
            >
              <TomatoIcon className="w-10 h-10" />
              <span className="text-2xl font-extrabold text-primary font-headline tracking-tight">小番茄</span>
            </button>
          )}
          {title && !hideTitle && (
            title === '短剧 Agent' && onBack ? (
              <button
                onClick={onBack}
                className="text-xl font-extrabold text-primary font-headline tracking-tight hover:text-primary-dim transition-colors"
              >
                {title}
              </button>
            ) : (
              <span className="text-xl font-extrabold text-primary font-headline tracking-tight">{title}</span>
            )
          )}
        </div>
        
        <div className="hidden lg:flex items-center gap-12 text-[15px] font-semibold ml-16">
          {/* Steps */}
          {title && !hideSteps && (
            <div className="flex items-center gap-8">
              {[
                { id: 1, label: '剧本大纲' },
                { id: 2, label: '分镜图' },
                { id: 3, label: '分镜视频' }
              ].map((step, index, arr) => {
                const stepClickable = canStepNavigate && step.id <= maxReachedStep;
                return (
                <div key={step.id} className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => stepClickable && onStepClick?.(step.id)}
                    className={`flex items-center gap-2 ${stepClickable ? 'cursor-pointer' : 'cursor-default'}`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      step.id === currentStep
                        ? 'bg-primary text-on-primary'
                        : step.id <= maxReachedStep
                        ? 'bg-primary/15 text-primary'
                        : 'bg-surface-container-highest text-outline'
                    }`}>
                      {step.id}
                    </div>
                    <span className={`text-sm font-bold ${
                      step.id === currentStep ? 'text-primary' : step.id <= maxReachedStep ? 'text-primary/90' : 'text-outline'
                    }`}>
                      {step.label}
                    </span>
                  </button>
                  {index < arr.length - 1 && (
                    <ArrowRight size={14} className={`ml-1 ${step.id < maxReachedStep ? 'text-primary/70' : 'text-outline/60'}`} />
                  )}
                </div>
                );
              })}
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
          {title ? '会员' : '会员'}
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

const MyProjectsSection = ({
  projects,
  onOpenProject,
  onDeleteProject
}: {
  projects: SavedProject[];
  onOpenProject: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
}) => {
  if (projects.length === 0) return null;

  return (
    <section className="max-w-5xl mx-auto px-6 mb-16">
      <div className="bg-white rounded-[36px] p-8 tonal-shadow border border-surface-container">
        <div className="flex items-center mb-6">
          <h2 className="text-2xl font-extrabold text-on-surface font-headline tracking-tight">我的项目</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {projects.map((project) => (
            <div
              key={project.id}
              role="button"
              tabIndex={0}
              onClick={() => onOpenProject(project.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') onOpenProject(project.id);
              }}
              className="relative text-left rounded-2xl border border-surface-container bg-surface-container-low p-4 hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteProject(project.id);
                }}
                className="absolute top-3 right-3 w-7 h-7 rounded-full bg-surface/85 border border-surface-container-high text-outline hover:text-red-500 hover:border-red-200 transition-colors flex items-center justify-center"
                aria-label="删除项目"
                title="删除项目"
              >
                <Trash2 size={14} />
              </button>
              <img
                src={project.coverImage}
                alt={`${project.name}封面`}
                className="w-full rounded-xl bg-black/10 aspect-video object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="mt-3 px-1">
                <p className="text-sm font-bold text-on-surface">{project.name}</p>
                <p className="text-xs text-on-surface-variant mt-1">{project.updatedAt}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const CreatorSection = ({ onStartCreating }: { onStartCreating: (payload: { text: string; style: string; ratio: "16:9" | "9:16" }) => void }) => {
  const [prompt, setPrompt] = useState('');
  const [videoStyle, setVideoStyle] = useState('3DCG动画东方奇幻');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [customStyleInput, setCustomStyleInput] = useState('');
  const [customStyles, setCustomStyles] = useState<string[]>([]);
  const [isAddingCustomStyle, setIsAddingCustomStyle] = useState(false);

  const presetStyles = [
    '2D国风半厚涂',
    '3DCG动画东方奇幻',
    '真人写实电影风格暗调冷色',
    '2D日漫半厚涂',
    '3D卡通暗黑奇幻'
  ];
  const styles = [...presetStyles, ...customStyles];

  const ratios = [
    { label: '9:16', icon: <div className="w-3 h-5 border-2 border-current rounded-[2px]"></div> },
    { label: '16:9', icon: <div className="w-5 h-3 border-2 border-current rounded-[2px]"></div> }
  ];

  return (
    <section className="max-w-5xl mx-auto px-6 mb-14">
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
              {styles.map((style) => {
                const isSelected = !isAddingCustomStyle && videoStyle === style;
                return (
                <button
                  key={style}
                  onClick={() => {
                    setIsAddingCustomStyle(false);
                    setCustomStyleInput('');
                    setVideoStyle(style);
                  }}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-all flex items-center gap-2 ${
                    isSelected
                      ? 'border-primary bg-primary/5 text-primary' 
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    isSelected ? 'border-primary' : 'border-slate-200'
                  }`}>
                    {isSelected && <div className="w-2 h-2 bg-primary rounded-full"></div>}
                  </div>
                  {style}
                </button>
                );
              })}
              {isAddingCustomStyle ? (
                <input
                  type="text"
                  value={customStyleInput}
                  autoFocus
                  onChange={(e) => setCustomStyleInput(e.target.value)}
                  onBlur={() => {
                    if (!customStyleInput.trim()) setIsAddingCustomStyle(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setCustomStyleInput('');
                      setIsAddingCustomStyle(false);
                      return;
                    }
                    if (e.key !== 'Enter') return;
                    const next = customStyleInput.trim();
                    if (!next) return;
                    setCustomStyles((prev) => (prev.includes(next) ? prev : [...prev, next]));
                    setVideoStyle(next);
                    setCustomStyleInput('');
                    setIsAddingCustomStyle(false);
                  }}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium border transition-all border-primary/40 bg-primary/5 text-slate-700 w-[180px] focus:outline-none focus:ring-1 focus:ring-primary/30"
                />
              ) : (
                <button
                  onClick={() => setIsAddingCustomStyle(true)}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium border transition-all border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                >
                  + 自定义风格
                </button>
              )}
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
          {(() => {
            const canStart = prompt.trim().length > 0;
            return (
          <button 
            onClick={() =>
              onStartCreating({
                text: prompt,
                style: videoStyle,
                ratio: aspectRatio as "16:9" | "9:16"
              })
            }
            disabled={!canStart}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-500/30 px-12 py-5 rounded-full font-bold text-lg flex items-center gap-3 group transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-purple-600 disabled:hover:to-indigo-600"
          >
            开始创作
            <Zap size={20} className="group-hover:animate-pulse" />
          </button>
            );
          })()}
        </div>
      </motion.div>
    </section>
  );
};

const GenerationView = ({ onBack, onHome, onStepClick, canStepNavigate, maxReachedStep, scriptContent, onScriptChange, onConfirm, isGenerating, canProceed }: { onBack: () => void, onHome: () => void, onStepClick: (step: number) => void, canStepNavigate: boolean, maxReachedStep: number, scriptContent: string, onScriptChange: (content: string) => void, onConfirm: () => void, isGenerating: boolean, canProceed: boolean }) => {

  return (
    <div className="min-h-screen bg-surface flex flex-col font-body">
      <Header showBack onBack={onBack} onHome={onHome} onStepClick={onStepClick} canStepNavigate={canStepNavigate} maxReachedStep={maxReachedStep} title="短剧 Agent" currentStep={1} />

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
                    <h2 className="text-2xl font-extrabold text-on-surface tracking-tight font-headline">剧本大纲</h2>
                  </div>
                </div>

                {/* Card Content */}
                <div className="px-10 pb-10">
                  <div className="bg-surface-container-low p-6 rounded-2xl">
                    <textarea 
                      value={scriptContent}
                      onChange={(e) => onScriptChange(e.target.value)}
                      spellCheck={false}
                      className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-on-surface-variant resize-none p-0 leading-relaxed font-mono text-sm min-h-[400px]"
                    />
                  </div>
                </div>

                {/* Card Footer */}
                <div className="px-10 py-8 bg-surface-container-low flex justify-end items-center border-t border-surface-container">
                  <div className="flex items-center gap-6">
                    <button 
                      onClick={onConfirm}
                      disabled={!canProceed}
                      className="bg-on-surface hover:bg-black text-surface px-10 py-4 rounded-2xl font-bold tracking-widest text-base shadow-xl active:scale-95 transition-all flex items-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-on-surface"
                    >
                      生成分镜图
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

const StudyView = ({ onBack, onHome, onComplete }: { onBack: () => void, onHome: () => void, onComplete: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(() => onComplete(), 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="min-h-screen bg-surface flex flex-col font-body">
      <Header showBack onBack={onBack} onHome={onHome} title="短剧 Agent" currentStep={1} />
      
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

type ShotItem = {
  id: number;
  title: string;
  description: string;
  prompt: string;
  progress: number;
  imageUrl: string;
};

type SavedProject = {
  id: string;
  name: string;
  updatedAt: string;
  coverImage: string;
  ratio: "16:9" | "9:16";
  scriptContent: string;
  storyboardShots: ShotItem[];
  /** 分镜页「场景」标签下的分镜，与角色分镜一一对应 */
  storyboardSceneShots?: ShotItem[];
  storyboardVideoShots: ShotItem[];
  videoUrls?: Record<number, string>;
  /** 每镜头 referenceImages 文案，与剧本 JSON 一致；视频 API 按槽位匹配角色/场景生图 URL */
  videoReferenceImages?: Record<number, string>;
};

const DEFAULT_SCRIPT_CONTENT = `{
  "storyTitle": "",
  "storySummary": "",
  "characterImageRequirements": [],
  "sceneImageRequirements": [],
  "shotScript": []
}`;

const DEFAULT_STORYBOARD_SHOTS: ShotItem[] = [
  { id: 1, title: '镜头 1', description: '未来感十足的城市天际线，霓虹灯光在细雨中闪烁。', prompt: '未来感十足的城市天际线，霓虹灯光在细雨中闪烁。', progress: 100, imageUrl: 'https://picsum.photos/seed/storyboard-1/1280/720' },
  { id: 2, title: '镜头 2', description: '主角在喧闹的街道中心停下，眼神流露出迷茫。', prompt: '主角在喧闹的街道中心停下，眼神流露出迷茫。', progress: 100, imageUrl: 'https://picsum.photos/seed/storyboard-2/1280/720' },
  { id: 3, title: '镜头 3', description: '积水中的倒影被急速驶过的悬浮车溅开。', prompt: '积水中的倒影被急速驶过的悬浮车溅开。', progress: 100, imageUrl: 'https://picsum.photos/seed/storyboard-3/1280/720' },
  { id: 4, title: '镜头 4', description: '巨大的全息广告牌投射出刺眼的光芒。', prompt: '巨大的全息广告牌投射出刺眼的光芒。', progress: 100, imageUrl: 'https://picsum.photos/seed/storyboard-4/1280/720' }
];

const DEFAULT_STORYBOARD_VIDEO_SHOTS: ShotItem[] = [
  { id: 1, title: '镜头 1', description: '未来感十足的城市天际线，霓虹灯光在细雨中闪烁。', prompt: '未来感十足的城市天际线，霓虹灯光在细雨中闪烁。', progress: 100, imageUrl: 'https://picsum.photos/seed/storyboard-video-1/1280/720' },
  { id: 2, title: '镜头 2', description: '主角在喧闹的街道中心停下，眼神流露出迷茫。', prompt: '主角在喧闹的街道中心停下，眼神流露出迷茫。', progress: 100, imageUrl: 'https://picsum.photos/seed/storyboard-video-2/1280/720' },
  { id: 3, title: '镜头 3', description: '积水中的倒影被急速驶过的悬浮车溅开。', prompt: '积水中的倒影被急速驶过的悬浮车溅开。', progress: 100, imageUrl: 'https://picsum.photos/seed/storyboard-video-3/1280/720' },
  { id: 4, title: '镜头 4', description: '巨大的全息广告牌投射出刺眼的光芒。', prompt: '巨大的全息广告牌投射出刺眼的光芒。', progress: 100, imageUrl: 'https://picsum.photos/seed/storyboard-video-4/1280/720' }
];

type BackendShot = {
  shotNumber: number;
  title: string;
  imagePromptjs: string;
  imagePromptcj: string;
  referenceImages: string;
  videoPrompt: string;
  duration?: number;
};

const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || "http://localhost:8787";

const PROJECT_NAME_MAX = 28;

/** 保存/展示用：优先剧本 JSON 的 storyTitle，其次 storySummary，再其次首镜描述，最后创建梗概 */
function deriveProjectDisplayName(scriptContent: string, creationSeedText?: string): string {
  const clean = (s: string) => s.replace(/\s+/g, " ").trim();
  const truncate = (s: string) => {
    const t = clean(s);
    if (t.length <= PROJECT_NAME_MAX) return t;
    return `${t.slice(0, PROJECT_NAME_MAX - 1)}…`;
  };

  if (scriptContent.includes("剧本生成失败")) {
    if (creationSeedText?.trim()) return truncate(creationSeedText);
    return "未命名项目";
  }

  try {
    const raw = scriptContent.trim();
    if (raw.startsWith("{")) {
      const o = JSON.parse(raw) as {
        storyTitle?: unknown;
        storySummary?: unknown;
        shotScript?: Array<{ shotDescription?: string }>;
      };
      const title = typeof o.storyTitle === "string" ? o.storyTitle.trim() : "";
      if (title) return truncate(title);
      const sum = typeof o.storySummary === "string" ? o.storySummary.trim() : "";
      if (sum) return truncate(sum);
      const d0 = o.shotScript?.[0]?.shotDescription;
      if (typeof d0 === "string" && d0.trim()) return truncate(d0);
    }
  } catch {
    /* ignore */
  }

  if (creationSeedText?.trim()) return truncate(creationSeedText);
  return "未命名项目";
}

/** 角色参考图：每个 characterName 一张卡片（已去重） */
const buildUniqueRoleShotItems = (script: string): ShotItem[] =>
  parseCharacterRequirements(script).map((c, i) => ({
    id: i + 1,
    title: c.characterName,
    description: "",
    prompt: c.imagePromptjs,
    progress: 0,
    imageUrl: ""
  }));

/** 场景参考图：每个 sceneName 一张卡片（已去重） */
const buildUniqueSceneShotItems = (script: string): ShotItem[] =>
  parseSceneRequirements(script).map((s, i) => ({
    id: i + 1,
    title: s.sceneName,
    description: "",
    prompt: s.imagePromptcj,
    progress: 0,
    imageUrl: ""
  }));

/** 分镜视频：仍按镜头号，标题为「镜头 N」 */
const buildVideoShotItemsFromParsed = (parsedShots: BackendShot[]): ShotItem[] =>
  parsedShots.map((shot) => ({
    id: shot.shotNumber,
    title: `镜头 ${shot.shotNumber}`,
    description: "",
    prompt: shot.videoPrompt || "",
    progress: 0,
    imageUrl: ""
  }));

/**
 * shotScript 为空时，若有角色/场景表则补 1 条占位分镜，否则「生成视频」会发 shots=[] 被后端拒绝。
 */
const ensureParsedShotsForVideo = (
  parsed: BackendShot[],
  chars: ReturnType<typeof parseCharacterRequirements>,
  scns: ReturnType<typeof parseSceneRequirements>
): BackendShot[] => {
  if (parsed.length > 0) return parsed;
  if (chars.length === 0 && scns.length === 0) return [];
  const refParts: string[] = [];
  if (chars[0]) refParts.push(`[${chars[0].characterName}参考图URL]`);
  if (scns[0]) refParts.push(`[${scns[0].sceneName}参考图URL]`);
  return [
    {
      shotNumber: 1,
      title: "镜头 1",
      imagePromptjs: chars[0]?.imagePromptjs || "",
      imagePromptcj: scns[0]?.imagePromptcj || "",
      referenceImages: refParts.join(" + "),
      videoPrompt: "根据剧本内容生成镜头运动、表演与节奏。"
    }
  ];
};

const ensureVideoShotTitle = (shot: ShotItem): ShotItem => ({
  ...shot,
  title: /^镜头\s*\d+/u.test(shot.title.trim()) ? shot.title : `镜头 ${shot.id}`
});

const postJson = async <T,>(path: string, body: unknown): Promise<T> => {
  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!response.ok) {
    let detail = `${response.status} ${response.statusText || ""}`.trim();
    try {
      const j = (await response.json()) as { error?: string };
      if (typeof j?.error === "string" && j.error.trim()) detail = j.error.trim();
    } catch {
      /* ignore */
    }
    throw new Error(detail || `Request failed: ${path}`);
  }
  return response.json() as Promise<T>;
};

const downloadImage = async (url: string, fileName: string) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(objectUrl);
  } catch (error) {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
};

type StoryboardCardProps = {
  item: ShotItem;
  isExpanded: boolean;
  isZoomed: boolean;
  isRegenerating: boolean;
  /** 首轮批量生成中（如视频第一次生成）：圆环 0% +「生成中...」，与生图首次生成一致 */
  isBatchGenerating?: boolean;
  mediaType?: "image" | "video";
  mediaUrl?: string;
  onTogglePrompt: () => void;
  onPromptChange: (value: string) => void;
  onToggleZoom: () => void;
  onRegenerate: () => void;
  onDownload: () => void;
};

const StoryboardCard: React.FC<StoryboardCardProps> = ({
  item,
  isExpanded,
  isZoomed,
  isRegenerating,
  isBatchGenerating = false,
  mediaType = "image",
  mediaUrl,
  onTogglePrompt,
  onPromptChange,
  onToggleZoom,
  onRegenerate,
  onDownload
}) => {
  const ringProgress = isBatchGenerating ? 0 : item.progress;
  const strokeOffset = 175.9 * (1 - ringProgress / 100);
  const showLoadingOverlay = item.progress < 100 || isRegenerating || isBatchGenerating;
  const showRegenerateStyle = isRegenerating && !isBatchGenerating;

  return (
    <div className={`flex flex-col gap-3 transition-all duration-300 ${isZoomed ? 'md:col-span-2 lg:col-span-2' : ''}`}>
      <div
        className={`rounded-2xl relative overflow-hidden group shadow-[0px_20px_40px_rgba(110,59,216,0.03)] border transition-all cursor-pointer ${
          isZoomed
            ? 'border-primary/40 ring-2 ring-primary/15 min-h-[360px]'
            : 'border-white/50 hover:border-primary/20 aspect-video'
        }`}
        onClick={onToggleZoom}
      >
        {showLoadingOverlay ? (
          <div className="w-full h-full bg-surface-container-low flex items-center justify-center">
            <div className="relative flex flex-col items-center gap-3">
              {showRegenerateStyle ? (
                <RefreshCw size={16} className="animate-spin text-primary/85" />
              ) : (
                <div className="relative w-16 h-16">
                  <svg className="w-full h-full">
                    <circle className="text-primary/10" cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" strokeWidth="4"></circle>
                    <circle
                      className="text-primary progress-ring-circle"
                      cx="32"
                      cy="32"
                      fill="transparent"
                      r="28"
                      stroke="currentColor"
                      strokeDasharray="175.9"
                      strokeDashoffset={strokeOffset}
                      strokeLinecap="round"
                      strokeWidth="4"
                    ></circle>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-black text-primary">
                    {`${Math.round(ringProgress)}%`}
                  </div>
                </div>
              )}
              <span className="text-sm font-bold text-primary-dim tracking-wider">
                {showRegenerateStyle ? (
                  <span className="text-xs font-semibold tracking-normal">重新生成中...</span>
                ) : (
                  "生成中..."
                )}
              </span>
            </div>
          </div>
        ) : (
          <>
            {mediaType === "video" && mediaUrl ? (
              <video
                className={`w-full h-full transition-all duration-300 ${isZoomed ? 'object-contain bg-surface-container-lowest' : 'object-cover'}`}
                src={mediaUrl}
                controls
                preload="metadata"
              />
            ) : (
              <img
                alt={item.title}
                className={`w-full h-full transition-all duration-300 ${isZoomed ? 'object-contain bg-surface-container-lowest' : 'object-cover'}`}
                src={item.imageUrl}
                referrerPolicy="no-referrer"
              />
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDownload();
              }}
              className="absolute bottom-2 right-2 min-w-6 h-5 px-1.5 rounded-md border border-surface-container-high bg-surface/80 text-on-surface/75 transition-all duration-200 hover:bg-surface hover:-translate-y-0.5 flex items-center justify-center"
              aria-label="下载图片"
              title="下载图片"
            >
              <span className="text-xs leading-none">↓</span>
            </button>
          </>
        )}
      </div>

      <div className="px-2">
        <h3 className="font-bold text-on-surface text-sm">{item.title}</h3>
      </div>

      <div className="mx-2">
        <button
          onClick={onTogglePrompt}
          className="flex items-center gap-1 text-xs font-semibold text-on-surface/65 hover:text-on-surface/85 transition-colors"
        >
          <span>提示词</span>
          <ChevronDown size={13} className={`transition-transform ${isExpanded ? 'rotate-0' : '-rotate-90'}`} />
        </button>
        {isExpanded && (
          <div className="mt-1.5 bg-surface-container-low/70 rounded-lg border border-surface-container/70 p-2.5">
            <div className="relative">
              <textarea
                value={item.prompt}
                onChange={(e) => onPromptChange(e.target.value)}
                className="w-full min-h-20 max-h-28 overflow-y-auto prompt-scrollbar text-xs leading-relaxed rounded-md border border-surface-container-high/70 bg-surface/80 px-2.5 py-2 pr-8 pb-7 resize-none focus:outline-none focus:ring-1 focus:ring-primary/15"
              />
              <button
                onClick={onRegenerate}
                className="absolute bottom-4 right-4 text-primary/65 hover:text-primary/85 transition-colors"
                aria-label="重新生成"
              >
                <RefreshCw size={11} className={showRegenerateStyle ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const StoryboardView = ({
  onBack,
  onHome,
  onStepClick,
  canStepNavigate,
  maxReachedStep,
  shotsRole,
  shotsScene,
  onShotsChangeRole,
  onShotsChangeScene,
  onConfirm,
  canProceed,
  videoShotCount
}: {
  onBack: () => void;
  onHome: () => void;
  onStepClick: (step: number) => void;
  canStepNavigate: boolean;
  maxReachedStep: number;
  shotsRole: ShotItem[];
  shotsScene: ShotItem[];
  onShotsChangeRole: (shots: ShotItem[]) => void;
  onShotsChangeScene: (shots: ShotItem[]) => void;
  onConfirm: () => void;
  canProceed: boolean;
  /** 第三步视频卡片数量；为 0 时无法调视频接口 */
  videoShotCount: number;
}) => {
  const [storyboardTab, setStoryboardTab] = useState<"role" | "scene">("role");
  const [expandedPromptId, setExpandedPromptId] = useState<number | null>(1);
  const [zoomedShotId, setZoomedShotId] = useState<number | null>(null);
  const [regeneratingIds, setRegeneratingIds] = useState<number[]>([]);

  const shots = storyboardTab === "role" ? shotsRole : shotsScene;
  const onShotsChange = storyboardTab === "role" ? onShotsChangeRole : onShotsChangeScene;

  useEffect(() => {
    setExpandedPromptId(null);
    setZoomedShotId(null);
  }, [storyboardTab]);

  const regenerateShot = (id: number) => {
    setRegeneratingIds((prev) => [...prev, id]);
    const target = shots.find((item) => item.id === id);
    if (!target) return;
    postJson<{ results: Array<{ shotNumber: number; imageUrl: string }> }>("/api/storyboard/generate-images", {
      shots: [
        {
          shotNumber: id,
          imagePrompt: target.prompt,
          kind: storyboardTab === "scene" ? "scene" : "role"
        }
      ]
    })
      .then((data) => {
        const url = data.results?.[0]?.imageUrl || "";
        onShotsChange(
          shots.map((item) => (item.id === id ? { ...item, progress: 100, imageUrl: url || item.imageUrl } : item))
        );
      })
      .finally(() => {
        setRegeneratingIds((prev) => prev.filter((currentId) => currentId !== id));
      });
  };

  return (
    <div className="min-h-screen bg-surface-bright flex flex-col font-body text-on-surface">
      <Header showBack onBack={onBack} onHome={onHome} onStepClick={onStepClick} canStepNavigate={canStepNavigate} maxReachedStep={maxReachedStep} title="短剧 Agent" currentStep={2} />
      
      <main className="flex-1 px-12 pt-2 pb-12">
        <div className="mb-6 flex gap-8 border-b border-surface-container">
          <button
            type="button"
            onClick={() => setStoryboardTab("role")}
            className={`pb-2.5 text-sm font-bold transition-colors border-b-2 -mb-px ${
              storyboardTab === "role"
                ? "text-primary border-primary"
                : "text-outline border-transparent hover:text-on-surface"
            }`}
          >
            角色
          </button>
          <button
            type="button"
            onClick={() => setStoryboardTab("scene")}
            className={`pb-2.5 text-sm font-bold transition-colors border-b-2 -mb-px ${
              storyboardTab === "scene"
                ? "text-primary border-primary"
                : "text-outline border-transparent hover:text-on-surface"
            }`}
          >
            场景
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {shots.map((item) => (
            <StoryboardCard
              key={`${storyboardTab}-${item.id}`}
              item={item}
              isExpanded={expandedPromptId === item.id}
              isZoomed={zoomedShotId === item.id}
              isRegenerating={regeneratingIds.includes(item.id)}
              onTogglePrompt={() => setExpandedPromptId((prev) => (prev === item.id ? null : item.id))}
              onPromptChange={(value) =>
                onShotsChange(shots.map((shot) => (shot.id === item.id ? { ...shot, prompt: value } : shot)))
              }
              onToggleZoom={() => setZoomedShotId((prev) => (prev === item.id ? null : item.id))}
              onRegenerate={() => regenerateShot(item.id)}
              onDownload={() => {
                void downloadImage(item.imageUrl, `storyboard-${storyboardTab}-${item.id}.png`);
              }}
            />
          ))}
        </div>
      </main>

      <div className="px-12 py-6 bg-surface border-t border-surface-container flex flex-wrap gap-4 justify-between items-center sticky bottom-0 z-10">
        {videoShotCount === 0 ? (
          <p className="text-sm text-amber-900/90 max-w-xl leading-relaxed">
            当前没有分镜数据（剧本里缺少 <code className="text-xs bg-surface-container px-1 rounded">shotScript</code>
            ）。无法调用视频生成接口；请检查剧本或重新生成剧本后，再从上一步进入本分镜页。
          </p>
        ) : (
          <span className="hidden md:inline" aria-hidden />
        )}
        <button 
          onClick={onConfirm}
          disabled={!canProceed}
          className="bg-on-surface hover:bg-black text-surface px-10 py-4 rounded-2xl font-bold tracking-widest text-base shadow-xl active:scale-95 transition-all flex items-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-on-surface"
        >
          生成视频
          <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <div className="fixed top-[20%] right-[-100px] w-[300px] h-[300px] bg-primary/5 rounded-full blur-3xl -z-10"></div>
      <div className="fixed bottom-[10%] left-[-100px] w-[400px] h-[400px] bg-primary/5 rounded-full blur-3xl -z-10"></div>
    </div>
  );
};

const StoryboardVideoView = ({
  onBack,
  onHome,
  onStepClick,
  canStepNavigate,
  maxReachedStep,
  shots,
  shotsRoleForRegenerate,
  scriptContent,
  videoUrls,
  isGeneratingVideos,
  apiError,
  onShotsChange,
  onConfirm,
  canProceed
}: {
  onBack: () => void;
  onHome: () => void;
  onStepClick: (step: number) => void;
  canStepNavigate: boolean;
  maxReachedStep: number;
  shots: ShotItem[];
  /** 按角色名的分镜卡片（用于取重绘用生图 prompt） */
  shotsRoleForRegenerate: ShotItem[];
  scriptContent: string;
  videoUrls: Record<number, string>;
  isGeneratingVideos: boolean;
  apiError?: string | null;
  onShotsChange: (shots: ShotItem[]) => void;
  onConfirm: () => void;
  canProceed: boolean;
}) => {
  const [expandedPromptId, setExpandedPromptId] = useState<number | null>(1);
  const [zoomedShotId, setZoomedShotId] = useState<number | null>(null);
  const [regeneratingIds, setRegeneratingIds] = useState<number[]>([]);

  const regenerateShot = (id: number) => {
    setRegeneratingIds((prev) => [...prev, id]);
    const target = shots.find((item) => item.id === id);
    if (!target) return;
    const rolePrompt =
      getFirstCharacterPromptForShot(scriptContent, id) ||
      shotsRoleForRegenerate[0]?.prompt ||
      "";
    if (!rolePrompt) return;
    postJson<{ results: Array<{ shotNumber: number; imageUrl: string }> }>("/api/storyboard/generate-images", {
      shots: [{ shotNumber: id, imagePrompt: rolePrompt, kind: "role" }]
    })
      .then((data) => {
        const url = data.results?.[0]?.imageUrl || "";
        onShotsChange(
          shots.map((item) => (item.id === id ? { ...item, progress: 100, imageUrl: url || item.imageUrl } : item))
        );
      })
      .finally(() => {
        setRegeneratingIds((prev) => prev.filter((currentId) => currentId !== id));
      });
  };

  return (
    <div className="min-h-screen bg-surface-bright flex flex-col font-body text-on-surface">
      <Header showBack onBack={onBack} onHome={onHome} onStepClick={onStepClick} canStepNavigate={canStepNavigate} maxReachedStep={maxReachedStep} title="短剧 Agent" currentStep={3} />
      
      <main className="flex-1 px-12 pt-2 pb-12">
        <div className="mb-6 flex gap-8 border-b border-surface-container">
          <span className="pb-2.5 text-sm font-bold text-primary border-b-2 border-primary -mb-px">
            分镜视频
          </span>
        </div>

        {apiError ? (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 leading-relaxed"
          >
            {apiError}
          </div>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {shots.map((item) => (
            <StoryboardCard
              key={item.id}
              item={item}
              isExpanded={expandedPromptId === item.id}
              isZoomed={zoomedShotId === item.id}
              isRegenerating={regeneratingIds.includes(item.id)}
              isBatchGenerating={isGeneratingVideos && !videoUrls[item.id] && !regeneratingIds.includes(item.id)}
              mediaType="video"
              mediaUrl={videoUrls[item.id]}
              onTogglePrompt={() => setExpandedPromptId((prev) => (prev === item.id ? null : item.id))}
              onPromptChange={(value) =>
                onShotsChange(shots.map((shot) => (shot.id === item.id ? { ...shot, prompt: value } : shot)))
              }
              onToggleZoom={() => setZoomedShotId((prev) => (prev === item.id ? null : item.id))}
              onRegenerate={() => regenerateShot(item.id)}
              onDownload={() => {
                if (videoUrls[item.id]) {
                  void downloadImage(videoUrls[item.id], `storyboard-video-shot-${item.id}.mp4`);
                } else {
                  void downloadImage(item.imageUrl, `storyboard-video-shot-${item.id}.png`);
                }
              }}
            />
          ))}
        </div>
      </main>

      <div className="px-12 py-6 bg-surface border-t border-surface-container flex justify-end items-center sticky bottom-0 z-10">
        <button 
          onClick={onConfirm}
          disabled={!canProceed}
          className="bg-on-surface hover:bg-black text-surface px-10 py-4 rounded-2xl font-bold tracking-widest text-base shadow-xl active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-on-surface"
        >
          完成
        </button>
      </div>

      <div className="fixed top-[20%] right-[-100px] w-[300px] h-[300px] bg-primary/5 rounded-full blur-3xl -z-10"></div>
      <div className="fixed bottom-[10%] left-[-100px] w-[400px] h-[400px] bg-primary/5 rounded-full blur-3xl -z-10"></div>
    </div>
  );
};

export default function App() {
  const [view, setView] = useState<ViewState>('HOME');
  const [hasGeneratedScript, setHasGeneratedScript] = useState(false);
  const [hasUnlockedStepNav, setHasUnlockedStepNav] = useState(false);
  const [maxReachedStep, setMaxReachedStep] = useState(1);
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);
  const [forceShowScriptEditor, setForceShowScriptEditor] = useState(false);
  const [selectedRatio, setSelectedRatio] = useState<"16:9" | "9:16">("16:9");
  const [isGeneratingVideos, setIsGeneratingVideos] = useState(false);
  const [scriptContent, setScriptContent] = useState(DEFAULT_SCRIPT_CONTENT);
  const [storyboardShots, setStoryboardShots] = useState<ShotItem[]>(DEFAULT_STORYBOARD_SHOTS);
  const [storyboardSceneShots, setStoryboardSceneShots] = useState<ShotItem[]>(() =>
    DEFAULT_STORYBOARD_SHOTS.map((s) => ({ ...s }))
  );
  const [storyboardVideoShots, setStoryboardVideoShots] = useState<ShotItem[]>(DEFAULT_STORYBOARD_VIDEO_SHOTS);
  const [videoPrompts, setVideoPrompts] = useState<Record<number, string>>({});
  const [videoReferenceImages, setVideoReferenceImages] = useState<Record<number, string>>({});
  const [videoUrls, setVideoUrls] = useState<Record<number, string>>({});
  const [videoGenerateError, setVideoGenerateError] = useState<string | null>(null);
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  /** 首页创建时用户输入的故事梗概，用于在无 storySummary 时生成项目名称 */
  const [creationSeedText, setCreationSeedText] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem('ai-mangju-projects');
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as SavedProject[];
      if (Array.isArray(parsed)) setProjects(parsed);
    } catch (error) {
      console.error('Failed to parse saved projects:', error);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('ai-mangju-projects', JSON.stringify(projects));
  }, [projects]);

  const saveCurrentProject = () => {
    const hasAnyContent =
      scriptContent.trim().length > 0 ||
      storyboardShots.length > 0 ||
      storyboardSceneShots.length > 0 ||
      storyboardVideoShots.length > 0 ||
      Object.keys(videoUrls).length > 0;
    if (!hasAnyContent) return;

    const projectId = currentProjectId || `${Date.now()}`;
    if (!currentProjectId) {
      setCurrentProjectId(projectId);
    }
    const now = new Date();
    const updatedAt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const existing = projects.find((item) => item.id === projectId);
    const derived = deriveProjectDisplayName(scriptContent, creationSeedText);
    const name =
      derived !== "未命名项目"
        ? derived
        : existing?.name && !/^未命名项目$/u.test(existing.name)
          ? existing.name
          : derived;
    const project: SavedProject = {
      id: projectId,
      name,
      updatedAt,
      coverImage:
        storyboardVideoShots[0]?.imageUrl ||
        storyboardShots[0]?.imageUrl ||
        storyboardSceneShots[0]?.imageUrl ||
        "https://picsum.photos/seed/final-video-poster/1200/675",
      ratio: selectedRatio,
      scriptContent,
      storyboardShots,
      storyboardSceneShots,
      storyboardVideoShots,
      videoUrls,
      videoReferenceImages
    };
    setProjects((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === projectId);
      if (existingIndex === -1) {
        return [project, ...prev];
      }
      const next = [...prev];
      next[existingIndex] = project;
      return next;
    });
  };

  const deleteProject = (projectId: string) => {
    setProjects((prev) => prev.filter((item) => item.id !== projectId));
  };

  const parseShotsFromScriptText = (script: string): BackendShot[] =>
    parseShotsFromScriptJson(script) as BackendShot[];

  const openProject = (projectId: string) => {
    const project = projects.find((item) => item.id === projectId);
    if (!project) return;
    setCurrentProjectId(project.id);
    setScriptContent(formatScriptJsonForDisplay(project.scriptContent));
    setStoryboardShots(project.storyboardShots);
    setStoryboardSceneShots(
      project.storyboardSceneShots?.length
        ? project.storyboardSceneShots
        : project.storyboardShots.map((s) => ({ ...s }))
    );
    setStoryboardVideoShots(project.storyboardVideoShots.map(ensureVideoShotTitle));
    setVideoUrls(project.videoUrls || {});
    const vp: Record<number, string> = {};
    project.storyboardVideoShots.forEach((s) => {
      vp[s.id] = s.prompt;
    });
    setVideoPrompts(vp);
    let refs = project.videoReferenceImages || {};
    if (Object.keys(refs).length === 0) {
      const rec = parseShotsFromScriptText(project.scriptContent);
      const rm: Record<number, string> = {};
      rec.forEach((s) => {
        rm[s.shotNumber] = s.referenceImages || "";
      });
      refs = rm;
    }
    setVideoReferenceImages(refs);
    setSelectedRatio(project.ratio || "16:9");
    setHasGeneratedScript(true);
    setHasUnlockedStepNav(true);
    setMaxReachedStep(3);
    setView('GENERATING');
  };

  const startCreateFlow = async (payload: { text: string; style: string; ratio: "16:9" | "9:16" }) => {
    setCreationSeedText(payload.text.trim());
    setCurrentProjectId(`${Date.now()}`);
    setHasGeneratedScript(false);
    setHasUnlockedStepNav(false);
    setMaxReachedStep(1);
    setSelectedRatio(payload.ratio);
    setForceShowScriptEditor(false);
    setView('GENERATING');
    setIsGeneratingScript(true);

    try {
      const data = await postJson<{ script: string; shots: BackendShot[] }>("/api/script/generate", {
        text: payload.text,
        style: payload.style
      });

      const scriptRaw = data.script || payload.text;
      const chars0 = parseCharacterRequirements(scriptRaw);
      const scns0 = parseSceneRequirements(scriptRaw);
      let parsedShots = data.shots?.length > 0 ? data.shots : parseShotsFromScriptText(scriptRaw);
      parsedShots = ensureParsedShotsForVideo(parsedShots, chars0, scns0);
      const roleShots = buildUniqueRoleShotItems(scriptRaw);
      const sceneShots = buildUniqueSceneShotItems(scriptRaw);
      const videoShots = buildVideoShotItemsFromParsed(parsedShots);
      const promptsMap: Record<number, string> = {};
      const refMap: Record<number, string> = {};
      parsedShots.forEach((shot) => {
        promptsMap[shot.shotNumber] = shot.videoPrompt || "";
        refMap[shot.shotNumber] = shot.referenceImages || "";
      });

      setScriptContent(formatScriptJsonForDisplay(scriptRaw));
      setStoryboardShots(roleShots);
      setStoryboardSceneShots(sceneShots);
      setStoryboardVideoShots(videoShots);
      setVideoPrompts(promptsMap);
      setVideoReferenceImages(refMap);
      setHasGeneratedScript(true);
    } catch (error) {
      console.error(error);
      const isNetwork =
        error instanceof TypeError ||
        (error instanceof Error &&
          (/failed to fetch|networkerror|load failed/i.test(error.message) || error.name === "TypeError"));
      const detail =
        error instanceof Error && error.message
          ? error.message
          : typeof error === "string"
            ? error
            : "";
      const hint = isNetwork
        ? `无法连接后端（${API_BASE}）。请确认已运行 npm run dev:server，或检查 .env 里的 VITE_API_BASE_URL。`
        : detail;
      setScriptContent(hint ? `剧本生成失败：${hint}` : "剧本生成失败");
    } finally {
      setIsGeneratingScript(false);
    }
  };

  const generateStoryboardImagesFromScript = async () => {
    const raw = scriptContent;
    const chars = parseCharacterRequirements(raw);
    const scns = parseSceneRequirements(raw);
    let parsedShots = parseShotsFromScriptText(raw);
    if (parsedShots.length === 0) {
      parsedShots = storyboardVideoShots.map((shot) => {
        const sceneShot = storyboardSceneShots.find((s) => s.id === shot.id);
        return {
          shotNumber: shot.id,
          title: shot.title,
          imagePromptjs: shot.prompt,
          imagePromptcj: sceneShot?.prompt || shot.prompt,
          referenceImages: videoReferenceImages[shot.id] || "",
          videoPrompt: videoPrompts[shot.id] || shot.prompt || ""
        };
      });
    }
    if (parsedShots.length === 0 && chars.length === 0 && scns.length === 0) {
      parsedShots = [
        {
          shotNumber: 1,
          title: "镜头 1",
          imagePromptjs: raw,
          imagePromptcj: raw,
          referenceImages: "",
          videoPrompt: ""
        }
      ];
    }
    parsedShots = ensureParsedShotsForVideo(parsedShots, chars, scns);

    const roleShots = buildUniqueRoleShotItems(raw);
    const sceneShots = buildUniqueSceneShotItems(raw);
    const videoShots = buildVideoShotItemsFromParsed(parsedShots);

    const promptsMap: Record<number, string> = {};
    const refMap: Record<number, string> = {};
    parsedShots.forEach((shot) => {
      promptsMap[shot.shotNumber] = shot.videoPrompt || "";
      refMap[shot.shotNumber] = shot.referenceImages || "";
    });

    setStoryboardShots(roleShots);
    setStoryboardSceneShots(sceneShots);
    setStoryboardVideoShots(videoShots);
    setVideoPrompts(promptsMap);
    setVideoReferenceImages(refMap);

    setIsGeneratingImages(true);
    try {
      const emptyImg = Promise.resolve({ results: [] as Array<{ shotNumber: number; imageUrl: string }> });
      const [roleData, sceneData] = await Promise.all([
        roleShots.length > 0
          ? postJson<{ results: Array<{ shotNumber: number; imageUrl: string }> }>("/api/storyboard/generate-images", {
              shots: roleShots.map((r) => ({
                shotNumber: r.id,
                imagePrompt: r.prompt,
                kind: "role" as const
              }))
            })
          : emptyImg,
        sceneShots.length > 0
          ? postJson<{ results: Array<{ shotNumber: number; imageUrl: string }> }>("/api/storyboard/generate-images", {
              shots: sceneShots.map((s) => ({
                shotNumber: s.id,
                imagePrompt: s.prompt,
                kind: "scene" as const
              }))
            })
          : emptyImg
      ]);

      const charUrlByName: Record<string, string> = {};
      for (const r of roleData.results || []) {
        const item = roleShots.find((x) => x.id === r.shotNumber);
        if (item?.title && r.imageUrl) charUrlByName[item.title] = r.imageUrl;
      }
      const sceneUrlByName: Record<string, string> = {};
      for (const r of sceneData.results || []) {
        const item = sceneShots.find((x) => x.id === r.shotNumber);
        if (item?.title && r.imageUrl) sceneUrlByName[item.title] = r.imageUrl;
      }

      const mergedRole = roleShots.map((item) => ({
        ...item,
        progress: 100,
        imageUrl: charUrlByName[item.title] || item.imageUrl
      }));
      const mergedScene = sceneShots.map((item) => ({
        ...item,
        progress: 100,
        imageUrl: sceneUrlByName[item.title] || item.imageUrl
      }));

      const mergedVideo = videoShots.map((v) => {
        const ref = refMap[v.id] || "";
        const { roleUrl } = pickShotRoleAndSceneUrls(ref, charUrlByName, sceneUrlByName, chars, scns);
        return {
          ...v,
          progress: 100,
          imageUrl: roleUrl || v.imageUrl
        };
      });

      setStoryboardShots(mergedRole);
      setStoryboardSceneShots(mergedScene);
      setStoryboardVideoShots(mergedVideo);
    } finally {
      setIsGeneratingImages(false);
    }
  };

  const generateVideosByShots = async () => {
    setVideoGenerateError(null);
    if (!storyboardVideoShots.length) {
      setVideoGenerateError("没有分镜数据（shotScript 为空）。请检查剧本 JSON 是否包含 shotScript，或重新从第一步生成剧本。");
      return;
    }

    const extractTaskId = (task: any): string => {
      const id =
        task?.id ||
        task?.task_id ||
        task?.taskId ||
        task?.data?.id ||
        task?.data?.task_id ||
        task?.result?.id ||
        task?.result?.task_id ||
        "";
      return typeof id === "string" || typeof id === "number" ? String(id) : "";
    };
    const findVideoUrlDeep = (input: any, depth = 0): string => {
      if (!input || depth > 14) return "";
      if (typeof input === "object" && !Array.isArray(input) && Array.isArray((input as any).creations)) {
        const first = (input as any).creations[0];
        const u = first && typeof first.url === "string" ? first.url.trim() : "";
        if (u && /^https?:\/\//i.test(u)) return u;
      }
      if (typeof input === "string") {
        const t = input.trim();
        if (!/^https?:\/\//i.test(t)) return "";
        if (/\.mp4(\?|$)/i.test(t)) return t;
        if (/video|playback|media|vidu|volces|byteimg|volcengine|amazonaws/i.test(t)) return t;
        return "";
      }
      if (Array.isArray(input)) {
        for (const item of input) {
          const result = findVideoUrlDeep(item, depth + 1);
          if (result) return result;
        }
        return "";
      }
      if (typeof input === "object") {
        for (const key of ["video_url", "videoUrl", "url", "output_url", "playback_url", "file_url"]) {
          const v = (input as any)[key];
          if (typeof v === "string") {
            const got = findVideoUrlDeep(v, depth + 1);
            if (got) return got;
          }
        }
        for (const key of Object.keys(input)) {
          const result = findVideoUrlDeep((input as any)[key], depth + 1);
          if (result) return result;
        }
      }
      return "";
    };

    setIsGeneratingVideos(true);
    try {
      const charUrlByName = Object.fromEntries(
        storyboardShots.filter((s) => s.title && s.imageUrl).map((s) => [s.title, s.imageUrl])
      );
      const sceneUrlByName = Object.fromEntries(
        storyboardSceneShots.filter((s) => s.title && s.imageUrl).map((s) => [s.title, s.imageUrl])
      );
      const durationByShot = new Map<number, number>(
        parseShotsFromScriptText(scriptContent)
          .filter((s): s is BackendShot & { duration: number } => typeof s.duration === "number")
          .map((s) => [s.shotNumber, s.duration])
      );

      const summarizeCreateTaskError = (task: any): string => {
        if (task == null) return "无返回体";
        if (typeof task === "string") return task;
        const msg = task.message ?? task.error?.message ?? task.msg;
        if (typeof msg === "string" && msg.trim()) return msg.trim();
        try {
          return JSON.stringify(task);
        } catch {
          return String(task);
        }
      };

      const created = await postJson<{ tasks: Array<{ shotNumber: number; task: any }> }>("/api/storyboard/generate-videos", {
        ratio: selectedRatio,
        characterUrlsByName: charUrlByName,
        sceneUrlsByName: sceneUrlByName,
        shots: storyboardVideoShots.map((shot) => {
          const ref = (videoReferenceImages[shot.id] || "").trim();
          return {
            shotNumber: shot.id,
            referenceImages: ref,
            videoPrompt: (videoPrompts[shot.id] || shot.prompt || "").trim(),
            duration: durationByShot.get(shot.id)
          };
        })
      });

      const tasksList = created.tasks || [];
      const createFailLines = tasksList
        .filter((item) => !extractTaskId(item.task))
        .map((item) => `镜头 ${item.shotNumber}：${summarizeCreateTaskError(item.task)}`);
      const withTaskIds = tasksList
        .map((item) => ({ shotNumber: item.shotNumber, taskId: extractTaskId(item.task) }))
        .filter((item) => item.taskId);

      if (tasksList.length > 0 && withTaskIds.length === 0) {
        setVideoGenerateError(
          createFailLines.length > 0
            ? createFailLines.join("\n")
            : "视频服务未返回任务 ID，请查看 Network 中 /api/storyboard/generate-videos 响应"
        );
        return;
      }
      if (createFailLines.length > 0) {
        setVideoGenerateError(`部分镜头创建失败（其余将继续轮询）：\n${createFailLines.join("\n")}`);
      }

      const pollOneTask = async (shotNumber: number, taskId: string): Promise<[number, string]> => {
        for (let i = 0; i < 90; i += 1) {
          const task = await fetch(`${API_BASE}/api/storyboard/video-task/${taskId}`).then((r) => r.json());
          const videoUrl = findVideoUrlDeep(task);
          if (videoUrl) return [shotNumber, videoUrl];
          const state = (task?.state || task?.status || task?.data?.state || task?.data?.status || "")
            .toString()
            .toLowerCase();
          if (state === "failed" || state.includes("fail") || state.includes("error") || state.includes("cancel")) {
            const why =
              (typeof task?.message === "string" && task.message.trim() && task.message) ||
              (typeof task?.err_code === "string" && task.err_code.trim() && task.err_code) ||
              "";
            return [shotNumber, why ? `__ERR__${why}` : ""];
          }
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
        return [shotNumber, ""];
      };

      const pairs = await Promise.all(withTaskIds.map((item) => pollOneTask(item.shotNumber, item.taskId)));
      const newUrls: Record<number, string> = {};
      const pollErrs: string[] = [];
      pairs.forEach(([shotNumber, urlOrErr]) => {
        if (urlOrErr.startsWith("__ERR__")) {
          pollErrs.push(`镜头 ${shotNumber}：${urlOrErr.slice(7)}`);
          return;
        }
        if (urlOrErr) newUrls[shotNumber] = urlOrErr;
      });
      setVideoUrls((prev) => ({ ...prev, ...newUrls }));
      if (pollErrs.length > 0) {
        setVideoGenerateError((prev) =>
          [prev, `视频生成失败：\n${pollErrs.join("\n")}`].filter(Boolean).join("\n\n")
        );
      }
    } catch (error) {
      console.error(error);
      const msg =
        error instanceof Error ? error.message : typeof error === "string" ? error : "视频生成请求失败";
      setVideoGenerateError(msg);
    } finally {
      setIsGeneratingVideos(false);
    }
  };

  const goHome = () => {
    saveCurrentProject();
    setView('HOME');
    setForceShowScriptEditor(false);
  };
  const goToStep = (step: number) => {
    if (!hasUnlockedStepNav) return;
    if (step > maxReachedStep) return;
    if (step === 1) setView('GENERATING');
    if (step === 2) setView('STORYBOARD');
    if (step === 3) setView('STORYBOARD_VIDEO');
  };

  const renderView = () => {
    switch (view) {
      case 'GENERATING':
        return (
          <GenerationView 
            onBack={goHome}
            onHome={goHome}
            onStepClick={goToStep}
            canStepNavigate={hasUnlockedStepNav}
            maxReachedStep={maxReachedStep}
            scriptContent={scriptContent}
            onScriptChange={setScriptContent}
            isGenerating={(isGeneratingScript || isGeneratingImages) && !forceShowScriptEditor}
            canProceed={!isGeneratingScript && !isGeneratingImages && scriptContent.trim().length > 0 && scriptContent !== "剧本生成失败"}
            onConfirm={() => {
              setForceShowScriptEditor(true);
              setHasGeneratedScript(true);
              setHasUnlockedStepNav(true);
              setMaxReachedStep((prev) => Math.max(prev, 2));
              setView('STORYBOARD');
              void generateStoryboardImagesFromScript().catch((error) => {
                console.error(error);
              });
            }}
          />
        );
      case 'STORYBOARD':
        return (
          <StoryboardView 
            onBack={() => setView('GENERATING')} 
            onHome={goHome}
            onStepClick={goToStep}
            canStepNavigate={hasUnlockedStepNav}
            maxReachedStep={maxReachedStep}
            shotsRole={storyboardShots}
            shotsScene={storyboardSceneShots}
            onShotsChangeRole={setStoryboardShots}
            onShotsChangeScene={setStoryboardSceneShots}
            videoShotCount={storyboardVideoShots.length}
            canProceed={
              !isGeneratingImages &&
              storyboardVideoShots.length > 0 &&
              (parseCharacterRequirements(scriptContent).length === 0 ||
                (storyboardShots.length > 0 && storyboardShots.every((shot) => Boolean(shot.imageUrl)))) &&
              (parseSceneRequirements(scriptContent).length === 0 ||
                (storyboardSceneShots.length > 0 && storyboardSceneShots.every((shot) => Boolean(shot.imageUrl))))
            }
            onConfirm={() => {
              setMaxReachedStep((prev) => Math.max(prev, 3));
              setView('STORYBOARD_VIDEO');
              void generateVideosByShots();
            }}
          />
        );
      case 'STORYBOARD_VIDEO':
        return (
          <StoryboardVideoView 
            onBack={() => {
              setVideoGenerateError(null);
              setView('STORYBOARD');
            }} 
            onHome={goHome}
            onStepClick={goToStep}
            canStepNavigate={hasUnlockedStepNav}
            maxReachedStep={maxReachedStep}
            shots={storyboardVideoShots}
            shotsRoleForRegenerate={storyboardShots}
            scriptContent={scriptContent}
            videoUrls={videoUrls}
            isGeneratingVideos={isGeneratingVideos}
            apiError={videoGenerateError}
            onShotsChange={(shots) => {
              setStoryboardVideoShots(shots);
              setVideoPrompts((prev) => {
                const next = { ...prev };
                shots.forEach((s) => {
                  next[s.id] = s.prompt;
                });
                return next;
              });
            }}
            canProceed={!isGeneratingVideos && storyboardVideoShots.length > 0 && storyboardVideoShots.every((shot) => Boolean(videoUrls[shot.id]))}
            onConfirm={async () => {
              saveCurrentProject();
              setForceShowScriptEditor(false);
              setView('HOME');
            }}
          />
        );
      default:
        return (
          <div className="min-h-screen selection:bg-primary/20 selection:text-primary">
            <Header />
            
            <main>
              <Hero />
              <CreatorSection onStartCreating={startCreateFlow} />
              <MyProjectsSection
                projects={projects}
                onOpenProject={openProject}
                onDeleteProject={deleteProject}
              />
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
