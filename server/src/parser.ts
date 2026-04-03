import {
  parseShotsFromScriptJson,
  type ScriptParsedShot
} from "../../shared/parseScriptJson";

export type ParsedShot = ScriptParsedShot;

/** 仅从 JSON 剧本解析分镜；非 JSON 或缺少 shotScript 时返回空数组 */
export function parseShotsFromScript(script: string): ParsedShot[] {
  return parseShotsFromScriptJson(script);
}
