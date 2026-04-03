/**
 * 从剧本 JSON 解析分镜：角色/场景生图 prompt 仅取自 characterImageRequirements / sceneImageRequirements，
 * 按每镜头的 referenceImages 槽位（+ 分隔）匹配条目拼接；视频相关仍取自 shotScript。
 */

export type ScriptParsedShot = {
  shotNumber: number;
  title: string;
  imagePromptjs: string;
  imagePromptcj: string;
  referenceImages: string;
  videoPrompt: string;
  /** 单镜建议时长（秒），供方舟视频 duration 字段 */
  duration?: number;
};

type CharReq = { characterName: string; imagePromptjs: string };
type SceneReq = { sceneName: string; imagePromptcj: string };

function extractJsonValue(script: string): unknown | null {
  let s = script.trim();
  const fenced = s.match(/^```(?:json)?\s*([\s\S]*?)```\s*$/i);
  if (fenced) s = fenced[1].trim();
  try {
    return JSON.parse(s);
  } catch {
    const start = s.indexOf("{");
    const end = s.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(s.slice(start, end + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

function parseCharReqs(data: Record<string, unknown>): CharReq[] {
  const arr = data.characterImageRequirements;
  if (!Array.isArray(arr)) return [];
  const out: CharReq[] = [];
  const seen = new Set<string>();
  for (const item of arr) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const characterName = String(o.characterName ?? o["角色名"] ?? "").trim();
    const imagePromptjs = String(o.imagePromptjs ?? o["文生图提示词"] ?? "").trim();
    if (characterName && imagePromptjs && !seen.has(characterName)) {
      seen.add(characterName);
      out.push({ characterName, imagePromptjs });
    }
  }
  return out;
}

function parseSceneReqs(data: Record<string, unknown>): SceneReq[] {
  const arr = data.sceneImageRequirements;
  if (!Array.isArray(arr)) return [];
  const out: SceneReq[] = [];
  const seen = new Set<string>();
  for (const item of arr) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const sceneName = String(o.sceneName ?? o["场景名"] ?? "").trim();
    const imagePromptcj = String(o.imagePromptcj ?? o["文生图提示词"] ?? "").trim();
    if (sceneName && imagePromptcj && !seen.has(sceneName)) {
      seen.add(sceneName);
      out.push({ sceneName, imagePromptcj });
    }
  }
  return out;
}

function splitReferenceSlots(referenceImages: string): string[] {
  return referenceImages
    .split(/\s*\+\s*|\s*＋\s*/)
    .map((x) =>
      x
        .trim()
        .replace(/^\[+/, "")
        .replace(/\]+$/, "")
        .replace(/参考图URL/gi, "")
        .trim()
    )
    .filter(Boolean);
}

function slotMatchesScene(seg: string, s: SceneReq): boolean {
  if (seg.includes(s.sceneName) || s.sceneName.includes(seg)) return true;
  const short = s.sceneName.replace(/[（(].*?[）)]/g, "").trim();
  if (short && (seg.includes(short) || short.includes(seg.replace(/\s+/g, "")))) return true;
  const lm = seg.match(/L\d+/i);
  if (lm && s.sceneName.includes(lm[0])) return true;
  return false;
}

function slotMatchesCharacter(seg: string, c: CharReq): boolean {
  return Boolean(c.characterName) && seg.includes(c.characterName);
}

function collectPromptsForShot(
  referenceImages: string,
  chars: CharReq[],
  scenes: SceneReq[]
): { imagePromptjs: string; imagePromptcj: string } {
  const slots = splitReferenceSlots(referenceImages);
  const jsOrdered: string[] = [];
  const cjOrdered: string[] = [];
  const jsSeen = new Set<string>();
  const cjSeen = new Set<string>();

  for (const raw of slots) {
    const seg = raw.trim();
    if (!seg) continue;

    const sceneHit = scenes.find((s) => slotMatchesScene(seg, s));
    if (sceneHit && !cjSeen.has(sceneHit.sceneName)) {
      cjOrdered.push(sceneHit.imagePromptcj);
      cjSeen.add(sceneHit.sceneName);
      continue;
    }

    const charHit = chars.find((c) => slotMatchesCharacter(seg, c));
    if (charHit && !jsSeen.has(charHit.characterName)) {
      jsOrdered.push(charHit.imagePromptjs);
      jsSeen.add(charHit.characterName);
    }
  }

  let imagePromptjs = jsOrdered.join("\n\n");
  let imagePromptcj = cjOrdered.join("\n\n");

  // referenceImages 为空时：用全局角色/场景表兜底；若槽位里只有场景则不要强行拼所有角色
  if (!imagePromptjs && slots.length === 0 && chars.length > 0) {
    imagePromptjs =
      chars.length === 1
        ? chars[0].imagePromptjs
        : chars.map((c) => c.imagePromptjs).join("\n\n");
  }
  if (!imagePromptcj && slots.length === 0 && scenes.length > 0) {
    imagePromptcj =
      scenes.length === 1
        ? scenes[0].imagePromptcj
        : scenes.map((s) => s.imagePromptcj).join("\n\n");
  }

  return { imagePromptjs, imagePromptcj };
}

function shotToParsed(
  shot: Record<string, unknown>,
  fallbackIndex: number,
  chars: CharReq[],
  scenes: SceneReq[]
): ScriptParsedShot {
  const idRaw =
    shot["镜头ID"] ?? shot["镜头id"] ?? shot["shotID"] ?? shot["shotId"] ?? fallbackIndex + 1;
  const id = typeof idRaw === "number" ? idRaw : Number(idRaw) || fallbackIndex + 1;
  const referenceImages = String(shot["参考图关联"] ?? shot["referenceImages"] ?? "");
  const desc = String(shot["镜头描述"] ?? shot["shotDescription"] ?? "");

  const { imagePromptjs, imagePromptcj } = collectPromptsForShot(referenceImages, chars, scenes);

  /** 视频生成 API 仅用 shotDescription（及中文键「镜头描述」）正文，与其它字段解耦 */
  const videoPrompt = desc.trim();

  const durRaw = shot["时长建议"] ?? shot["duration"];
  let duration: number | undefined;
  if (typeof durRaw === "number" && Number.isFinite(durRaw)) {
    duration = Math.max(1, Math.round(durRaw));
  } else if (durRaw != null && String(durRaw).trim() !== "") {
    const n = Number(durRaw);
    if (Number.isFinite(n)) duration = Math.max(1, Math.round(n));
  }

  return {
    shotNumber: id,
    title: `镜头 ${id}`,
    imagePromptjs,
    imagePromptcj,
    referenceImages,
    videoPrompt,
    duration
  };
}

export type CharacterRequirement = CharReq;
export type SceneRequirement = SceneReq;

/** 从剧本文本解析去重后的角色表（同名只保留首次） */
export function parseCharacterRequirements(script: string): CharacterRequirement[] {
  const data = extractJsonValue(script);
  if (!data || typeof data !== "object") return [];
  return parseCharReqs(data as Record<string, unknown>);
}

/** 从剧本文本解析去重后的场景表 */
export function parseSceneRequirements(script: string): SceneRequirement[] {
  const data = extractJsonValue(script);
  if (!data || typeof data !== "object") return [];
  return parseSceneReqs(data as Record<string, unknown>);
}

/**
 * 按某镜头的 referenceImages 槽位，从「角色名→URL」「场景名→URL」中取出本镜头主参考图（供视频 API / 预览）。
 */
export function pickShotRoleAndSceneUrls(
  referenceImages: string,
  charUrlByName: Record<string, string>,
  sceneUrlByName: Record<string, string>,
  chars: CharacterRequirement[],
  scenes: SceneRequirement[]
): { roleUrl: string; sceneUrl: string } {
  const slots = splitReferenceSlots(referenceImages);
  let roleUrl = "";
  let sceneUrl = "";
  for (const raw of slots) {
    const seg = raw.trim();
    if (!seg) continue;
    const sceneHit = scenes.find((s) => slotMatchesScene(seg, s));
    if (sceneHit && !sceneUrl) {
      sceneUrl = (sceneUrlByName[sceneHit.sceneName] || "").trim();
    }
    const charHit = chars.find((c) => slotMatchesCharacter(seg, c));
    if (charHit && !roleUrl) {
      roleUrl = (charUrlByName[charHit.characterName] || "").trim();
    }
  }
  if (!roleUrl && chars.length === 1) {
    roleUrl = (charUrlByName[chars[0].characterName] || "").trim();
  }
  if (!sceneUrl && scenes.length === 1) {
    sceneUrl = (sceneUrlByName[scenes[0].sceneName] || "").trim();
  }
  return { roleUrl, sceneUrl };
}

/** 某镜头 referenceImages 中第一个匹配到的角色生图 prompt（视频页单张重绘用） */
export function getFirstCharacterPromptForShot(
  script: string,
  shotNumber: number
): string {
  const chars = parseCharacterRequirements(script);
  const shots = parseShotsFromScriptJson(script);
  const shot = shots.find((s) => s.shotNumber === shotNumber);
  if (!shot) return chars[0]?.imagePromptjs || "";
  const ref = (shot.referenceImages || "").trim();
  if (!ref) return chars[0]?.imagePromptjs || "";
  const slots = splitReferenceSlots(ref);
  for (const raw of slots) {
    const seg = raw.trim();
    if (!seg) continue;
    const charHit = chars.find((c) => slotMatchesCharacter(seg, c));
    if (charHit) return charHit.imagePromptjs;
  }
  return chars[0]?.imagePromptjs || "";
}

/** 解析失败返回 [] */
export function parseShotsFromScriptJson(script: string): ScriptParsedShot[] {
  const data = extractJsonValue(script);
  if (!data || typeof data !== "object") return [];
  const root = data as Record<string, unknown>;
  const shotScript = root.shotScript;
  if (!Array.isArray(shotScript) || shotScript.length === 0) return [];

  const chars = parseCharReqs(root);
  const scenes = parseSceneReqs(root);

  return shotScript.map((item, idx) =>
    shotToParsed(item as Record<string, unknown>, idx, chars, scenes)
  );
}

/** 若内容为合法 JSON 对象则格式化为带缩进的字符串，否则原样返回 */
export function formatScriptJsonForDisplay(script: string): string {
  const s = script.trim();
  if (!s) return s;
  try {
    const start = s.indexOf("{");
    const end = s.lastIndexOf("}");
    if (start >= 0 && end > start) {
      const obj = JSON.parse(s.slice(start, end + 1));
      if (obj && typeof obj === "object") return JSON.stringify(obj, null, 2);
    }
    const obj = JSON.parse(s);
    if (obj && typeof obj === "object") return JSON.stringify(obj, null, 2);
  } catch {
    /* keep raw */
  }
  return script;
}
