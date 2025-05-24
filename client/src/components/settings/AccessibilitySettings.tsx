import React from 'react';
import { useAccessibility } from '@/context/AccessibilityContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Eye, Speaker } from 'lucide-react';

const AccessibilitySettings: React.FC = () => {
  const { 
    highContrastMode, 
    toggleHighContrastMode,
    screenReaderOptimized,
    toggleScreenReaderOptimized
  } = useAccessibility();

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="text-xl">Accessibility Settings</CardTitle>
        <CardDescription>Customize the application to meet your accessibility needs</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-2 rounded-full bg-primary/10">
              <Eye className="h-5 w-5 text-primary" />
            </div>
            <div>
              <Label htmlFor="high-contrast" className="text-base font-medium">
                High Contrast Mode
              </Label>
              <p className="text-sm text-muted-foreground">
                Increases contrast for better readability
              </p>
            </div>
          </div>
          <Switch
            id="high-contrast"
            checked={highContrastMode}
            onCheckedChange={toggleHighContrastMode}
            aria-label="Toggle high contrast mode"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-2 rounded-full bg-primary/10">
              <Speaker className="h-5 w-5 text-primary" />
            </div>
            <div>
              <Label htmlFor="screen-reader" className="text-base font-medium">
                Screen Reader Optimization
              </Label>
              <p className="text-sm text-muted-foreground">
                Improves compatibility with screen readers
              </p>
            </div>
          </div>
          <Switch
            id="screen-reader"
            checked={screenReaderOptimized}
            onCheckedChange={toggleScreenReaderOptimized}
            aria-label="Toggle screen reader optimization"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default AccessibilitySettings;