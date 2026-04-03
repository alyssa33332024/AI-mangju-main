import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { APIError, OpenAI } from "openai";
import { buildStoryboardUserPrompt, STORYBOARD_SYSTEM_PROMPT } from "./prompt";
import { parseShotsFromScript } from "./parser";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootEnvPath = path.resolve(__dirname, "../../.env");
dotenv.config({ path: rootEnvPath });

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

const apiKey = (process.env.ARK_API_KEY || "").trim();
/** 剧本：与方舟 chat.completions 示例一致，可用接入点 ID（ep-）覆盖 */
const ARK_SCRIPT_MODEL =
  process.env.ARK_SCRIPT_MODEL?.trim() || "doubao-1-5-pro-32k-250115";
const ARK_IMAGE_MODEL =
  process.env.ARK_IMAGE_MODEL?.trim() || "doubao-seedream-4-5-251128";
/** 生图关闭 Ark 水印 */
const ARK_WATERMARK = false;

/**
 * 方舟图生视频（与官方 curl 一致）：
 * POST https://ark.cn-beijing.volces.com/api/v3/contents/generations/tasks
 * Header: Authorization: Bearer $ARK_API_KEY, Content-Type: application/json
 * Body: { model, content:[{type:text,text}, {type:image_url,image_url:{url},role:reference_image},...], ratio, duration, watermark }
 */
const ARK_CONTENTS_BASE = "https://ark.cn-beijing.volces.com/api/v3";
const ARK_VIDEO_MODEL =
  process.env.ARK_VIDEO_MODEL?.trim() || "doubao-seedance-1-0-lite-i2v-250428";

if (!apiKey) {
  console.warn(`Missing ARK_API_KEY. Expected file: ${rootEnvPath}`);
}

const client = new OpenAI({
  baseURL: "https://ark.cn-beijing.volces.com/api/v3",
  apiKey
});

function describeError(error: unknown): string {
  if (error instanceof APIError) {
    const parts: string[] = [];
    if (error.status != null) parts.push(String(error.status));
    if (error.message?.trim()) parts.push(error.message.trim());
    const errBody = error.error;
    if (errBody && typeof errBody === "object") {
      const e = errBody as Record<string, unknown>;
      for (const key of ["message", "code", "type"] as const) {
        const v = e[key];
        if (typeof v === "string" && v.trim()) {
          const t = v.trim();
          if (!parts.some((p) => p.includes(t))) parts.push(t);
        }
      }
    }
    const s = parts.join(" ").trim();
    if (s) return s;
  }
  if (error instanceof Error && error.message?.trim()) return error.message.trim();
  if (typeof error === "string" && error.trim()) return error.trim();
  if (error && typeof error === "object") {
    try {
      return JSON.stringify(error);
    } catch {
      return String(error);
    }
  }
  return String(error);
}

/** 把方舟常见 HTTP 错误转成可操作的排查提示（不改变原错误信息） */
function arkHintForError(error: unknown): string {
  const base = describeError(error) || "script generation failed";
  if (!(error instanceof APIError) || error.status == null) return base;
  const { status } = error;
  if (status === 401 || status === 403) {
    return `${base} [排查] 方舟 API Key 无效或未载入：确认项目根目录存在 .env 且含 ARK_API_KEY；密钥须在火山方舟控制台创建且未过期；若使用「自定义推理接入点」，请把 .env 中 ARK_SCRIPT_MODEL 设为控制台显示的接入点 ID（常以 ep- 开头）。`;
  }
  if (status === 404) {
    return `${base} [排查] 模型/接入点不存在：将 ARK_SCRIPT_MODEL 改为方舟控制台里该模型对应的接入点 ID（ep-…）或文档给出的模型名。`;
  }
  return base;
}

