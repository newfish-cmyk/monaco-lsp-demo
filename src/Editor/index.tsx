import { useEffect, useMemo, useRef, useState } from "react";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import { buildWorkerDefinition } from "monaco-editor-workers";
import * as vscode from "vscode";
import { createConfiguredEditor } from "vscode/monaco";
import { RegisteredFileSystemProvider, RegisteredMemoryFile,registerFileSystemOverlay } from 'vscode/service-override/files';

import { createUrl, createWebSocketAndStartClient, performInit } from "./LanguageClient";

buildWorkerDefinition(
  "../../node_modules/monaco-editor-workers/dist/workers/",
  new URL("", window.location.href).href,
  false,
);

const updateModel = (path: string, editorRef: any) => {
  const newModel = monaco.editor.getModel(monaco.Uri.file(path));
  
  if (editorRef.current?.getModel() !== newModel) {
    editorRef.current?.setModel(newModel);
  }
};

function FunctionEditor(props: {
  allFunctionList: any;
  path: string;
}) {
  const {
    allFunctionList,
    path,
  } = props;

  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>();
  const monacoEl = useRef(null);
  const hostname = "localhost";
  const path1 = "";
  const port = 30000;
  const url = useMemo(() => createUrl(hostname, port, path1), [hostname, port, path1]);


  const [fileSystemProvider] = useState<RegisteredFileSystemProvider>(() => {
    const provider =  new RegisteredFileSystemProvider(false)
    registerFileSystemOverlay(1, provider);
    return provider
  });

  useEffect(() => {
    if (monacoEl && !editorRef.current) {
      const start = async () => {
        performInit(true);
        editorRef.current = createConfiguredEditor(monacoEl.current!, {
          minimap: {
            enabled: false,
          },
          readOnly: false,
          language: "typescript",
          automaticLayout: true,
          scrollbar: {
            verticalScrollbarSize: 4,
            horizontalScrollbarSize: 8,
          },
          formatOnPaste: true,
          overviewRulerLanes: 0,
          lineNumbersMinChars: 4,
          fontSize: 14,
          theme: "vs",
          scrollBeyondLastLine: false,
        });
        createWebSocketAndStartClient(url);
      };
      start();
    } else if (monacoEl && editorRef.current) {
      updateModel(path, editorRef);
    }


    allFunctionList.forEach(async (item: any) => {
      if (!monaco.editor.getModel(monaco.Uri.file(`C:/Users/heheer/github/monaco-lsp/${item.name}`))) {
        fileSystemProvider.registerFile(new RegisteredMemoryFile(vscode.Uri.file(`C:/Users/heheer/github/monaco-lsp/${item.name}`), item.source.code));
        const model = monaco.editor.createModel(item.source.code, "typescript", monaco.Uri.file(`C:/Users/heheer/github/monaco-lsp/${item.name}`))
        editorRef.current?.setModel(model);
      }
    })

    // window.onbeforeunload = () => {
    //   // On page reload/exit, close web socket connection
    //   lspWebSocket?.close();
    // };
    // return () => {
    //     // On component unmount, close web socket connection
    //     lspWebSocket?.close();
    // };

    return () => {};
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path,  url, fileSystemProvider]);


  return <div style={{ height: "100%", width:"100%" }} ref={monacoEl}></div>;
}

export default FunctionEditor;
