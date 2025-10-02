'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { FileText, Download, Calendar, Database, Code, Users, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

interface ExportDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (data: ExportOptions) => void;
  projectName?: string;
}

interface ExportOptions {
  format: string;
  dateRange: string;
  includeData: {
    commits: boolean;
    comments: boolean;
    team: boolean;
    meetings: boolean;
    analytics: boolean;
  };
}

export function ExportDataModal({ isOpen, onClose, onExport, projectName }: ExportDataModalProps) {
  const [options, setOptions] = useState<ExportOptions>({
    format: 'json',
    dateRange: 'all',
    includeData: {
      commits: true,
      comments: true,
      team: true,
      meetings: true,
      analytics: true
    }
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      onExport(options);
      toast.success('Export started! You will receive an email when ready.');
      onClose();
    } catch (error) {
      toast.error('Failed to start export. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDataToggle = (key: keyof ExportOptions['includeData']) => {
    setOptions(prev => ({
      ...prev,
      includeData: {
        ...prev.includeData,
        [key]: !prev.includeData[key]
      }
    }));
  };

  const hasAnyDataSelected = Object.values(options.includeData).some(Boolean);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl glass-card modal-enhanced border-0">
        <DialogHeader className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center border-2 border-blue-500/30">
              <FileText className="w-8 h-8 text-blue-400" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
                Export Project Data
              </DialogTitle>
              <DialogDescription className="text-muted-foreground mt-1">
                Export data from <span className="font-semibold text-foreground">&quot;{projectName || 'this project'}&quot;</span> for external reporting and analysis
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-blue-500" />
                </div>
                Export Format
              </Label>
              <Select value={options.format} onValueChange={(value) => setOptions(prev => ({ ...prev, format: value }))}>
                <SelectTrigger className="h-12 rounded-xl border-border/40 bg-muted/20 focus:bg-background transition-all duration-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-card border-0">
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                  <SelectItem value="pdf">PDF Report</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-cyan-500" />
                </div>
                Date Range
              </Label>
              <Select value={options.dateRange} onValueChange={(value) => setOptions(prev => ({ ...prev, dateRange: value }))}>
                <SelectTrigger className="h-12 rounded-xl border-border/40 bg-muted/20 focus:bg-background transition-all duration-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-card border-0">
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="last30">Last 30 Days</SelectItem>
                  <SelectItem value="last90">Last 90 Days</SelectItem>
                  <SelectItem value="lastyear">Last Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-6">
            <Label className="text-lg font-semibold flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Database className="w-4 h-4 text-primary" />
              </div>
              Data to Include
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 p-4 rounded-xl border border-border/40 bg-muted/10 hover:bg-muted/20 transition-all duration-200">
                <Checkbox
                  id="commits"
                  checked={options.includeData.commits}
                  onCheckedChange={() => handleDataToggle('commits')}
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <Label htmlFor="commits" className="flex items-center gap-3 cursor-pointer flex-1">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Code className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <div className="font-medium">Commit History</div>
                    <div className="text-xs text-muted-foreground">Code changes and commits</div>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-3 p-4 rounded-xl border border-border/40 bg-muted/10 hover:bg-muted/20 transition-all duration-200">
                <Checkbox
                  id="comments"
                  checked={options.includeData.comments}
                  onCheckedChange={() => handleDataToggle('comments')}
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <Label htmlFor="comments" className="flex items-center gap-3 cursor-pointer flex-1">
                  <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <div className="font-medium">AI Comments & Analysis</div>
                    <div className="text-xs text-muted-foreground">AI-generated insights</div>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-3 p-4 rounded-xl border border-border/40 bg-muted/10 hover:bg-muted/20 transition-all duration-200">
                <Checkbox
                  id="team"
                  checked={options.includeData.team}
                  onCheckedChange={() => handleDataToggle('team')}
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <Label htmlFor="team" className="flex items-center gap-3 cursor-pointer flex-1">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <div className="font-medium">Team Members & Activity</div>
                    <div className="text-xs text-muted-foreground">Team collaboration data</div>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-3 p-4 rounded-xl border border-border/40 bg-muted/10 hover:bg-muted/20 transition-all duration-200">
                <Checkbox
                  id="meetings"
                  checked={options.includeData.meetings}
                  onCheckedChange={() => handleDataToggle('meetings')}
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <Label htmlFor="meetings" className="flex items-center gap-3 cursor-pointer flex-1">
                  <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <div className="font-medium">Meeting Records</div>
                    <div className="text-xs text-muted-foreground">Meeting transcripts and notes</div>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-3 p-4 rounded-xl border border-border/40 bg-muted/10 hover:bg-muted/20 transition-all duration-200 md:col-span-2">
                <Checkbox
                  id="analytics"
                  checked={options.includeData.analytics}
                  onCheckedChange={() => handleDataToggle('analytics')}
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <Label htmlFor="analytics" className="flex items-center gap-3 cursor-pointer flex-1">
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                    <Database className="w-5 h-5 text-cyan-500" />
                  </div>
                  <div>
                    <div className="font-medium">Analytics & Metrics</div>
                    <div className="text-xs text-muted-foreground">Performance and usage statistics</div>
                  </div>
                </Label>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 h-12 rounded-xl border-border/40 hover:bg-muted/50 transition-all duration-200"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 h-12 magnetic-button bg-gradient-to-r from-blue-500 to-cyan-500 border-0 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              disabled={isLoading || !hasAnyDataSelected}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Exporting...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Start Export
                </div>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
