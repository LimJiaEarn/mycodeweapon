export const DEFAULT_MEMORY_LIMIT = 128000;
export const DEFAULT_TIME_LIMIT = 5;
export const DEFAULT_LANGUAGE_ID = "71";

// map of Judge0 language_id -> monaco editor language
export const judge0ToMonacoMap: { [key: string]: string } = {
  "75": "c",
  "48": "c",
  "49": "c",
  "50": "c",

  "76": "cpp",
  "52": "cpp",
  "53": "cpp",
  "54": "cpp",

  "51": "csharp",

  "60": "go",

  "62": "java",

  "63": "javascript",
  "74": "typescript",

  "78": "kotlin",

  "64": "lua",

  "85": "perl",

  "70": "python",
  "71": "python",

  "72": "ruby",

  "73": "rust",

  "82": "sql",

  "83": "swift",
};

// Map of language_id -> code template for empty editor
export const languageTemplates: { [key: string]: string } = {
  // C
  "75": "#include <stdio.h>\n\nint main() {\n    // your code here\n    return 0;\n}",
  "48": "#include <stdio.h>\n\nint main() {\n    // your code here\n    return 0;\n}",
  "49": "#include <stdio.h>\n\nint main() {\n    // your code here\n    return 0;\n}",
  "50": "#include <stdio.h>\n\nint main() {\n    // your code here\n    return 0;\n}",

  // C++
  "76": "#include <iostream>\n\nint main() {\n    // your code here\n    return 0;\n}",
  "52": "#include <iostream>\n\nint main() {\n    // your code here\n    return 0;\n}",
  "53": "#include <iostream>\n\nint main() {\n    // your code here\n    return 0;\n}",
  "54": "#include <iostream>\n\nint main() {\n    // your code here\n    return 0;\n}",

  // C#
  "51": "using System;\n\nclass Program {\n    static void Main() {\n        // your code here\n    }\n}",

  // Go
  "60": 'package main\n\nimport "fmt"\n\nfunc main() {\n    // your code here\n}',

  // Java
  "62": "public class Main {\n    public static void main(String[] args) {\n        // your code here\n    }\n}",

  // JavaScript
  "63": '// your JavaScript code here\nconsole.log("Hello, World!");',

  // TypeScript
  "74": '// your TypeScript code here\nconst greeting: string = "Hello, World!";\nconsole.log(greeting);',

  // Kotlin
  "78": "fun main() {\n    // your code here\n}",

  // Lua
  "64": '-- your Lua code here\nprint("Hello, World!")',

  // Perl
  "85": '#!/usr/bin/perl\n# your Perl code here\nprint "Hello, World!\\n";',

  // Python
  "70": '# your Python code here\nprint("Hello, World!")',
  "71": '# your Python code here\nprint("Hello, World!")',

  // Ruby
  "72": '# your Ruby code here\nputs "Hello, World!"',

  // Rust
  "73": 'fn main() {\n    // your code here\n    println!("Hello, World!");\n}',

  // SQL
  "82": "-- your SQL query here\nSELECT 'Hello, World!' AS greeting;",

  // Swift
  "83": '// your Swift code here\nprint("Hello, World!")',
};

export const statusIdToDescMap: { [key: number]: string } = {
  1: "In Queue",
  2: "Processing",
  3: "Accepted",
  4: "Wrong Answer",
  5: "Time Limit Exceeded",
  6: "Compilation Error",
  7: "Runtime Error: Segmentation Fault",
  8: "Runtime Error: File Size Limit Exceeded",
  9: "Runtime Error: Floating Point Exception",
  10: "Runtime Error: Abnormal Program Termination",
  11: "Runtime Error: Non-Zero Exit Code",
  12: "Runtime Error",
  13: "Internal Error",
  14: "Exec Format Error",
};
