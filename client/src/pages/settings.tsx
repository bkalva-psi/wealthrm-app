import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { useTheme } from "@/components/ui/theme-provider";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Moon, Sun, BellRing, Mail, Shield, Eye, EyeOff } from "lucide-react";

export default function Settings() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");
  const [showPassword, setShowPassword] = useState(false);
  
  // Form states
  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    jobTitle: user?.jobTitle || "",
    bio: ""
  });
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    emailAlerts: true,
    appNotifications: true,
    smsAlerts: false,
    clientUpdates: true,
    marketUpdates: true,
    taskReminders: true
  });
  
  const [displaySettings, setDisplaySettings] = useState({
    theme: theme,
    compactView: false,
    highContrastMode: false,
    largeText: false
  });
  
  // Set page title
  useEffect(() => {
    document.title = "Settings | Wealth RM";
  }, []);
  
  // Update theme when displaySettings change
  useEffect(() => {
    setTheme(displaySettings.theme as "light" | "dark" | "system");
  }, [displaySettings.theme, setTheme]);
  
  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    // This would call an API to update the profile
    toast({
      title: "Profile Updated",
      description: "Your profile information has been updated successfully.",
    });
  };
  
  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "New password and confirmation do not match. Please try again.",
        variant: "destructive"
      });
      return;
    }
    
    // This would call an API to update the password
    toast({
      title: "Password Updated",
      description: "Your password has been changed successfully.",
    });
    
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });
  };
  
  const handleSaveNotifications = () => {
    toast({
      title: "Notification Settings Saved",
      description: "Your notification preferences have been updated.",
    });
  };
  
  const handleSaveDisplaySettings = () => {
    toast({
      title: "Display Settings Saved",
      description: "Your display preferences have been updated.",
    });
  };
  
  const handleLogout = () => {
    logout();
  };
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-800">Settings</h1>

      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="display">Display</TabsTrigger>
        </TabsList>
        
        {/* Profile Settings */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and profile details
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleProfileUpdate}>
              <CardContent className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="w-full md:w-1/2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input 
                      id="fullName" 
                      value={profileForm.fullName}
                      onChange={(e) => setProfileForm({...profileForm, fullName: e.target.value})}
                    />
                  </div>
                  <div className="w-full md:w-1/2">
                    <Label htmlFor="jobTitle">Job Title</Label>
                    <Input 
                      id="jobTitle" 
                      value={profileForm.jobTitle}
                      onChange={(e) => setProfileForm({...profileForm, jobTitle: e.target.value})}
                    />
                  </div>
                </div>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="w-full md:w-1/2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input 
                      id="email" 
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                    />
                  </div>
                  <div className="w-full md:w-1/2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input 
                      id="phone" 
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="bio">Bio / About</Label>
                  <Textarea 
                    id="bio" 
                    placeholder="Tell us a bit about yourself"
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm({...profileForm, bio: e.target.value})}
                    rows={4}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t px-6 py-4">
                <Button variant="outline">Cancel</Button>
                <Button type="submit">Save Changes</Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        
        {/* Security Settings */}
        <TabsContent value="security">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>
                  Update your password to maintain account security
                </CardDescription>
              </CardHeader>
              <form onSubmit={handlePasswordUpdate}>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <div className="relative">
                      <Input 
                        id="currentPassword" 
                        type={showPassword ? "text" : "password"}
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                      />
                      <Button 
                        type="button"
                        variant="ghost" 
                        size="icon"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input 
                      id="newPassword" 
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input 
                      id="confirmPassword" 
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t px-6 py-4">
                  <Button variant="outline">Cancel</Button>
                  <Button type="submit">Update Password</Button>
                </CardFooter>
              </form>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Configure additional security settings for your account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Shield className="h-5 w-5 text-slate-500" />
                    <div>
                      <p className="text-sm font-medium text-slate-700">Two-Factor Authentication</p>
                      <p className="text-xs text-slate-500">Add an extra layer of security to your account</p>
                    </div>
                  </div>
                  <Button variant="outline">Enable</Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Mail className="h-5 w-5 text-slate-500" />
                    <div>
                      <p className="text-sm font-medium text-slate-700">Email Verification</p>
                      <p className="text-xs text-slate-500">Verify your email address</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                    Verified
                  </Badge>
                </div>
                <Separator />
                <div className="pt-4">
                  <Button variant="destructive" onClick={handleLogout}>Sign Out</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Manage how and when you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-slate-700">Notification Channels</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-slate-500" />
                    <Label htmlFor="emailAlerts" className="text-sm">Email Alerts</Label>
                  </div>
                  <Switch 
                    id="emailAlerts" 
                    checked={notificationSettings.emailAlerts}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, emailAlerts: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <BellRing className="h-4 w-4 text-slate-500" />
                    <Label htmlFor="appNotifications" className="text-sm">App Notifications</Label>
                  </div>
                  <Switch 
                    id="appNotifications" 
                    checked={notificationSettings.appNotifications}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, appNotifications: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <Label htmlFor="smsAlerts" className="text-sm">SMS Alerts</Label>
                  </div>
                  <Switch 
                    id="smsAlerts" 
                    checked={notificationSettings.smsAlerts}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, smsAlerts: checked})}
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-slate-700">Notification Types</h3>
                <div className="flex items-center justify-between">
                  <Label htmlFor="clientUpdates" className="text-sm">Client Updates</Label>
                  <Switch 
                    id="clientUpdates" 
                    checked={notificationSettings.clientUpdates}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, clientUpdates: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="marketUpdates" className="text-sm">Market Updates</Label>
                  <Switch 
                    id="marketUpdates" 
                    checked={notificationSettings.marketUpdates}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, marketUpdates: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="taskReminders" className="text-sm">Task Reminders</Label>
                  <Switch 
                    id="taskReminders" 
                    checked={notificationSettings.taskReminders}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, taskReminders: checked})}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end border-t px-6 py-4">
              <Button onClick={handleSaveNotifications}>Save Preferences</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Display Settings */}
        <TabsContent value="display">
          <Card>
            <CardHeader>
              <CardTitle>Display Settings</CardTitle>
              <CardDescription>
                Customize the appearance of your application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-slate-700">Theme</h3>
                <RadioGroup 
                  value={displaySettings.theme}
                  onValueChange={(value) => setDisplaySettings({...displaySettings, theme: value})}
                  className="flex space-x-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="light" id="theme-light" />
                    <Label htmlFor="theme-light" className="flex items-center">
                      <Sun className="h-4 w-4 mr-2" />
                      Light
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="dark" id="theme-dark" />
                    <Label htmlFor="theme-dark" className="flex items-center">
                      <Moon className="h-4 w-4 mr-2" />
                      Dark
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="system" id="theme-system" />
                    <Label htmlFor="theme-system">System</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-slate-700">Interface Options</h3>
                <div className="flex items-center justify-between">
                  <Label htmlFor="compactView" className="text-sm">Compact View</Label>
                  <Switch 
                    id="compactView" 
                    checked={displaySettings.compactView}
                    onCheckedChange={(checked) => setDisplaySettings({...displaySettings, compactView: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="highContrastMode" className="text-sm">High Contrast Mode</Label>
                  <Switch 
                    id="highContrastMode" 
                    checked={displaySettings.highContrastMode}
                    onCheckedChange={(checked) => setDisplaySettings({...displaySettings, highContrastMode: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="largeText" className="text-sm">Large Text</Label>
                  <Switch 
                    id="largeText" 
                    checked={displaySettings.largeText}
                    onCheckedChange={(checked) => setDisplaySettings({...displaySettings, largeText: checked})}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end border-t px-6 py-4">
              <Button onClick={handleSaveDisplaySettings}>Save Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// This component didn't appear to be imported anywhere in the file,
// but it's needed for the security section
const Badge = ({ 
  variant = "default", 
  className, 
  children, 
  ...props 
}: { 
  variant?: "default" | "outline"; 
  className?: string; 
  children: React.ReactNode; 
  [key: string]: any; 
}) => {
  return (
    <span 
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        variant === "outline" ? "border border-slate-200" : "bg-primary-100 text-primary-800"
      } ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};
