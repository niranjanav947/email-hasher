
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy, Hash, Download, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { generateHash, HashAlgorithm, getHashAlgorithmName } from '@/utils/hashUtils';

interface EmailHash {
  email: string;
  hash: string;
}

export const MultipleEmailHash = () => {
  const [emailsText, setEmailsText] = useState('');
  const [results, setResults] = useState<EmailHash[]>([]);
  const [algorithm, setAlgorithm] = useState<HashAlgorithm>('md5');
  const [processing, setProcessing] = useState(false);

  const handleGenerate = async () => {
    if (!emailsText.trim()) {
      toast({
        title: "Error",
        description: "Please enter email addresses",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    
    // Split by lines and filter out empty lines
    const emails = emailsText
      .split('\n')
      .map(email => email.trim())
      .filter(email => email.length > 0);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const validEmails = emails.filter(email => emailRegex.test(email));
    const invalidEmails = emails.filter(email => !emailRegex.test(email));

    if (invalidEmails.length > 0) {
      toast({
        title: "Invalid Emails Found",
        description: `${invalidEmails.length} invalid email(s) will be skipped`,
        variant: "destructive",
      });
    }

    if (validEmails.length === 0) {
      toast({
        title: "No Valid Emails",
        description: "Please enter at least one valid email address",
        variant: "destructive",
      });
      setProcessing(false);
      return;
    }

    try {
      // Generate hashes for valid emails
      const generatedResults: EmailHash[] = [];
      for (const email of validEmails) {
        const cleanEmail = email.toLowerCase().trim();
        const hash = await generateHash(cleanEmail, algorithm);
        generatedResults.push({ email: cleanEmail, hash });
      }

      setResults(generatedResults);
      toast({
        title: "Success!",
        description: `Generated ${generatedResults.length} ${getHashAlgorithmName(algorithm)} hashes`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate hashes",
        variant: "destructive",
      });
    }
    
    setProcessing(false);
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
    setEmailsText('');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="emails" className="text-sm font-medium">
            Email Addresses (one per line)
          </Label>
          <Textarea
            id="emails"
            placeholder="Enter email addresses, one per line:&#10;user1@example.com&#10;user2@example.com&#10;user3@example.com"
            value={emailsText}
            onChange={(e) => setEmailsText(e.target.value)}
            className="min-h-32 resize-none"
            rows={6}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="algorithm" className="text-sm font-medium">
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
      </div>

      <Button 
        onClick={handleGenerate}
        className="w-full h-12 text-lg font-medium bg-blue-600 hover:bg-blue-700 transition-colors"
        disabled={!emailsText.trim() || processing}
      >
        <Hash className="h-5 w-5 mr-2" />
        {processing ? 'Processing...' : `Generate ${getHashAlgorithmName(algorithm)} Hashes`}
      </Button>

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
