import getConfigurationServiceOverride from "@codingame/monaco-vscode-configuration-service-override";
import getEditorServiceOverride from "@codingame/monaco-vscode-editor-service-override"
import getLanguagesServiceOverride from '@codingame/monaco-vscode-languages-service-override'
import getModelServiceOverride from '@codingame/monaco-vscode-model-service-override'
import getTextmateServiceOverride from "@codingame/monaco-vscode-textmate-service-override";
import getThemeServiceOverride from "@codingame/monaco-vscode-theme-service-override";
import { editor, languages } from "monaco-editor";
import { initServices, MonacoLanguageClient, useOpenEditorStub } from "monaco-languageclient";
import * as vscode from "vscode";
import { IReference, ITextFileEditorModel } from "vscode/monaco";
import { LogLevel } from "vscode/services";
import { CloseAction, ErrorAction, MessageTransports } from "vscode-languageclient";
import { toSocket, WebSocketMessageReader, WebSocketMessageWriter } from "vscode-ws-jsonrpc";

import "@codingame/monaco-vscode-typescript-basics-default-extension";
import '@codingame/monaco-vscode-theme-defaults-default-extension';

const outputChannel = {
  name: 'Language Server Client',
  appendLine: (msg: string) => {
    console.log(msg)
  },
  append: (msg: string) => {
    console.log(msg)
  },
  clear: () => {},
  replace: () => {},
  show: () => {},
  hide: () => {},
  dispose: () => {}
}

export const createLanguageClient = (transports: MessageTransports): MonacoLanguageClient => {
  return new MonacoLanguageClient({
    name: "laf Language Client",
    clientOptions: {
      outputChannel,
      documentSelector: ["typescript"],
      errorHandler: {
        error: () => ({ action: ErrorAction.Continue }),
        closed: () => ({ action: CloseAction.DoNotRestart }),
      },
      workspaceFolder: {
        uri: vscode.Uri.file("C:/Users/heheer/github/monaco-lsp/"),
        name: "laf",
        index: 0,
      },
      synchronize: {
        fileEvents: [vscode.workspace.createFileSystemWatcher('**')]
      },
      middleware: {

      }
    },
    connectionProvider: {
      get: () => {
        return Promise.resolve(transports);
      },
    },
  });
};

export const createUrl = (
  hostname: string,
  port: number,
  path: string,
  secure?: boolean,
): string => {
  const protocol = secure ? "wss" : "ws";
  const url = new URL(`${protocol}://${hostname}:${port}${path}`);
  return url.toString();
};

export const createWebSocketAndStartClient = (url: string): WebSocket => {
  const webSocket = new WebSocket(url);
  webSocket.onopen = async () => {
    const socket = toSocket(webSocket);
    const reader = new WebSocketMessageReader(socket);
    const writer = new WebSocketMessageWriter(socket);
    const languageClient = createLanguageClient(
      { reader, writer }
    );
    
    languageClient.start();

    reader.onClose(() => languageClient.stop());
  };
  return webSocket;
};

export type ExampleJsonEditor = {
  languageId: string;
  editor: editor.IStandaloneCodeEditor;
  uri: vscode.Uri;
  modelRef: IReference<ITextFileEditorModel>;
};

export const performInit = async (vscodeApiInit: boolean) => {
  if (vscodeApiInit === true) {
    await initServices({
      userServices: {
        ...getThemeServiceOverride(),
        ...getTextmateServiceOverride(),
        ...getConfigurationServiceOverride(vscode.Uri.file("C:/Users/heheer/github/monaco-lsp/")),
        ...getEditorServiceOverride(useOpenEditorStub),
        ...getModelServiceOverride(),
        ...getLanguagesServiceOverride()
      },
      debugLogging: true,
      logLevel: LogLevel.Debug,
    });

    languages.register({
      id: "typescript",
      extensions: [".ts", ".tsx"],
      aliases: ["typescript", "javascript"],
      mimetypes: ["text/typescript", "text/javascript"],
    });
  }
};
