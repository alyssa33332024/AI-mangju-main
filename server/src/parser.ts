export type ParsedShot = {
  shotNumber: number;
  title: string;
  imagePrompt: string;
  videoPrompt: string;
  hasCompleteGrid: boolean;
};

function hasCompleteGridPrompt(text: string): boolean {
  const normalized = text.replace(/\s+/g, "");
  return (
    /格1[:：]/.test(normalized) &&
    /格2[:：]/.test(normalized) &&
    /格3[:：]/.test(normalized) &&
    /格4[:：]/.test(normalized)
  );
}

export function parseShotsFromScript(script: string): ParsedShot[] {
  const shots: ParsedShot[] = [];
  const completeShots: ParsedShot[] = [];
  // 兼容“镜头1: 标题”“镜头 2 标题”“镜头3”后直接换行等格式
  const shotRegex = /镜头\s*([0-9]+)\s*(?:[：:]\s*([^\n]*))?[\s\S]*?(?=镜头\s*[0-9]+\s*(?:[：:]|$)|$)/g;

  let match: RegExpExecArray | null;
  while ((match = shotRegex.exec(script)) !== null) {
    const shotNumber = Number(match[1]);
    const rawTitle = (match[2] || "").trim();
    const title = rawTitle ? `镜头 ${shotNumber}: ${rawTitle}` : `镜头 ${shotNumber}`;
    const block = match[0];

    const imagePromptMatch = block.match(
      /AI\s*绘画提示词[\s\S]*?格1[:：][\s\S]*?(?=Sora2\s*视频描述[:：]|镜头\s*[0-9]+[：:]|$)/i
    );
    const videoPromptMatch = block.match(/Sora2\s*视频描述[:：]([\s\S]*?)$/i);

    const imagePrompt = imagePromptMatch ? imagePromptMatch[0].trim() : "";
    const hasCompleteGrid = hasCompleteGridPrompt(imagePrompt || block);

    const parsedShot = {
      shotNumber,
      title,
      imagePrompt,
      videoPrompt: videoPromptMatch ? videoPromptMatch[1].trim() : "",
      hasCompleteGrid
    };
    shots.push(parsedShot);
    if (hasCompleteGrid) {
      completeShots.push(parsedShot);
    }
  }

  // 识别策略：
  // 1) 有完整四格时优先返回完整四格镜头
  // 2) 若一个完整四格都没有，则回退返回普通镜头识别结果（不强制丢弃）
  return completeShots.length > 0 ? completeShots : shots;
}
