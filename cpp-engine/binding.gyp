{
  "targets": [
    {
      "target_name": "bharat_crypto",
      "sources": [
        "src/bharat_crypto.cpp"
      ],
      "include_dirs": [
        "<!@(node -p \"require('node-addon-api').include\")"
      ],
      "defines": [
        "NAPI_DISABLE_CPP_EXCEPTIONS"
      ],
      "cflags!": ["-fno-exceptions"],
      "cflags_cc!": ["-fno-exceptions"],
      "msvs_settings": {
        "VCCLCompilerTool": {
          "ExceptionHandling": 1
        }
      },
      "conditions": [
        ["OS=='win'", {
          "libraries": []
        }],
        ["OS=='mac'", {
          "libraries": [
            "-framework Security"
          ]
        }],
        ["OS=='linux'", {
          "libraries": [
            "-lcrypto"
          ]
        }]
      ]
    }
  ]
}
