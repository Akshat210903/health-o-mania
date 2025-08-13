
"use client";

import { SiteLayout } from "@/components/site-layout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Bot, Camera, CheckCircle, Sparkles, Trophy } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useUserData } from "@/context/user-data";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const { userProfile, tasks, foodLog, isLoading, latestCoach } = useUserData();
  
  if (!userProfile) {
    return (
        <SiteLayout>
            <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
                 <div className="flex items-center justify-between space-y-2">
                     <Skeleton className="h-8 w-48" />
                 </div>
                 <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                     <Card><CardContent className="pt-6"><Skeleton className="h-20 w-full" /></CardContent></Card>
                     <Card><CardContent className="pt-6"><Skeleton className="h-20 w-full" /></CardContent></Card>
                     <Card><CardContent className="pt-6"><Skeleton className="h-20 w-full" /></CardContent></Card>
                     <Card><CardContent className="pt-6"><Skeleton className="h-20 w-full" /></CardContent></Card>
                 </div>
                 <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    <Card className="col-span-4"><CardContent className="pt-6"><Skeleton className="h-80 w-full" /></CardContent></Card>
                    <Card className="col-span-4 lg:col-span-3"><CardContent className="pt-6"><Skeleton className="h-80 w-full" /></CardContent></Card>
                    <Card className="col-span-full"><CardContent className="pt-6"><Skeleton className="h-40 w-full" /></CardContent></Card>
                 </div>
            </div>
        </SiteLayout>
    )
  }
  
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const totalTasks = tasks.length;
  const totalCalories = foodLog.reduce((sum, item) => sum + item.calories, 0);


  return (
    <SiteLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Level</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userProfile.level}</div>
              <p className="text-xs text-muted-foreground">XP to next level: {userProfile.xpToNextLevel - userProfile.xp}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedTasks}/{totalTasks}</div>
              <p className="text-xs text-muted-foreground">{totalTasks > 0 ? `${Math.round((completedTasks/totalTasks)*100)}% of daily goal` : 'No tasks today'}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Plans</CardTitle>
              <Bot className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2 Active</div>
              <p className="text-xs text-muted-foreground">Workout & Meal Plan</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Food Scans</CardTitle>
              <Camera className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{foodLog.length} Today</div>
              <p className="text-xs text-muted-foreground">Total calories: {totalCalories} kcal</p>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4">
           <Card className="col-span-full">
            <CardHeader>
              <CardTitle>Today's Tasks</CardTitle>
              <CardDescription>
                Complete your tasks to gain XP.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {tasks.slice(0, 4).map((task, index) => (
                  <li key={index} className="flex items-center space-x-4">
                    <CheckCircle className={`h-6 w-6 ${task.status === 'completed' ? 'text-primary' : 'text-muted'}`} />
                    <div className="flex-grow">
                      <p className="font-medium">{task.title}</p>
                      <Badge variant={task.status === 'completed' ? "default" : "secondary"} className={`${task.status === 'completed' ? 'bg-primary/20 text-primary' : ''}`}>{task.difficulty}</Badge>
                    </div>
                    <Button variant="ghost" size="sm" disabled>
                      {task.status === 'completed' ? "Done" : "Pending"}
                    </Button>
                  </li>
                ))}
                 {tasks.length === 0 && (
                  <li className="text-center text-muted-foreground py-4">No tasks added for today.</li>
                )}
              </ul>
            </CardContent>
            <CardFooter>
              <Link href="/tasks" className="w-full">
                <Button variant="outline" className="w-full">
                  View All Tasks
                </Button>
              </Link>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
                <CardTitle>Pixel Zone</CardTitle>
                <CardDescription>Enter the arena for a fun pixelated workout experience.</CardDescription>
            </CardHeader>
            <CardFooter>
                <Link href="/pixel-zone" className="w-full">
                  <Button className="w-full">
                    Go to Pixel Zone
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
            </CardFooter>
          </Card>

          {latestCoach && (
            <Card className="col-span-full bg-primary/10 border-primary/50 shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-primary">
                        <Sparkles />
                        Our Newest Health Coach!
                    </CardTitle>
                    <CardDescription>Say hello to {latestCoach.fullName}, who just joined our team!</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm">
                        <strong>Specialty:</strong> {latestCoach.specialty}
                        <br/>
                        <span className="text-muted-foreground italic">"{latestCoach.bio}"</span>
                    </p>
                </CardContent>
                <CardFooter>
                    <Link href="/live-classes" className="w-full">
                        <Button>View Live Classes</Button>
                    </Link>
                </CardFooter>
            </Card>
          )}

          <Card className="col-span-full">
            <CardHeader>
                <CardTitle>Become a Health Coach</CardTitle>
                <CardDescription>Share your expertise and host live classes on our platform.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">Are you a certified health professional? Join our community of coaches and help users achieve their fitness goals.</p>
            </CardContent>
            <CardFooter>
                <Link href="/coach-registration" className="w-full">
                    <Button>Register as a Coach</Button>
                </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </SiteLayout>
  );
}
