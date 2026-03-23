import "dotenv/config";
import express from "express";
import cors from "cors";
import { OpenAI } from "openai";
import { buildStoryboardUserPrompt, buildVideoSystemPrompt, STORYBOARD_SYSTEM_PROMPT } from "./prompt";
import { parseShotsFromScript } from "./parser";

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

const apiKey = process.env.ARK_API_KEY || "a850367d-368b-421a-b30b-ed1088c7e3db";
if (!apiKey) {
  console.warn("Missing ARK_API_KEY in environment.");
}

const client = new OpenAI({
  baseURL: "https://ark.cn-beijing.volces.com/api/v3",
  apiKey
});

app.post("/api/script/generate", async (req, res) => {
  try {
    const { text, style } = req.body as { text?: string; style?: string };
    if (!text?.trim()) return res.status(400).json({ error: "text is required" });

    const response = await client.responses.create({
      model: "doubao-seed-2-0-pro-260215",
      input: [
        { role: "system", content: [{ type: "input_text", text: STORYBOARD_SYSTEM_PROMPT }] },
        { role: "user", content: [{ type: "input_text", text: buildStoryboardUserPrompt(text, style) }] }
      ]
    });

    const script = response.output_text || "";
    const shots = parseShotsFromScript(script);
    res.json({ script, shots });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "script generation failed" });
  }
});

app.post("/api/storyboard/generate-images", async (req, res) => {
  try {
    const { shots } = req.body as { shots: Array<{ shotNumber: number; imagePrompt: string }> };
    if (!Array.isArray(shots) || shots.length === 0) return res.status(400).json({ error: "shots required" });

    const results = await Promise.all(
      shots.map(async (shot) => {
        const imagesResponse = await client.images.generate({
          model: "doubao-seedream-4-5-251128",
          prompt: `请你扮演一位专业的电影分镜师，为这个镜头创建一个2X2网格布局的故事分镜图，每张分镜图都需有区分。请严格遵守以下规则并根据【分镜画面要求】依次把格1到格4的图片生成在一张图上。限制：图片中不允许任何文字。\n\n【分镜画面要求】\n${shot.imagePrompt}`,
          size: "2048x2048",
          response_format: "url",
          extra_body: { watermark: false }
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

app.post("/api/storyboard/generate-videos", async (req, res) => {
  try {
    const { shots, ratio } = req.body as {
      ratio?: "16:9" | "9:16";
      shots: Array<{ shotNumber: number; imageUrl: string; imagePrompt: string; videoPrompt: string }>;
    };
    if (!Array.isArray(shots) || shots.length === 0) return res.status(400).json({ error: "shots required" });

    const tasks = await Promise.all(
      shots.map(async (shot) => {
        const text = `${buildVideoSystemPrompt(shot.imagePrompt)}\n\n${shot.videoPrompt} --ratio ${
          ratio || "16:9"
        } --duration 10 --camerafixed false --watermark false`;

        const response = await fetch("https://ark.cn-beijing.volces.com/api/v3/contents/generations/tasks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: "doubao-seedance-1-5-pro-251215",
            content: [
              { type: "text", text },
              { type: "image_url", image_url: { url: shot.imageUrl } }
            ]
          })
        });
        const data = await response.json();
        return { shotNumber: shot.shotNumber, task: data };
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
    const response = await fetch(
      `https://ark.cn-beijing.volces.com/api/v3/contents/generations/tasks/${req.params.taskId}`,
      { headers: { Authorization: `Bearer ${apiKey}` } }
    );
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "query video task failed" });
  }
});

const port = Number(process.env.SERVER_PORT || 8787);
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
