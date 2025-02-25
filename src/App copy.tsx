import { useState } from "react";
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import "./App.css";

import { ChatInput } from "./components/ChatInput/ChatInput";
import { ChatMessage } from "./components/ChatMessage/ChatMessage";

const MODEL_NAME = "Titan";
const USER_NAME = "User";

const client = new BedrockRuntimeClient({
    region: "us-east-1",
    credentials: {
        accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
        secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY ,
    },
});

function App() {
    const [history, setHistory] = useState<{ author: string; text: string }[]>([
        { author: USER_NAME, text: "Hello!" },
        { author: MODEL_NAME, text: "How can I help you?" },
    ]);

    const addToHistory = (text: string, author: string) => {
        setHistory((prev) => [...prev, { text, author }]);
    }

    const onSubmit = async (prompt: string) => {
        addToHistory(prompt, USER_NAME);
        const response = await client.send(
            new InvokeModelCommand({
                contentType: "application/json",
                body: JSON.stringify({
                    inputText: prompt,
                    textGenerationConfig:{
                        maxTokenCount:8192,
                        stopSequences:[],
                        temperature:0,
                        topP:1,}
                }),
                modelId: "amazon.titan-tg1-large",
            }),
        );
        console.log(response);

        const decodedResponseBody = new TextDecoder().decode(response.body as Uint8Array);
        const responseBody = JSON.parse(decodedResponseBody);
        console.log({ decoded:responseBody});
        const text = responseBody.results[0].outputText;
        addToHistory(text, MODEL_NAME);
    };

    return (
        <div className="flex flex-col h-screen p-4">
            <div className="overflow-y-scroll flex-1">
                {history.map(({ author, text }) => (
                    <ChatMessage
                        author={author}
                        reverse={author === USER_NAME}
                        text={text}
                    />
                ))}
            </div>

            <div className="flex items-center justify-between mt-auto h-20 sticky bottom-0 left-0 right-0">
                <ChatInput onSubmit={onSubmit} />
            </div>
        </div>
    );
}

export default App;
