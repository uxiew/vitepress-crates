<script setup lang="ts">
import {
  computed,
  inject,
  nextTick,
  onMounted,
  onUnmounted,
  ref,
  watchEffect,
} from "vue";
import {
  EditorView,
  drawSelection,
  highlightActiveLine,
  highlightSpecialChars,
  keymap,
  lineNumbers,
} from "@codemirror/view";
import {
  defaultKeymap,
  history,
  historyKeymap,
  indentWithTab,
} from "@codemirror/commands";
import { type DistributiveOmit, excludeKeys } from "filter-obj";
import { type ShikiTransformer, codeToHtml } from "shiki";
import { styling } from "./codemirror-styling";
import { type RunResult, runRustCode } from "./rust";
import type { Options } from "./config";
import "./style.css";

interface Props {
  id: string;
  maxHeight?: string;
  maxOutputHeight?: string;

  //  ---- options ----
  channel?: Options["channel"];
  edition?: Options["edition"];
  mode?: Options["mode"];
  crateType?: Options["crateType"];
  tests?: Options["tests"];
  backtrace?: Options["backtrace"];
}

const props = withDefaults(defineProps<Props>(), {
  maxHeight: "400px", // 2:1 ratio with VitePress theme's max width of 688px
  maxOutputHeight: "420px", // 2:1 ratio with VitePress theme's max width of 688px
  channel: "stable",
  edition: "2021",
  mode: "debug",
  crateType: "bin",
  tests: false,
  backtrace: false,
});

const execOptions = computed(() => ({
  channel: props.channel,
  edition: props.edition,
  mode: props.mode,
  crateType: props.crateType,
  tests: props.tests,
  backtrace: props.backtrace,
}));

const storageKey = computed(() => `rp-${props.id}`);

const mounted = ref(false);
const running = ref(false);

const anchor = ref<HTMLDivElement>();
const parent = ref<HTMLDivElement>();
const input = ref<HTMLInputElement>();
let initialCode: string;
let editor: EditorView;

const showOptions = ref(false);
const optionsRef = ref<HTMLButtonElement>();

onMounted(() => {
  const prev = anchor.value?.previousElementSibling;
  const codeElement = prev?.classList.contains(`language-rust`) ? prev : null;
  initialCode = codeElement?.querySelector("pre")?.textContent ?? "";
  codeElement?.setAttribute("hidden", "");

  document.addEventListener("click", handleClickOutside);

  editor = new EditorView({
    extensions: [
      highlightSpecialChars(),
      history(),
      drawSelection(),
      keymap.of([...defaultKeymap, ...historyKeymap, indentWithTab]),
      lineNumbers(),
      highlightActiveLine(),
      styling,
      EditorView.updateListener.of((e) => {
        if (e.docChanged) {
          element.textContent = e.state.doc.toString();
        }
      }),
    ],
    parent: parent.value!,
    doc: localStorage.getItem(storageKey.value) ?? initialCode,
  });

  // create element for copy
  const element = document.createElement("div");
  element.setAttribute("hidden", "true");
  element.textContent = editor.state.doc.toString();
  parent.value?.insertAdjacentElement("beforebegin", element);
  // console.log(props, execOptions.value, updateOutput());
  document.addEventListener("visibilitychange", () => {
    save(editor.state.doc.toString());
  });

  mounted.value = true;
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
  save(editor.state.doc.toString());
  editor.destroy();
});

const inputText = ref("");
watchEffect(() => {
  if (input.value) input.value.style.width = `${inputText.value.length + 1}ch`;
});

const buttonText = computed(() => (running.value ? "running..." : "run code"));
const showOutput = computed(() => !running.value && output.value.length > 0);

// const outputLines = computed(() => {
//   const lines = output.value.map((l) => l.join(""));
//   if (lines[lines.length - 1] === "" && !waitingForInput.value) lines.pop();
//   return lines.length === 0 ? [""] : lines;
// });

async function run() {
  running.value = true;
  const code = editor.state.doc.toString();
  save(code);
  resetOutput();

  let result: RunResult;
  try {
    result = await runRustCode({
      code,
      options: execOptions.value,
    });
  } catch (error: any) {
    result = {
      success: false,
      stderr: error.message,
      stdout: "",
      exitDetail: "",
    };
  }
  await updateOutput(result);
  running.value = false;
}

function reset() {
  if (running.value) return;
  localStorage.removeItem(storageKey.value);
  editor.dispatch({
    changes: { from: 0, to: editor.state.doc.length, insert: initialCode },
    selection: { anchor: 0 },
    scrollIntoView: true,
  });
  editor.focus();
  resetOutput();
}

function save(code: string) {
  if (code === initialCode) localStorage.removeItem(storageKey.value);
  else localStorage.setItem(storageKey.value, code);
}

const output = ref<string>("");
const outputWidth = 72;
let outputRow = 0;
let outputCol = 0;

