import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useEncryption } from "@/contexts/EncryptionContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, ShieldCheck, Key, RefreshCw, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export const SecurityDashboard = () => {
  const { user } = useAuth();
  const { keyPair, generateKeys, isLoading } = useEncryption();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateKeys = async () => {
    setIsGenerating(true);
    try {
      await generateKeys();
      toast.success("Encryption keys generated successfully!");
    } catch {
      toast.error("Failed to generate encryption keys");
    } finally {
      setIsGenerating(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Security Dashboard
          </CardTitle>
          <CardDescription>Manage your encryption keys and security settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-green-500" />
              <span className="font-medium">End-to-End Encryption</span>
            </div>
            <Badge variant={keyPair ? "default" : "secondary"}>
              {keyPair ? "Active" : "Not Set Up"}
            </Badge>
          </div>

          {keyPair && (
            <Alert>
              <Key className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p>Your encryption keys are securely stored and ready to use.</p>
                  <div className="text-xs text-muted-foreground">
                    <p>Key ID: {keyPair.keyId.slice(0, 16)}…</p>
                    <p>Public Key: {keyPair.publicKey.slice(0, 32)}…</p>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {!keyPair && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p>You haven't set up encryption keys yet. Generate keys to enable secure messaging.</p>
                  <Button
                    onClick={handleGenerateKeys}
                    disabled={isLoading || isGenerating}
                    className="w-full"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Generating Keys…
                      </>
                    ) : (
                      <>
                        <Key className="h-4 w-4 mr-2" />
                        Generate Encryption Keys
                      </>
                    )}
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Message Security</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• End-to-end encryption</li>
                  <li>• Message signing</li>
                  <li>• Perfect forward secrecy</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Data Protection</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Input sanitization</li>
                  <li>• Rate limiting</li>
                  <li>• XSS prevention</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">Security Best Practices:</p>
                <ul className="text-sm space-y-1 ml-4">
                  <li>• Never share your encryption keys with anyone</li>
                  <li>• Encrypted messages are only visible to you and the recipient</li>
                  <li>• All messages are signed to prevent tampering</li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};
