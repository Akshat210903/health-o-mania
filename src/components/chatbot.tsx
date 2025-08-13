
"use client"

import { useState } from "react"
import type { FormEvent } from "react"
import { chatbot } from "@/ai/flows/chatbot"
import type { ChatbotInput, ChatbotOutput } from "@/ai/schemas/chatbot"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose
} from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bot, Loader2, MessageSquare, Send, User, Info } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

type Message = {
    role: 'user' | 'model';
    content: string;
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
        const historyForApi = messages.map(msg => ({
            role: msg.role,
            content: [{ text: msg.content }]
        }));

      const result: ChatbotOutput = await chatbot({ 
          history: historyForApi,
          message: input 
      });

      const modelMessage: Message = { role: "model", content: result.message };
      setMessages(prev => [...prev, modelMessage]);

    } catch (error) {
      console.error("Chatbot error:", error);
      const errorMessage: Message = { role: "model", content: "Sorry, something went wrong. Please try again." };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          className="fixed bottom-4 right-4 h-16 w-16 rounded-full shadow-lg z-50"
          size="icon"
        >
          <MessageSquare className="h-8 w-8" />
          <span className="sr-only">Open Chatbot</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Health-o-Buddy</SheetTitle>
          <SheetDescription>
            Ask me anything about health, or navigating the site.
          </SheetDescription>
            <Alert variant="default" className="mt-2 text-xs p-2">
                <Info className="h-4 w-4" />
                <AlertTitle className="font-semibold">Disclaimer</AlertTitle>
                <AlertDescription>
                    I am an AI assistant and not a medical professional. Please consult with a healthcare provider for medical advice.
                </AlertDescription>
            </Alert>
        </SheetHeader>
        <div className="flex-1 overflow-hidden pt-4">
            <ScrollArea className="h-full pr-4">
                <div className="space-y-4">
                {messages.length === 0 && (
                    <div className="flex items-center justify-center h-full text-center text-muted-foreground">
                        <p>No messages yet. <br/>Start the conversation!</p>
                    </div>
                )}
                {messages.map((message, index) => (
                    <div
                    key={index}
                    className={`flex items-start gap-3 ${
                        message.role === 'user' ? 'justify-end' : ''
                    }`}
                    >
                    {message.role === 'model' && (
                        <Avatar className="h-8 w-8">
                            <AvatarFallback><Bot size={20} /></AvatarFallback>
                        </Avatar>
                    )}
                    <div
                        className={`rounded-lg px-3 py-2 text-sm ${
                        message.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                    >
                        {message.content}
                    </div>
                    {message.role === 'user' && (
                        <Avatar className="h-8 w-8">
                             <AvatarFallback><User size={20} /></AvatarFallback>
                        </Avatar>
                    )}
                    </div>
                ))}
                 {isLoading && (
                     <div className="flex items-start gap-3">
                         <Avatar className="h-8 w-8">
                             <AvatarFallback><Loader2 className="animate-spin" size={20}/></AvatarFallback>
                         </Avatar>
                         <div className="rounded-lg px-3 py-2 text-sm bg-muted">
                             Thinking...
                         </div>
                     </div>
                 )}
                </div>
            </ScrollArea>
        </div>
        <SheetFooter>
             <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
                <Input
                    type="text"
                    placeholder="Type your message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={isLoading}
                    autoComplete="off"
                />
                <Button type="submit" disabled={isLoading || !input.trim()}>
                    <Send className="h-4 w-4" />
                </Button>
            </form>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