async function updateOutput(raw: RunResult) {
  const { success, stdout, stderr } = raw;

  let res = "";
  const sep = "=========";
  res += `${sep}Standard Output:${sep}\n${stdout}\n`;
  res += `${sep}Standard Error:${sep}\n${stderr}`;

  output.value = await codeToHtml(res, {
    lang: stdout.trim() ? "txt" : "rust",
    themes: { light: "github-light", dark: "github-dark" },
    defaultColor: false,
    transformers: [
      {
        name: "rp:add-class",
        pre(node) {
          this.addClassToHast(node, "vp-code");
        },
      },
      // https://github.com/rust-lang/rust-playground/blob/main/ui/frontend/Output/OutputPrism.tsx
      // language: 'rust_mir' | 'rust_errors';
      {
        name: "rp:error-output",
        code(hast) { },
        line(node, line) {
          this.meta;
          node.children.forEach((child) => {
            child;
          });
        },
      },
    ],
  });
}

function resetOutput() {
  output.value = "";
  outputRow = 0;
  outputCol = 0;
}

function handleClickOutside(event: MouseEvent) {
  if (optionsRef.value && !optionsRef.value.contains(event.target as Node)) {
    showOptions.value = false;
  }
}
</script>

<template>
  <div ref="anchor">
    <div :id="`rp_${props.id}`" class="wrapper language-rust">
      <!-- options dropdown -->
      <button v-if="mounted" ref="optionsRef" class="options">
        <button class="options-toggle" @click="showOptions = !showOptions">
          <span>{{ execOptions.channel }} ({{ execOptions.edition }})</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
            <path fill="currentColor" d="M7 10l5 5 5-5z" />
          </svg>
        </button>
        <div v-show="showOptions" class="options-menu">
          <div class="option">
            <label>Channel:
              <select v-model="execOptions.channel">
                <option value="stable">Stable</option>
                <option value="beta">Beta</option>
                <option value="nightly">Nightly</option>
              </select></label>
          </div>
          <div class="option">
            <label>Edition:
              <select v-model="execOptions.edition">
                <option value="2015">2015</option>
                <option value="2018">2018</option>
                <option value="2021">2021</option>
                <option value="2024">2024</option>
              </select></label>
          </div>
          <div class="option">
            <label>Mode:
              <select v-model="execOptions.mode">
                <option value="debug">Debug</option>
                <option value="release">Release</option>
              </select></label>
          </div>
          <div class="option">
            <label>Type:
              <select v-model="execOptions.crateType">
                <option value="bin">Binary</option>
                <option value="lib">Library</option>
              </select></label>
          </div>
          <div class="option">
            <label><input v-model="execOptions.tests" type="checkbox" /> Run
              Tests</label>
          </div>
          <div class="option">
            <label><input v-model="execOptions.backtrace" type="checkbox" /> Show
              Backtrace</label>
          </div>
        </div>
      </button>

      <!-- inject vitepress's copy code button -->
      <button title="Copy Code" class="copy" />

      <button v-if="mounted" class="run" :disabled="running" :title="buttonText" @click="run">
        <span class="sr-only">{{ buttonText }}</span>
        <svg v-if="running" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
          <path fill="currentColor" d="M12 2A10 10 0 1 0 22 12A10 10 0 0 0 12 2Zm0 18a8 8 0 1 1 8-8A8 8 0 0 1 12 20Z"
            opacity=".5" />
          <path fill="currentColor" d="M20 12h2A10 10 0 0 0 12 2V4A8 8 0 0 1 20 12Z">
            <animateTransform attributeName="transform" dur="1s" from="0 12 12" repeatCount="indefinite" to="360 12 12"
              type="rotate" />
          </path>
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
          <path fill="currentColor"
            d="M8 17.175V6.825q0-.425.3-.713t.7-.287q.125 0 .263.037t.262.113l8.15 5.175q.225.15.338.375t.112.475t-.112.475t-.338.375l-8.15 5.175q-.125.075-.262.113T9 18.175q-.4 0-.7-.288t-.3-.712" />
        </svg>
      </button>
      <!-- code body -->
      <div ref="parent" />
    </div>

    <!-- output -->
    <div v-show="showOutput" class="output">
      <svg v-show="running" xmlns="http://www.w3.org/2000/svg" width="32" height="200" viewBox="0 6 24 12">
        <circle cx="18" cy="12" r="0" fill="currentColor">
          <animate attributeName="r" begin=".67" calcMode="spline" dur="1.5s"
            keySplines="0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8" repeatCount="indefinite" values="0;2;0;0" />
        </circle>
        <circle cx="12" cy="12" r="0" fill="currentColor">
          <animate attributeName="r" begin=".33" calcMode="spline" dur="1.5s"
            keySplines="0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8" repeatCount="indefinite" values="0;2;0;0" />
        </circle>
        <circle cx="6" cy="12" r="0" fill="currentColor">
          <animate attributeName="r" begin="0" calcMode="spline" dur="1.5s"
            keySplines="0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8" repeatCount="indefinite" values="0;2;0;0" />
        </circle>
      </svg>
      <!-- <code v-for="(line, i) in outputLines">
          {{ line }}<br v-if="i != outputLines.length - 1" />
        </code> -->
      <div class="language-rust" v-html="output" />
      <!-- {{ output }} -->

      <button v-if="mounted" class="reset" @click="reset">
        {{ running ? "stop running" : "reset" }}
      </button>
    </div>
  </div>
