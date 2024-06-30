import { type Options, defaultConfig } from "./config";
import { fetchWithTimeout } from "./utils";

/** 获取 rust 版本 */
function getEdition(edition: string) {
  if (edition.includes("2018")) {
    edition = "2018";
  } else if (edition.includes("2021")) {
    edition = "2021";
  }
  return edition;
}

interface RunParams {
  code: string
  options: Options
}

export interface RunResult {
  success: boolean
  exitDetail: string
  stdout: string
  stderr: string
}


export async function runRustCode({ code, options }: RunParams): Promise<RunResult> {
  const params = {
    code,
    ...defaultConfig,
    ...options
  };

  if (code.indexOf("#![feature") !== -1) {
    params.channel = "nightly";
  }

  return fetchWithTimeout("https://play.rust-lang.org/execute", {
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
    mode: "cors",
    body: JSON.stringify(params),
  })
    .then((response) => (response as Response).json())
    .then((response) => {
      return response
      let error = '', result = response.result.trim();
      if (response.result.error) {
        error = error;
        // resultBlock.classList.add("result-no-output");
      } else {
        result = response.result.replace(
          /--explain (E\d+)/,
          `--explain <a target="_blank" href="https://doc.rust-lang.org/error_codes/$1.html">$1</a>`,
        );
      }
      return { error, result: response.result.trim() }
    })
}
