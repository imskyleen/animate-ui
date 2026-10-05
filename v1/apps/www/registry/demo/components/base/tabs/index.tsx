import {
  Tabs,
  TabsPanel,
  TabsPanels,
  TabsList,
  TabsTab,
} from '@/registry/components/base/tabs';
import { Button } from '@workspace/ui/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/ui/card';
import { Input } from '@workspace/ui/components/ui/input';
import { Label } from '@workspace/ui/components/ui/label';

export function BaseTabsDemo() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <Tabs defaultValue="account">
        <TabsList>
          <TabsTab value="account">Account</TabsTab>
          <TabsTab value="password">Password</TabsTab>
        </TabsList>
        <Card className="shadow-none py-0">
          <TabsPanels className="py-6">
            <TabsPanel value="account" className="flex flex-col gap-6">
              <CardHeader>
                <CardTitle>Account</CardTitle>
                <CardDescription>
                  Make changes to your account here. Click save when you&apos;re
                  done.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="tabs-demo-name">Name</Label>
                  <Input id="tabs-demo-name" defaultValue="Pedro Duarte" />
                </div>
              </CardContent>
              <CardFooter>
                <Button>Save changes</Button>
              </CardFooter>
            </TabsPanel>
            <TabsPanel value="password" className="flex flex-col gap-6">
              <CardHeader>
                <CardTitle>Password</CardTitle>
                <CardDescription>
                  Change your password here. After saving, you&apos;ll be logged
                  out.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="tabs-demo-current">Current password</Label>
                  <Input id="tabs-demo-current" type="password" />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="tabs-demo-new">New password</Label>
                  <Input id="tabs-demo-new" type="password" />
                </div>
              </CardContent>
              <CardFooter>
                <Button>Save password</Button>
              </CardFooter>
            </TabsPanel>
          </TabsPanels>
        </Card>
      </Tabs>
    </div>
  );
}