</template>

<style scoped>
div.wrapper {
  position: relative;
  border: 1px solid var(--vp-code-copy-code-border-color);
  border-radius: 8px;
}

:deep(.cm-editor) {
  font-size: var(--vp-code-font-size);
  background-color: var(--vp-code-block-bg);
  max-height: v-bind("props.maxHeight");
  border-bottom: 1px solid var(--vp-c-divider);
}

:deep(.cm-editor.cm-focused) {
  /* outline: 1px solid var(--vp-c-brand-1); */
  outline: none;
}

:deep(.cm-scroller) {
  scrollbar-width: thin;
  overflow: auto;
}

:deep(.cm-editor .cm-content) {
  font-family: var(--vp-font-family-mono);
  padding: 8px 0;
}

:deep(.cm-editor .cm-gutters) {
  font-family: var(--vp-font-family-mono);
  color: var(--vp-code-line-number-color);
  background-color: var(--vp-code-block-bg);
  border-right: 1px solid var(--vp-code-block-divider-color);
  width: 32px;
  justify-content: center;
  border-top-left-radius: 8px;
  border-bottom-left-radius: 8px;
}

:deep(.cm-editor .cm-gutterElement) {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  padding: 0;
}

:deep(.cm-editor .cm-line) {
  padding: 0 28px 0 10px;
  line-height: var(--vp-code-line-height);
}

:deep(.cm-editor .cm-activeLine) {
  background-color: var(--vp-code-line-highlight-color);
}

button.options {
  z-index: 3;
  right: 110px !important;
  width: auto !important;
}

button.run {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 3;
}

button.copy {
  position: absolute;
  top: 12px;
  right: 100px;
  z-index: 3;
}

.options-toggle {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 4px 8px;
  border-radius: 4px;
  color: var(--vp-c-text-2);
  font-size: 0.9em;
  cursor: pointer;
  height: 32px;
}

button.run:hover {
  color: var(--vp-c-brand-2);
  background-color: var(--vp-code-copy-code-hover-bg);
  border: 1px solid var(--vp-code-copy-code-hover-border-color);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

div.output {
  margin: 10px -24px;
  position: relative;
  background-color: var(--vp-code-block-bg);
  line-height: var(--vp-code-line-height);
  /* padding: 8px 0; */
  box-sizing: content-box;
  overflow: auto;
  white-space: nowrap;
}

div.output:has(input:focus) {
  outline: 1px solid var(--vp-c-brand-1);
}

div.output .language-rust {
  margin: 0;
  max-height: v-bind("props.maxOutputHeight");
}

div.output code:last-of-type {
  width: fit-content;
  padding-right: 0;
}

div.output input {
  font-family: var(--vp-font-family-mono);
  font-size: var(--vp-code-font-size);
  box-sizing: content-box;
  padding-right: 24px;
  outline: none;
}

div.output input:only-child {
  padding-left: 24px;
}

button.reset {
  position: absolute;
  top: 2px;
  right: 5px;
  z-index: 12;
  font-size: 12px;
  font-weight: 500;
  padding: 0 3px;
  text-decoration: underline;
  color: var(--vp-c-brand-1);
}

button.reset:hover {
  color: var(--vp-c-brand-2);
}

button:focus-visible {
  outline: revert;
}

.options-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 4px;
  padding: 8px;
  border: 1px solid var(--vp-code-copy-code-border-color);
  border-radius: 6px;
  background: var(--vp-c-bg);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  min-width: 200px;
}

.option {
  margin: 8px 0;
}

.option:first-child {
  margin-top: 0;
}

.option:last-child {
  margin-bottom: 0;
}

.option label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  color: var(--vp-c-text-2);
  font-size: 0.9em;
}

.option select {
  padding: 4px 8px;
  border: 1px solid var(--vp-code-copy-code-border-color);
  border-radius: 4px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 0.9em;
  min-width: 100px;
}

.option input[type="checkbox"] {
  margin: 0;
  cursor: pointer;
}

@media (min-width: 640px) {
  div.wrapper {
    margin: 8px 0;
  }

  :deep(.cm-editor),
  div.output {
    border-radius: 8px;
  }

  div.output {
    margin: 8px 0;
  }
}
</style>
