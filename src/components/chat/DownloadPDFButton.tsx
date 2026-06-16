// DownloadPDFButton — Premium PDF download for structured AI responses
import { useState, useCallback } from 'react';
import { FileDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { generatePDF, downloadPDF, isStructuredContent } from '@/utils/pdfGenerator';

interface DownloadPDFButtonProps {
  content: string;
  title?: string;
}

export function DownloadPDFButton({ content, title = 'Red Whale Document' }: DownloadPDFButtonProps) {
  const [generating, setGenerating] = useState(false);

  const handleDownload = useCallback(async () => {
    if (generating) return;
    setGenerating(true);
    try {
      const dataUri = await generatePDF(content, title);
      const safeTitle = title.replace(/[^a-z0-9\u0900-\u097F\u4e00-\u9fff\uac00-\ud7af]/gi, '-').slice(0, 40);
      downloadPDF(dataUri, `${safeTitle || 'red-whale'}.pdf`);
      toast.success('PDF downloaded!');
    } catch {
      toast.error('Failed to generate PDF. Please try again.');
    }
    setGenerating(false);
  }, [content, title, generating]);

  if (!isStructuredContent(content)) return null;

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleDownload}
      disabled={generating}
      className="h-6 px-2 text-[10px] rounded-full text-primary hover:bg-primary/10"
      title="Download as PDF"
    >
      {generating ? (
        <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> PDF…</>
      ) : (
        <><FileDown className="w-3 h-3 mr-1" /> PDF</>
      )}
    </Button>
  );
}
