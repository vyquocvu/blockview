import React, { useEffect, useState, useRef } from "react";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/theme-dawn";
import "ace-builds/src-noconflict/theme-twilight";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Copy, Check, Maximize2 } from "lucide-react";

interface Call {
  type: string;
  from: string;
  to: string;
  value?: string;
  gas: string;
  gasUsed: string;
  input: string;
  output: string;
  calls?: Call[];
  error?: string;
}

interface DetailedTraceProps {
  trace: Call | null;
  onFetchTrace?: () => void;
  isLoading?: boolean;
  compact?: boolean; // For rendering in card header
}

export const DetailedTrace: React.FC<DetailedTraceProps> = ({ trace, onFetchTrace, isLoading = false, compact = false }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorLines, setErrorLines] = useState<number[]>([]);
  const editorRef = useRef<any>(null);

  useEffect(() => {
    const checkDarkMode = () => {
      const isDarkMode = document.documentElement.classList.contains('dark') ||
        window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDark(isDarkMode);
    };

    checkDarkMode();

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => checkDarkMode();
    
    mediaQuery.addEventListener('change', handleChange);
    
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (trace) {
      const lines = findErrorLines(trace);
      setErrorLines(lines);
    }
  }, [trace]);

  useEffect(() => {
    if (editorRef.current && errorLines.length > 0 && isModalOpen) {
      const editor = editorRef.current.editor;
      
      // Small delay to ensure editor is fully initialized
      setTimeout(() => {
        try {
          const Range = window.ace.require('ace/range').Range;
          
          // Clear existing markers
          const markers = editor.session.getMarkers();
          if (markers) {
            Object.keys(markers).forEach((markerId: string) => {
              const marker = markers[markerId];
              if (marker.clazz === 'ace-error-line') {
                editor.session.removeMarker(parseInt(markerId));
              }
            });
          }

          // Add markers for error lines
          errorLines.forEach(lineNumber => {
            const range = new Range(lineNumber, 0, lineNumber, 1000);
            editor.session.addMarker(range, 'ace-error-line', 'fullLine', false);
          });
        } catch (err) {
          console.error('Error adding markers:', err);
        }
      }, 100);
    }
  }, [errorLines, isModalOpen]);

  const findErrorLines = (obj: any): number[] => {
    const jsonString = JSON.stringify(obj, null, 2);
    const lines = jsonString.split('\n');
    const result: number[] = [];

    lines.forEach((line, index) => {
      if (line.includes('"error"')) {
        result.push(index);
      }
    });

    return result;
  };

  const getTraceContent = () => {
    return JSON.stringify(trace, null, 2);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(getTraceContent());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const handleButtonClick = async () => {
    if (!trace && onFetchTrace) {
      // Fetch trace first, then open modal
      await onFetchTrace();
    }
    // Open modal (will happen after trace is fetched due to state update)
    setIsModalOpen(true);
  };

  // Auto-open modal after trace is fetched
  useEffect(() => {
    if (trace && !isModalOpen && onFetchTrace) {
      // This will be triggered when trace becomes available after fetching
      setIsModalOpen(true);
    }
  }, [trace]);

  return (
    <>
      {!compact && (
        <div className="mt-4">
          <Button 
            onClick={handleButtonClick}
            variant="outline"
            className="w-full sm:w-auto"
            disabled={isLoading}
            aria-label="Fetch and view detailed trace in full-screen modal"
          >
            <Maximize2 className="mr-2 h-4 w-4" />
            {isLoading ? "Loading Trace..." : trace ? "Debug trace" : "Fetch & View Trace"}
          </Button>
        </div>
      )}

      {compact && (
        <Button 
          onClick={handleButtonClick}
          variant="outline"
          size="sm"
          disabled={isLoading}
          aria-label="Fetch and view detailed trace in full-screen modal"
        >
          <Maximize2 className="mr-2 h-4 w-4" />
          {isLoading ? "Loading..." : trace ? "Debug trace" : "Debug trace"}
        </Button>
      )}

      {trace && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent 
            className="max-w-[100vw] w-[100vw] h-[100vh] max-h-[100vh] p-0 flex flex-col"
            aria-describedby="trace-description"
          >
            <DialogHeader className="p-6 pb-4 border-b">
              <DialogTitle className="text-xl">Transaction Trace Details</DialogTitle>
              <p id="trace-description" className="text-sm text-muted-foreground mt-2">
                Detailed execution trace of the transaction. Lines with errors are highlighted.
              </p>
            </DialogHeader>
            
            <div className="flex gap-2 px-6 py-3 border-b bg-muted/30">
              <div className="flex-1" />
              <Button
                size="sm"
                variant="outline"
                onClick={copyToClipboard}
                aria-label={copied ? "Copied to clipboard" : "Copy trace to clipboard"}
              >
                {copied ? (
                  <>
                    <Check className="mr-2 h-4 w-4 text-green-500" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </>
                )}
              </Button>
            </div>

            <div className="flex-1 overflow-hidden px-6 pb-6 pt-3">
              <style>{`
                .ace-error-line {
                  background-color: rgba(255, 50, 50, 0.20) !important;
                  position: absolute;
                  z-index: 20;
                }
                .dark .ace-error-line {
                  background-color: rgba(255, 100, 100, 0.30) !important;
                }
                .ace_gutter-cell.ace-error-line {
                  background-color: rgba(255, 50, 50, 0.30) !important;
                }
              `}</style>
              <AceEditor
                ref={editorRef}
                mode="json"
                theme={isDark ? "twilight" : "dawn"}
                value={getTraceContent()}
                readOnly={true}
                width="100%"
                height="100%"
                fontSize={13}
                showPrintMargin={false}
                showGutter={true}
                highlightActiveLine={false}
                setOptions={{
                  useWorker: false,
                  showLineNumbers: true,
                  tabSize: 2,
                  wrap: true,
                }}
                editorProps={{
                  $blockScrolling: true,
                }}
                style={{
                  borderRadius: '0.375rem',
                  border: '1px solid',
                  borderColor: isDark ? 'rgb(55, 65, 81)' : 'rgb(229, 231, 235)',
                }}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}