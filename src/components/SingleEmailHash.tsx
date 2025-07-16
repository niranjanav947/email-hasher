
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy, Hash, Check } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { generateHash, HashAlgorithm, getHashAlgorithmName } from '@/utils/hashUtils';

export const SingleEmailHash = () => {
  const [email, setEmail] = useState('');
  const [hash, setHash] = useState('');
  const [algorithm, setAlgorithm] = useState<HashAlgorithm>('md5');
  const [copied, setCopied] = useState(false);
  const [processing, setProcessing] = useState(false);

  const handleGenerate = async () => {
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    if (!isValidEmail(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    try {
      const generatedHash = await generateHash(email, algorithm);
      setHash(generatedHash);
      toast({
        title: "Success!",
        description: `${getHashAlgorithmName(algorithm)} hash generated successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate hash",
        variant: "destructive",
      });
    }
    setProcessing(false);
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(hash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copied!",
        description: "Hash copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter email address (e.g., user@example.com)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12"
            onKeyPress={(e) => e.key === 'Enter' && handleGenerate()}
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
        disabled={!email || processing}
      >
        <Hash className="h-5 w-5 mr-2" />
        {processing ? 'Generating...' : `Generate ${getHashAlgorithmName(algorithm)} Hash`}
      </Button>

      {hash && (
        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-gray-700">
                  Generated {getHashAlgorithmName(algorithm)} Hash
                </Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyToClipboard}
                  className="h-8"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-1" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <div className="bg-white p-3 rounded-md border font-mono text-sm break-all">
                {hash}
              </div>
              <div className="text-xs text-gray-500">
                Email: {email} → {getHashAlgorithmName(algorithm)} Hash: {hash}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
