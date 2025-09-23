import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { useState } from "react";

export function AICodeAssistantCard() {
  const [question, setQuestion] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle the question submission here
    console.log("Question submitted:", question);
    setQuestion("");
  };

  return (
    <Card className="col-span-3 relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 shadow-xl">
      {/* Decorative elements */}
      <div className="absolute inset-0 bg-grid-white/[0.02] -z-1" />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-800/50 via-transparent to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/6 bg-gradient-to-b from-blue-500/20 to-transparent blur-2xl" />
      
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 text-transparent bg-clip-text">
          AI Code Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="relative z-10">
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-slate-300">
            Ask natural language questions about your codebase. Get intelligent answers with contextual file references and code insights.
          </p>
          <div className="flex items-center space-x-2 relative group">
            <Input
              placeholder="What would you like to know about this project? (e.g., 'How is authentication handled?' or 'Explain the database schema')"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="flex-1 bg-slate-800/50 border-slate-600/50 text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
            />
            <Button 
              type="submit" 
              size="icon"
              className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 transition-all duration-200 hover:scale-105"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}