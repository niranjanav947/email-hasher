import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, FileText, Download, Copy, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { generateHash, HashAlgorithm, getHashAlgorithmName } from '@/utils/hashUtils';

interface EmailHash {
  email: string;
  hash: string;
}

export const FileUploadHash = () => {
  const [results, setResults] = useState<EmailHash[]>([]);
  const [algorithm, setAlgorithm] = useState<HashAlgorithm>('md5');
  const [processing, setProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const processFile = useCallback(async (file: File) => {
    console.log('Processing file:', file.name, 'Type:', file.type, 'Size:', file.size);
    
    if (!file) {
      console.log('No file provided');
      return;
    }

    // More flexible file type checking
    const isValidFile = file.type === 'text/plain' || 
                       file.type === 'text/csv' || 
                       file.type === 'application/csv' ||
                       file.name.endsWith('.txt') || 
                       file.name.endsWith('.csv');

    if (!isValidFile) {
      console.log('Invalid file type:', file.type);
      toast({
        title: "Invalid File Type",
        description: "Please upload a .txt or .csv file",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);

    try {
      console.log('Reading file content...');
      const text = await file.text();
      console.log('File content length:', text.length);
      
      const lines = text.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);
      console.log('Total lines found:', lines.length);
      
      // Handle CSV format (skip header if present)
      const emails = lines
        .filter(line => line.includes('@'))
        .map(line => {
          // If it's CSV, take the first column that contains @
          const parts = line.split(',');
          const emailPart = parts.find(part => part.includes('@'));
          return emailPart ? emailPart.trim().replace(/['"]/g, '') : line;
        });

      console.log('Emails extracted:', emails);

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const validEmails = emails.filter(email => emailRegex.test(email));
      const invalidEmails = emails.filter(email => !emailRegex.test(email));

      console.log('Valid emails:', validEmails.length, 'Invalid emails:', invalidEmails.length);

      if (invalidEmails.length > 0) {
        console.log('Invalid emails found:', invalidEmails);
        toast({
          title: "Invalid Emails Found",
          description: `${invalidEmails.length} invalid email(s) will be skipped`,
          variant: "destructive",
        });
      }

      if (validEmails.length === 0) {
        console.log('No valid emails found');
        toast({
          title: "No Valid Emails",
          description: "No valid email addresses found in the file",
          variant: "destructive",
        });
        setProcessing(false);
        return;
      }

      // Generate hashes for valid emails
      const generatedResults: EmailHash[] = [];
      for (const email of validEmails) {
        const cleanEmail = email.toLowerCase().trim();
        const hash = await generateHash(cleanEmail, algorithm);
        console.log('Generated hash for', cleanEmail, ':', hash);
        generatedResults.push({ email: cleanEmail, hash });
      }

      setResults(generatedResults);
      console.log('Results set, total:', generatedResults.length);
      toast({
        title: "Success!",
        description: `Processed ${generatedResults.length} emails from file`,
      });
    } catch (error) {
      console.error('Error processing file:', error);
      toast({
        title: "Error",
        description: "Failed to process file. Please check the file format.",
        variant: "destructive",
      });
    }

    setProcessing(false);
  }, [algorithm]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('File input changed');
    const file = event.target.files?.[0];
    if (file) {
      console.log('File selected:', file.name);
      processFile(file);
    } else {
      console.log('No file selected');
    }
    // Reset the input value so the same file can be selected again
    event.target.value = '';
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    console.log('File dropped');
    const file = e.dataTransfer.files?.[0];
    if (file) {
      console.log('Dropped file:', file.name);
      processFile(file);
    } else {
      console.log('No file in drop event');
    }
  };

  const copyAllResults = async () => {
    const resultText = results
      .map(result => `${result.email},${result.hash}`)
      .join('\n');

    try {
      await navigator.clipboard.writeText(resultText);
      toast({
        title: "Copied!",
        description: "All results copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const downloadResults = () => {
    const csvContent = `Email,${getHashAlgorithmName(algorithm)} Hash\n` + 
      results.map(result => `${result.email},${result.hash}`).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `email_${algorithm}_hashes_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Downloaded!",
      description: "Results saved as CSV file",
    });
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Hash Algorithm
          </Label>
          <Select value={algorithm} onValueChange={(value: HashAlgorithm) => setAlgorithm(value)}>
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Select hash algorithm" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="md5">MD5</SelectItem>
              <SelectItem value="sha1">SHA-1</SelectItem>
              <SelectItem value="sha256">SHA-256</SelectItem>
              <SelectItem value="sha512">SHA-512</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Upload File (.txt or .csv)
          </Label>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium mb-2">
              {dragActive ? 'Drop your file here' : 'Drag & drop your file here'}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Supports .txt and .csv files with email addresses
            </p>
            <input
              type="file"
              accept=".txt,.csv,text/plain,text/csv,application/csv"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
              disabled={processing}
            />
            <Button
              variant="outline"
              className="h-10"
              onClick={() => {
                console.log('Choose file button clicked');
                document.getElementById('file-upload')?.click();
              }}
              disabled={processing}
            >
              <Upload className="h-4 w-4 mr-2" />
              {processing ? 'Processing...' : 'Choose File'}
            </Button>
          </div>
        </div>
      </div>

      {results.length > 0 && (
        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-gray-700">
                  Generated {getHashAlgorithmName(algorithm)} Hashes ({results.length})
                </Label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyAllResults}
                    className="h-8"
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Copy All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadResults}
                    className="h-8"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download CSV
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearResults}
                    className="h-8"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Clear
                  </Button>
                </div>
              </div>
              
              <div className="bg-white rounded-md border max-h-64 overflow-y-auto">
                <div className="grid grid-cols-2 gap-4 p-3 border-b bg-gray-50 font-medium text-sm">
                  <div>Email</div>
                  <div>{getHashAlgorithmName(algorithm)} Hash</div>
                </div>
                {results.map((result, index) => (
                  <div key={index} className="grid grid-cols-2 gap-4 p-3 border-b last:border-b-0 text-sm">
                    <div className="truncate">{result.email}</div>
                    <div className="font-mono text-xs truncate">{result.hash}</div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
