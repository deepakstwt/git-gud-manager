'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Archive, AlertTriangle, Lock } from 'lucide-react';
import { toast } from 'sonner';

interface ArchiveProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onArchive: (reason: string) => void;
  projectName?: string;
}

export function ArchiveProjectModal({ isOpen, onClose, onArchive, projectName }: ArchiveProjectModalProps) {
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (confirmText !== 'ARCHIVE') {
      toast.error('Please type "ARCHIVE" to confirm');
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      onArchive(reason);
      toast.success('Project archived successfully!');
      
      // Reset form
      setReason('');
      setConfirmText('');
      onClose();
    } catch (error) {
      toast.error('Failed to archive project. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg glass-card modal-enhanced border-0">
        <DialogHeader className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-destructive/20 to-orange-500/20 flex items-center justify-center border-2 border-destructive/30">
              <Archive className="w-8 h-8 text-destructive" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-destructive to-orange-500 bg-clip-text text-transparent">
                Archive Project
              </DialogTitle>
              <DialogDescription className="text-muted-foreground mt-1">
                This action will archive <span className="font-semibold text-foreground">&quot;{projectName || 'this project'}&quot;</span> and remove it from active projects.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <div className="p-6 bg-gradient-to-br from-destructive/10 to-orange-500/10 border-2 border-destructive/20 rounded-2xl">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-destructive/20 flex items-center justify-center border border-destructive/30 flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
              <div className="space-y-3">
                <h4 className="font-bold text-destructive text-lg">Warning</h4>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-destructive rounded-full" />
                    Project will be moved to archived status
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-destructive rounded-full" />
                    Team members will lose access to active features
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-destructive rounded-full" />
                    Data will be preserved but read-only
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-destructive rounded-full" />
                    This action can be reversed by contacting support
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="reason" className="text-sm font-medium">Reason for Archiving (Optional)</Label>
              <Textarea
                id="reason"
                placeholder="Why are you archiving this project?"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="rounded-xl border-border/40 bg-muted/20 focus:bg-background transition-all duration-200 resize-none"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="confirm" className="flex items-center gap-2 text-sm font-medium">
                <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <Lock className="w-4 h-4 text-destructive" />
                </div>
                Type &quot;ARCHIVE&quot; to confirm
              </Label>
              <Input
                id="confirm"
                type="text"
                placeholder="ARCHIVE"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="h-12 rounded-xl border-border/40 bg-muted/20 focus:bg-background transition-all duration-200 font-mono text-center text-lg tracking-wider"
                required
              />
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
                variant="destructive"
                className="flex-1 h-12 magnetic-button bg-gradient-to-r from-destructive to-orange-500 border-0 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                disabled={isLoading || confirmText !== 'ARCHIVE'}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Archiving...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Archive className="w-4 h-4" />
                    Archive Project
                  </div>
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
