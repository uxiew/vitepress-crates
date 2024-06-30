
import type { InjectionKey } from "vue";


export interface Options {
  channel?: "stable" | 'beta' | 'nightly'  // version
  edition?: "2015" | '2018' | '2021' | '2024'
  mode?: "debug" | "release",
  crateType?: "bin" | 'lib'
  tests?: boolean
  backtrace?: boolean
}


export interface OtherComponentProps {
  maxHeight?: string
}

export const InjectPlayKey: InjectionKey<Options & OtherComponentProps> = Symbol.for("RustPlaygroundPlugin");

export const defaultConfig = {
  channel: "stable",
  edition: "2021",
  mode: "debug",
  crateType: 'bin',
  tests: false,
  backtrace: false,
} as Options