/** 优先 Responses API；失败或正文为空时回退 Chat Completions（方舟侧兼容性更好） */
async function generateStoryboardScriptText(text: string, style?: string): Promise<string> {
  const userContent = buildStoryboardUserPrompt(text, style);

  try {
    const response = await client.responses.create({
      model: ARK_SCRIPT_MODEL,
      input: [
        { role: "system", content: [{ type: "input_text", text: STORYBOARD_SYSTEM_PROMPT }] },
        { role: "user", content: [{ type: "input_text", text: userContent }] }
      ]
    });
    const out = (response.output_text || "").trim();
    if (out) return out;
    console.warn("[script] responses returned empty output_text, falling back to chat.completions");
  } catch (e) {
    console.warn("[script] responses.create failed, falling back to chat.completions:", describeError(e));
  }

  const completion = await client.chat.completions.create({
    model: ARK_SCRIPT_MODEL,
    messages: [
      { role: "system", content: STORYBOARD_SYSTEM_PROMPT },
      { role: "user", content: userContent }
    ]
  });
  const c = completion.choices[0]?.message?.content;
  const textOut = typeof c === "string" ? c.trim() : "";
  if (!textOut) {
    throw new Error("模型未返回剧本正文（请检查接入点是否绑定该模型、是否有推理额度）");
  }
  return textOut;
}

app.post("/api/script/generate", async (req, res) => {
  try {
    const { text, style } = req.body as { text?: string; style?: string };
    if (!text?.trim()) return res.status(400).json({ error: "text is required" });
    if (!apiKey.trim()) {
      return res.status(500).json({ error: "ARK_API_KEY is not configured" });
    }

    const script = await generateStoryboardScriptText(text, style);
    const shots = parseShotsFromScript(script);
    res.json({ script, shots });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: arkHintForError(error) });
  }
});

app.post("/api/storyboard/generate-images", async (req, res) => {
  try {
    const { shots } = req.body as {
      shots: Array<{ shotNumber: number; imagePrompt: string; kind?: "role" | "scene" }>;
    };
    if (!Array.isArray(shots) || shots.length === 0) return res.status(400).json({ error: "shots required" });

    const results = await Promise.all(
      shots.map(async (shot) => {
        const isScene = shot.kind === "scene";
        const prefix = isScene
          ? "【场景参考图】纯环境空镜，画面中禁止出现任何人物、人脸、人体或手部；不要画面中任何文字。"
          : "【角色参考图】纯白或浅灰纯色背景，仅绘制角色立绘（可半身或全身），突出人物造型与服装；不要绘环境、地面透视、建筑或道具背景；不要画面中任何文字。";
        const imagesResponse = await client.images.generate({
          model: ARK_IMAGE_MODEL,
          prompt: `${prefix}\n\n【画面要求】\n${shot.imagePrompt}`,
          size: "2048x2048",
          response_format: "url",
          watermark: ARK_WATERMARK,
          extra_body: { watermark: ARK_WATERMARK }
        } as any);
        return {
          shotNumber: shot.shotNumber,
          imageUrl: imagesResponse.data?.[0]?.url || ""
        };
      })
    );

    res.json({ results });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "image generation failed" });
  }
});

function slotLabelFromSegment(raw: string): string {
  return raw
    .trim()
    .replace(/^\[+/, "")
    .replace(/\]+$/, "")
    .replace(/参考图URL/gi, "")
    .trim();
}

function isSceneSlot(seg: string): boolean {
  return /场景|环境|外景|内景|废墟|街道|室内|门口|门厅|站台|图书|樱花|雨景|校园|L\d|背景|空间|废土|基地|集装箱|高楼|桥梁|公交站|树|草坪|走廊|教室|高中|门厅|积水|彩虹/i.test(
    seg
  );
}

const okHttpUrl = (u: string) => /^https?:\/\//i.test((u || "").trim());

type ArkRefItem = { url: string; name: string };

function clampViduPrompt(prompt: string): string {
  const t = prompt.trim();
  if (t.length <= 2000) return t;
  return t.slice(0, 2000);
}

/** 单镜时长：来自分镜 duration，缺省用 ARK_VIDEO_DURATION 或 5；限制在 [2, 12] 秒 */
function clampArkVideoDuration(durationSeconds?: number): number {
  const envDefault = Number(process.env.ARK_VIDEO_DURATION);
  const defaultSec = Number.isFinite(envDefault) && envDefault > 0 ? Math.round(envDefault) : 5;
  const raw =
    durationSeconds != null && Number.isFinite(durationSeconds) ? Math.round(durationSeconds) : defaultSec;
  return Math.max(2, Math.min(12, raw));
}

