import FunctionEditor from "./Editor";
import { useState } from "react";
const allFunctionList = [
  {
    name: "index.ts",
    source: {
      code: `hello world`,
    },
  },
  {
    name: "index2.ts",
    source: {
      code: `hello world2`,
    },
  },
];

function App() {
  const [currentFunction, setCurrentFunction] = useState(allFunctionList[0]);

  return (
    <div>
      {allFunctionList.map((item: any) => {
        return <div 
          style={{
            width:"100px", 
            height:"30px", 
            background: "#ffffff", 
            display: "inline-block", 
            color: "#000000", 
            fontSize: "16px",
            border: "1px solid black", 
          }}
          key={item.name}
          onClick={() => {
            setCurrentFunction(item);
          }}
        >
          {item.name}
        </div>
      })}
      <div style={{width: "800px", height: "600px", border: "1px solid black"}}>
        <FunctionEditor
            allFunctionList={allFunctionList}
            path={`C:/Users/heheer/github/monaco-lsp/${currentFunction.name}`}
          />
      </div>
    </div>
  )
}

export default App
