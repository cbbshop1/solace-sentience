import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ExportButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export const ExportButton = ({ onClick, disabled }: ExportButtonProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClick}
            disabled={disabled}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <Download className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-mono text-xs">Export to Markdown (⌘E)</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
