"use client"
import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
const AiChat = () => {
    interface ChatMessage {
        role : string,
        content? : string
    }
    const [message, setMessage]  = useState<string>("");
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const handleSendButton = async (e : React.FormEvent) => {
        e.preventDefault()
        if(!message.trim()) return;
        const userMessage = message;
        setMessages((prev) => [...prev, {role : "user", content : message}]);
        setLoading(true);
        setMessage("");
        try {

            const res = await fetch(`http://localhost:8000/chat?message=${message}`)
            const result = await res.json();
            setMessages((prev) => [...prev, {role : "assistant", content : result.message}])
            setLoading(false);
        } catch (err) {
            setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "❌ Error getting response",
        },
      ]);
        } finally {
            setLoading(false);
        }
    }
  return (
    <div className="flex flex-col">
    <div className="overflow-y-auto h-screen p-4 pb-25">
        {
            messages.map((message, index) => (
                <span key={index}>
                    <h3 className="font-bold italian underline ">{message.role}</h3>
                    <p>{message.content}</p>
                </span>
            ))
        }
    </div>
    <form onSubmit={handleSendButton} className="absolute bottom-0 p-4 w-full bg-white border-t-2 border-zinc-300">
    <div className="flex gap-4 justify-center ">

        <Input type="text" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type your queries here.." className="w-100" />
        <Button disabled={loading}>{loading ? "Sending..." : "Send"}</Button>
    </div>
        </form>
    </div>
  )
};

export default AiChat
