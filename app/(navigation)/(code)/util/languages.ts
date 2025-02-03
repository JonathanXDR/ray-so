export type Language = {
  name: string;
  src: () => Promise<any>;
  extensions?: string[];
};

export const LANGUAGES: { [index: string]: Language } = {
  shell: {
    name: "Bash",
    extensions: ["sh", "bash"],
    src: () => import("shiki/langs/bash.mjs"),
  },
  astro: {
    name: "Astro",
    extensions: ["astro"],
    src: () => import("shiki/langs/astro.mjs"),
  },
  cpp: {
    name: "C++",
    extensions: ["cpp", "cc", "cxx", "hpp", "h"],
    src: () => import("shiki/langs/cpp.mjs"),
  },
  csharp: {
    name: "C#",
    extensions: ["cs"],
    src: () => import("shiki/langs/csharp.mjs"),
  },
  clojure: {
    name: "Clojure",
    extensions: ["clj", "cljs", "cljc", "edn"],
    src: () => import("shiki/langs/clojure.mjs"),
  },
  crystal: {
    name: "Crystal",
    extensions: ["cr"],
    src: () => import("shiki/langs/crystal.mjs"),
  },
  css: {
    name: "CSS",
    extensions: ["css"],
    src: () => import("shiki/langs/css.mjs"),
  },
  dart: {
    name: "Dart",
    extensions: ["dart"],
    src: () => import("shiki/langs/dart.mjs"),
  },
  diff: {
    name: "Diff",
    extensions: ["diff", "patch"],
    src: () => import("shiki/langs/diff.mjs"),
  },
  dockerfile: {
    name: "Docker",
    extensions: ["dockerfile"],
    src: () => import("shiki/langs/dockerfile.mjs"),
  },
  elm: {
    name: "Elm",
    extensions: ["elm"],
    src: () => import("shiki/langs/elm.mjs"),
  },
  erb: {
    name: "ERB",
    extensions: ["erb"],
    src: () => import("shiki/langs/erb.mjs"),
  },
  elixir: {
    name: "Elixir",
    extensions: ["ex", "exs"],
    src: () => import("shiki/langs/elixir.mjs"),
  },
  erlang: {
    name: "Erlang",
    extensions: ["erl"],
    src: () => import("shiki/langs/erlang.mjs"),
  },
  gleam: {
    name: "Gleam",
    extensions: ["gleam"],
    src: () => import("shiki/langs/gleam.mjs"),
  },
  graphql: {
    name: "GraphQL",
    extensions: ["graphql", "gql"],
    src: () => import("shiki/langs/graphql.mjs"),
  },
  go: {
    name: "Go",
    extensions: ["go"],
    src: () => import("shiki/langs/go.mjs"),
  },
  haskell: {
    name: "Haskell",
    extensions: ["hs"],
    src: () => import("shiki/langs/haskell.mjs"),
  },
  html: {
    name: "HTML",
    extensions: ["html", "htm"],
    src: () => import("shiki/langs/html.mjs"),
  },
  java: {
    name: "Java",
    extensions: ["java"],
    src: () => import("shiki/langs/java.mjs"),
  },
  javascript: {
    name: "JavaScript",
    extensions: ["js", "mjs", "cjs"],
    src: () => import("shiki/langs/javascript.mjs"),
  },
  julia: {
    name: "Julia",
    extensions: ["jl"],
    src: () => import("shiki/langs/julia.mjs"),
  },
  json: {
    name: "JSON",
    extensions: ["json"],
    src: () => import("shiki/langs/json.mjs"),
  },
  jsx: {
    name: "JSX",
    extensions: ["jsx"],
    src: () => import("shiki/langs/jsx.mjs"),
  },
  kotlin: {
    name: "Kotlin",
    extensions: ["kt", "kts"],
    src: () => import("shiki/langs/kotlin.mjs"),
  },
  latex: {
    name: "LaTeX",
    extensions: ["tex", "ltx", "sty"],
    src: () => import("shiki/langs/latex.mjs"),
  },
  lisp: {
    name: "Lisp",
    extensions: ["lisp", "cl", "el"],
    src: () => import("shiki/langs/lisp.mjs"),
  },
  lua: {
    name: "Lua",
    extensions: ["lua"],
    src: () => import("shiki/langs/lua.mjs"),
  },
  markdown: {
    name: "Markdown",
    extensions: ["md", "markdown"],
    src: () => import("shiki/langs/markdown.mjs"),
  },
  matlab: {
    name: "MATLAB",
    extensions: ["m", "mat"],
    src: () => import("shiki/langs/matlab.mjs"),
  },
  move: {
    name: "Move",
    extensions: ["move"],
    src: () => import("shiki/langs/move.mjs"),
  },
  plaintext: {
    name: "Plaintext",
    extensions: ["txt"],
    src: () => import("shiki/langs/javascript.mjs"),
  },
  powershell: {
    name: "Powershell",
    extensions: ["ps1"],
    src: () => import("shiki/langs/powershell.mjs"),
  },
  objectivec: {
    name: "Objective-C",
    extensions: ["m", "h"],
    src: () => import("shiki/langs/objc.mjs"),
  },
  ocaml: {
    name: "OCaml",
    extensions: ["ml", "mli"],
    src: () => import("shiki/langs/ocaml.mjs"),
  },
  php: {
    name: "PHP",
    extensions: ["php"],
    src: () => import("shiki/langs/php.mjs"),
  },
  prisma: {
    name: "Prisma",
    extensions: ["prisma"],
    src: () => import("shiki/langs/prisma.mjs"),
  },
  python: {
    name: "Python",
    extensions: ["py"],
    src: () => import("shiki/langs/python.mjs"),
  },
  r: {
    name: "R",
    extensions: ["r"],
    src: () => import("shiki/langs/r.mjs"),
  },
  ruby: {
    name: "Ruby",
    extensions: ["rb"],
    src: () => import("shiki/langs/ruby.mjs"),
  },
  rust: {
    name: "Rust",
    extensions: ["rs"],
    src: () => import("shiki/langs/rust.mjs"),
  },
  scala: {
    name: "Scala",
    extensions: ["scala"],
    src: () => import("shiki/langs/scala.mjs"),
  },
  scss: {
    name: "SCSS",
    extensions: ["scss"],
    src: () => import("shiki/langs/scss.mjs"),
  },
  solidity: {
    name: "Solidity",
    extensions: ["sol"],
    src: () => import("shiki/langs/solidity.mjs"),
  },
  sql: {
    name: "SQL",
    extensions: ["sql"],
    src: () => import("shiki/langs/sql.mjs"),
  },
  swift: {
    name: "Swift",
    extensions: ["swift"],
    src: () => import("shiki/langs/swift.mjs"),
  },
  svelte: {
    name: "Svelte",
    extensions: ["svelte"],
    src: () => import("shiki/langs/svelte.mjs"),
  },
  toml: {
    name: "TOML",
    extensions: ["toml"],
    src: () => import("shiki/langs/toml.mjs"),
  },
  typescript: {
    name: "TypeScript",
    extensions: ["ts"],
    src: () => import("shiki/langs/typescript.mjs"),
  },
  tsx: {
    name: "TSX",
    extensions: ["tsx"],
    src: () => import("shiki/langs/tsx.mjs"),
  },
  vue: {
    name: "Vue",
    extensions: ["vue"],
    src: () => import("shiki/langs/vue.mjs"),
  },
  xml: {
    name: "XML",
    extensions: ["xml"],
    src: () => import("shiki/langs/xml.mjs"),
  },
  yaml: {
    name: "YAML",
    extensions: ["yaml", "yml"],
    src: () => import("shiki/langs/yaml.mjs"),
  },
  zig: {
    name: "Zig",
    extensions: ["zig"],
    src: () => import("shiki/langs/zig.mjs"),
  },
};