/** 槽位标签匹配 characterUrlsByName 的 key（角色名） */
function matchCharacterKeyForSegment(seg: string, urlsByName: Record<string, string>): string | null {
  const t = seg.trim();
  if (!t) return null;
  if (urlsByName[t] && okHttpUrl(String(urlsByName[t]))) return t;
  let best: string | null = null;
  for (const name of Object.keys(urlsByName)) {
    if (!name || !okHttpUrl(String(urlsByName[name]))) continue;
    if (t.includes(name) && (!best || name.length > best.length)) best = name;
  }
  if (best) return best;
  for (const name of Object.keys(urlsByName)) {
    if (!name || !okHttpUrl(String(urlsByName[name]))) continue;
    if (name.includes(t)) return name;
  }
  return null;
}

/**
 * 按 referenceImages 槽位顺序收集参考图：场景槽位用 sceneUrlsByName，其余用 characterUrlsByName。
 * 与剧本里 [角色参考图URL]、[场景参考图URL] 顺序一致；同 URL 只保留一次；最多 7 张。
 */
function buildOrderedArkRefItems(
  referenceImagesText: string,
  characterUrlsByName: Record<string, string>,
  sceneUrlsByName: Record<string, string>
): { items: ArkRefItem[]; error?: string } {
  const segments = referenceImagesText
    .split(/\s*\+\s*|\s*＋\s*/)
    .map((x) => slotLabelFromSegment(x))
    .filter(Boolean);

  if (segments.length === 0) {
    return { items: [], error: "empty_reference_images_slots" };
  }

  const items: ArkRefItem[] = [];
  const seenUrl = new Set<string>();

  for (const seg of segments) {
    if (items.length >= 7) break;
    const useScene = isSceneSlot(seg);
    const map = useScene ? sceneUrlsByName : characterUrlsByName;
    const key = matchCharacterKeyForSegment(seg, map);
    if (!key) continue;
    const url = String(map[key] || "").trim();
    if (!okHttpUrl(url)) continue;
    if (seenUrl.has(url)) continue;
    seenUrl.add(url);
    items.push({ name: key, url });
  }

  if (items.length === 0) {
    return { items: [], error: "no_reference_urls_for_slots" };
  }
  return { items };
}

/** 文案中显式标注 [图1][图2]…，便于模型对齐 reference_image（含角色与场景） */
function buildArkSeedanceLiteText(refs: ArkRefItem[], videoPrompt: string): string {
  const intro = refs.map((r, i) => `[图${i + 1}]为「${r.name}」的参考图`).join("，");
  const body = videoPrompt.trim();
  return clampViduPrompt(intro ? `${intro}。${body}` : body);
}

