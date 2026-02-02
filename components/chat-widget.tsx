"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageCircle, Send, X, Bot, User, Sparkles, Leaf, Zap, Trash2, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

interface Message {
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: "assistant", 
      content: "🌱 Hi! I'm your EcoCred AI assistant! I can help you learn about environmental topics, sustainability practices, and answer questions about eco-friendly activities. What would you like to know?", 
      timestamp: new Date() 
    }
  ])
  const [input, setInput] = useState("")
  const [suggestedPrompts, setSuggestedPrompts] = useState([
    "What are some eco-friendly practices for students?",
    "How can I reduce my carbon footprint?",
    "Explain renewable energy sources",
    "What is sustainable living?",
    "How does recycling help the environment?",
    "What are the benefits of tree planting?",
    "How to conserve water at home?",
    "What is climate change?",
    "How to reduce plastic waste?",
    "What is composting and how to start?"
  ])

  const [isLoading, setIsLoading] = useState(false)
  const [showPrompts, setShowPrompts] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      role: "user",
      content: input.trim(),
      timestamp: new Date()
    }

    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          messages: newMessages.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response')
      }

      const reply = data.result.choices?.[0]?.message?.content || "I'm sorry, I couldn't process your request right now."
      
      const assistantMessage: Message = {
        role: "assistant",
        content: reply,
        timestamp: new Date()
      }

      setMessages([...newMessages, assistantMessage])
    } catch (error) {
      const errorMessage: Message = {
        role: "assistant",
        content: `⚠️ Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date()
      }
      setMessages([...newMessages, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearChat = () => {
    setMessages([
      { 
        role: "assistant", 
        content: "🌱 Hi! I'm your EcoCred AI assistant! I can help you learn about environmental topics, sustainability practices, and answer questions about eco-friendly activities. What would you like to know?", 
        timestamp: new Date() 
      }
    ])
  }

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <div className="relative">
          {/* Animated background glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500 rounded-full blur-lg opacity-30 animate-pulse"></div>
          
          {/* Floating chat button with eco theme */}
          <Button
            onClick={() => setIsOpen(true)}
            className="relative rounded-full w-16 h-16 shadow-2xl hover:shadow-green-500/25 transition-all duration-300 bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 border-2 border-white/20 backdrop-blur-sm"
            size="icon"
          >
            <MessageCircle className="h-7 w-7 text-white" />
            
            {/* Floating eco icons */}
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
              <Leaf className="h-3 w-3 text-green-600" />
            </div>
            <div className="absolute -bottom-1 -left-1 w-5 h-5 bg-blue-400 rounded-full flex items-center justify-center animate-pulse">
              <Zap className="h-2.5 w-2.5 text-white" />
            </div>
          </Button>
          
          {/* Notification badge */}
          <div className="absolute -top-1 -left-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center animate-ping">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 max-h-[600px]">
      <Card className="shadow-2xl border-0 bg-gradient-to-br from-white via-green-50/50 to-blue-50/50 backdrop-blur-xl border-white/20">
        <CardHeader className="pb-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Bot className="h-6 w-6 text-white" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
              </div>
              <div>
                <CardTitle className="text-lg text-white">EcoCred Assistant</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs bg-white/20 text-white border-white/30">
                    <Sparkles className="h-3 w-3 mr-1" />
                    AI Powered
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-white/80">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    Online
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearChat}
                className="h-8 w-8 p-0 text-white hover:bg-white/20"
                title="Clear chat"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 p-0 text-white hover:bg-white/20"
                title="Close chat"
              >
                <Minus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <ScrollArea 
            ref={scrollAreaRef}
            className="h-80 px-4"
          >
            <div className="space-y-4 pb-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex gap-3",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {message.role === "assistant" && (
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg">
                      <Bot className="h-5 w-5 text-white" />
                    </div>
                  )}
                  
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-lg",
                      message.role === "user"
                        ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white ml-auto"
                        : "bg-gradient-to-br from-green-100 to-emerald-100 text-gray-800 border border-green-200"
                    )}
                  >
                    <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>
                    <div className={cn(
                      "text-xs mt-2 opacity-70",
                      message.role === "user" ? "text-white/70" : "text-gray-500"
                    )}>
                      {message.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>

                  {message.role === "user" && (
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                      <User className="h-5 w-5 text-white" />
                    </div>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl px-4 py-3 text-sm shadow-lg border border-green-200">
                    <div className="flex items-center gap-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                      <span className="text-gray-600">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          
          <div className="border-t border-green-200/50 p-4 bg-gradient-to-r from-green-50/50 to-blue-50/50">
            {/* Prompt Suggestions */}
            {showPrompts && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-gray-600">💡 Suggested Questions</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPrompts(false)}
                    className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
                  {suggestedPrompts.slice(0, 5).map((prompt, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setInput(prompt)
                        setShowPrompts(false)
                      }}
                      className="text-left p-2 text-xs bg-white/50 hover:bg-white/80 rounded-lg border border-green-200/50 transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about environmental topics..."
                disabled={isLoading}
                className="flex-1 border-green-200 focus:border-green-400 focus:ring-green-400/20 rounded-xl"
              />
              <Button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                size="icon"
                className="shrink-0 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-xl shadow-lg"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPrompts(!showPrompts)}
                  className="h-6 px-2 text-xs text-gray-500 hover:text-gray-700"
                >
                  💡 Prompts
                </Button>
                <p className="text-xs text-gray-500">
                  Ask about sustainability, eco-friendly practices, or environmental topics
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <Leaf className="h-3 w-3" />
                <span>EcoCred AI</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
