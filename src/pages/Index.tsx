
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SingleEmailHash } from '@/components/SingleEmailHash';
import { MultipleEmailHash } from '@/components/MultipleEmailHash';
import { FileUploadHash } from '@/components/FileUploadHash';
import { Mail, Hash, Upload, User } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Hash className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">Email Hash Generator</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Generate secure cryptographic hashes for your email addresses. Perfect for data processing, 
            privacy protection, and system integration.
          </p>
        </div>

        <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl text-center">Choose Your Method</CardTitle>
            <CardDescription className="text-center">
              Select how you'd like to generate cryptographic hashes for your emails
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="single" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="single" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Single Email
                </TabsTrigger>
                <TabsTrigger value="multiple" className="flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  Multiple Emails
                </TabsTrigger>
                <TabsTrigger value="file" className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  File Upload
                </TabsTrigger>
              </TabsList>

              <TabsContent value="single" className="space-y-4">
                <SingleEmailHash />
              </TabsContent>

              <TabsContent value="multiple" className="space-y-4">
                <MultipleEmailHash />
              </TabsContent>

              <TabsContent value="file" className="space-y-4">
                <FileUploadHash />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="mt-8 text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <User className="h-4 w-4" />
            <span>Created by <strong>Niranjan AV</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