function deepFindArkVideoUrl(obj: unknown, depth = 0): string {
  if (depth > 14 || obj == null) return "";
  if (typeof obj === "string") {
    const t = obj.trim();
    if (!/^https?:\/\//i.test(t)) return "";
    if (/\.mp4(\?|$)/i.test(t)) return t;
    if (/video|playback|byteimg|volces|tos-|volcengine|amazonaws|cdn|oss|obs|cos/i.test(t)) return t;
    return "";
  }
  if (Array.isArray(obj)) {
    for (const x of obj) {
      const u = deepFindArkVideoUrl(x, depth + 1);
      if (u) return u;
    }
    return "";
  }
  if (typeof obj === "object") {
    const o = obj as Record<string, unknown>;
    for (const k of [
      "video_url",
      "url",
      "result_url",
      "playback_url",
      "file_url",
      "download_url",
      "video_uri",
      "output_url"
    ]) {
      const u = deepFindArkVideoUrl(o[k], depth + 1);
      if (u) return u;
    }
    for (const v of Object.values(o)) {
      const u = deepFindArkVideoUrl(v, depth + 1);
      if (u) return u;
    }
  }
  return "";
}

/** 任务已成功但仍用启发式找不到时，取 JSON 内第一条较长 https 链接（方舟部分字段无固定后缀） */
function firstLongHttpsUrl(obj: unknown, depth = 0): string {
  if (depth > 16 || obj == null) return "";
  if (typeof obj === "string") {
    const t = obj.trim();
    if (/^https?:\/\//i.test(t) && t.length >= 24) return t;
    return "";
  }
  if (Array.isArray(obj)) {
    for (const x of obj) {
      const u = firstLongHttpsUrl(x, depth + 1);
      if (u) return u;
    }
    return "";
  }
  if (typeof obj === "object") {
    for (const v of Object.values(obj)) {
      const u = firstLongHttpsUrl(v, depth + 1);
      if (u) return u;
    }
  }
  return "";
}

/** 方舟有时把任务包在 data 里返回 */
function unwrapArkTaskPayload(raw: Record<string, unknown>): Record<string, unknown> {
  const d = raw.data;
  if (d && typeof d === "object" && !Array.isArray(d)) {
    const inner = d as Record<string, unknown>;
    if (inner.status != null || inner.id != null || inner.content != null) {
      return inner;
    }
  }
  return raw;
}

function arkTaskFailureHint(codeOrMsg: string): string {
  const t = codeOrMsg.trim();
  if (!t) return "";
  if (/CreditInsufficient|InsufficientBalance|QuotaExceeded/i.test(t)) {
    return `${t}（火山方舟侧：视频/通用额度或余额不足，请到火山引擎控制台充值或检查该模型的计费与配额；多镜头并行时前几镜可能已耗尽显额）`;
  }
  return t;
}

function extractArkTaskErrorText(raw: Record<string, unknown>): string {
  const asStr = (x: unknown) => (typeof x === "string" ? x.trim() : "");
  let msg = asStr(raw.message) || asStr(raw.error);
  if (!msg && raw.error && typeof raw.error === "object") {
    const e = raw.error as Record<string, unknown>;
    msg = asStr(e.message) || asStr(e.code) || asStr(e.Message);
  }
  if (!msg && raw.content && typeof raw.content === "object") {
    const c = raw.content as Record<string, unknown>;
    msg = asStr(c.error) || asStr(c.message) || asStr((c.error as Record<string, unknown>)?.code);
  }
  return msg;
}

/** 轮询结果规范成前端可用的 state + creations[0].url */
function normalizeArkVideoTaskPayload(raw: Record<string, unknown>): Record<string, unknown> {
  const body = unwrapArkTaskPayload(raw);
  const st = String(body.status ?? body.state ?? "").toLowerCase();
  let videoUrl = deepFindArkVideoUrl(body) || deepFindArkVideoUrl(raw);
  const errText = extractArkTaskErrorText(body) || extractArkTaskErrorText(raw);

  const isRunning =
    st === "running" ||
    st === "queued" ||
    st === "pending" ||
    st === "processing" ||
    st === "in_progress" ||
    st === "created" ||
    st === "submitted";
  const isSuccess =
    st === "succeeded" || st === "success" || st === "completed" || st === "complete";
  const isFailed =
    st === "failed" ||
    st === "cancelled" ||
    st === "canceled" ||
    /^error$/i.test(st) ||
    (st.includes("fail") && !isSuccess);

  if (!videoUrl && isSuccess) {
    videoUrl = firstLongHttpsUrl(body) || firstLongHttpsUrl(raw);
  }

  let state: string = "processing";
  if (isFailed) {
    state = "failed";
  } else if (videoUrl) {
    state = "success";
  } else if (isSuccess) {
    state = "processing";
  } else if (errText && !isRunning && st !== "") {
    state = "failed";
  }

  const msg = state === "failed" && errText ? arkTaskFailureHint(errText) : "";
  const id = (body.id ?? raw.id ?? body.task_id ?? raw.task_id) as string | number | undefined;
  return {
    state,
    status: body.status ?? body.state ?? raw.status,
    creations: videoUrl ? [{ url: videoUrl }] : [],
    message: msg,
    id,
    task_id: id
  };
}

app.post("/api/storyboard/generate-videos", async (req, res) => {
  try {
    if (!apiKey) return res.status(500).json({ error: "ARK_API_KEY is not configured" });

    const { shots, ratio, characterUrlsByName = {}, sceneUrlsByName = {} } = req.body as {
      ratio?: "16:9" | "9:16";
      /** 角色名 → 第二步「角色」参考图 URL */
      characterUrlsByName?: Record<string, string>;
      /** 场景名 → 第二步「场景」参考图 URL */
      sceneUrlsByName?: Record<string, string>;
      shots: Array<{
        shotNumber: number;
        referenceImages?: string;
        videoPrompt: string;
        duration?: number;
      }>;
    };
    if (!Array.isArray(shots) || shots.length === 0) return res.status(400).json({ error: "shots required" });

    const charUrls: Record<string, string> = {};
    for (const [k, v] of Object.entries(characterUrlsByName || {})) {
      if (typeof v === "string" && okHttpUrl(v)) charUrls[k.trim()] = v.trim();
    }
    const sceneUrls: Record<string, string> = {};
    for (const [k, v] of Object.entries(sceneUrlsByName || {})) {
      if (typeof v === "string" && okHttpUrl(v)) sceneUrls[k.trim()] = v.trim();
    }

    const aspectRatio = ratio === "9:16" ? "9:16" : "16:9";

    const tasks = await Promise.all(
      shots.map(async (shot) => {
        const ref = shot.referenceImages || "";
        const { items: refs, error: refErr } = buildOrderedArkRefItems(ref, charUrls, sceneUrls);

        if (refs.length === 0) {
          const msg =
            refErr === "empty_reference_images_slots"
              ? "本镜头未填写 referenceImages 或无可解析槽位"
              : "本镜头 referenceImages 中的槽位无法匹配到角色/场景参考图 URL（请确认第二步已生成对应图，且场景页标题与剧本场景名一致）";
          return {
            shotNumber: shot.shotNumber,
            task: { error: "missing_reference_images", message: msg, code: refErr }
          };
        }

        if (!(shot.videoPrompt || "").trim()) {
          return {
            shotNumber: shot.shotNumber,
            task: {
              error: "empty_video_prompt",
              message: "本镜头缺少 shotDescription（视频提示词为空）"
            }
          };
        }

        const duration = clampArkVideoDuration(shot.duration);
        const text = buildArkSeedanceLiteText(refs, shot.videoPrompt || "");
        const content: Array<Record<string, unknown>> = [{ type: "text", text }];
        for (const r of refs) {
          content.push({
            type: "image_url",
            image_url: { url: r.url },
            role: "reference_image"
          });
        }

        const payload: Record<string, unknown> = {
          model: ARK_VIDEO_MODEL,
          content,
          ratio: aspectRatio,
          duration,
          watermark: ARK_WATERMARK
        };

        const response = await fetch(`${ARK_CONTENTS_BASE}/contents/generations/tasks`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`
          },
          body: JSON.stringify(payload)
        });
        const data = (await response.json()) as Record<string, unknown>;
        const nested = data.data && typeof data.data === "object" ? (data.data as Record<string, unknown>) : null;
        const taskIdRaw = data.id ?? data.task_id ?? nested?.id ?? nested?.task_id;
        const taskId =
          typeof taskIdRaw === "string" ? taskIdRaw : typeof taskIdRaw === "number" ? String(taskIdRaw) : "";

        if (!response.ok || !taskId) {
          console.error("Ark contents/generations/tasks failed", response.status, data);
          return {
            shotNumber: shot.shotNumber,
            task: {
              error: "ark_video_error",
              message: "方舟创建视频任务失败",
              status: response.status,
              body: data
            }
          };
        }

        return {
          shotNumber: shot.shotNumber,
          task: {
            id: taskId,
            task_id: taskId,
            state: typeof data.status === "string" ? data.status : "created",
            model: ARK_VIDEO_MODEL
          }
        };
      })
    );

    res.json({ tasks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "video generation failed" });
  }
});

app.get("/api/storyboard/video-task/:taskId", async (req, res) => {
  try {
    if (!apiKey) return res.status(500).json({ error: "ARK_API_KEY is not configured" });
    const response = await fetch(
      `${ARK_CONTENTS_BASE}/contents/generations/tasks/${encodeURIComponent(req.params.taskId)}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`
        }
      }
    );
    const data = (await response.json()) as Record<string, unknown>;
    if (!response.ok) {
      return res.status(response.status).json(data);
    }
    res.json(normalizeArkVideoTaskPayload(data));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "query video task failed" });
  }
});

const port = Number(process.env.PORT || process.env.SERVER_PORT || 8787);
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
