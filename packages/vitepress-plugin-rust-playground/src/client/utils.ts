import type { Options } from "./config";

export type LangType = "rust" | "ts";
// now only support 2 languages

/**
 * 解析信息
 *
 * @param info 要解析的字符串信息,例如 rust,{version:"stable",edition:"2021"}
 * @returns 无返回值，该函数主要用于处理内部逻辑
 */
export const getCodeConfig = (configRaw: string): Options | null => {

  if (!(/[{|}]/).test(configRaw)) return null
  try {
    // 解析JSON配置
    const evalConfigStr = `(() => (${configRaw} || {}))()`

    const config = eval(evalConfigStr)
    return config;
  } catch (e) {
    // 如果JSON解析失败，则返回null
    return null;
  }
}

export const isRustCode = (html: string) => /language-rust/.test(html);

export const isShellCode = (html: string) => /language-(shellscript|shell|bash|sh|zsh)/.test(html);

export const checkCodeIntegrity = (lang: string, rawCode: string) => {
  switch (lang) {
    case 'rust':
      // Rust 代码的检查
      return /fn main\s*\(/.test(rawCode);
    case 'c':
      // C 代码的检查（这里只检查 main 函数是否存在）
      return /main\s*\(/.test(rawCode); // 匹配 "main("，允许前面有空格
    default:
      // 对于其他语言，可以返回 true 或者执行其他检查（如果需要）
      return true;
  }
};


export function fetchWithTimeout(url: string, options: RequestInit, timeout = 6000) {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) => setTimeout(() => reject(new Error(`Request to ${url} timed out after ${timeout}ms`)), timeout)),
  ]);
}


function convert(str: string): boolean | string {
  // 示例：将 'true'/'false' 转换为 boolean，其他值可能需要不同的处理
  switch (str.toLowerCase()) {
    case 'true':
      return true;
    case 'false':
      return false;
    default:
      // 如果不是 'true' 或 'false'，则可能需要返回原始字符串或抛出错误
      return str;
  }
}


export function boolify(obj: any) {
  if (typeof obj === 'boolean') return obj
  if (typeof obj === 'string') return convert(obj)

  if (toString.call(obj) === '[object Object]') {
    const keys = Object.keys(obj)

    for (let i = 0, l = keys.length; i < l; i++) {
      obj[keys[i]] = boolify(obj[keys[i]])
    }
  }

  return obj
}


