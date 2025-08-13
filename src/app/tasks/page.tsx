
"use client";

import { useState } from "react";
import { SiteLayout } from "@/components/site-layout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserData } from "@/context/user-data";
import { Skeleton } from "@/components/ui/skeleton";
import { TaskForm } from "./task-form";
import type { Task } from "./task-form";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Edit, PlusCircle, Trash2 } from "lucide-react";

const getStatusBadge = (status: string) => {
    switch (status) {
        case "completed":
            return <Badge variant="default" className="bg-primary/80">Completed</Badge>;
        case "pending":
            return <Badge variant="outline">Pending</Badge>;
        case "missed":
        default:
            return <Badge variant="destructive">{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
    }
}

const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
        case "Easy":
            return <Badge className="bg-emerald-200 text-emerald-800 hover:bg-emerald-300 dark:bg-emerald-800 dark:text-emerald-200 dark:hover:bg-emerald-700">Easy</Badge>;
        case "Medium":
            return <Badge className="bg-yellow-200 text-yellow-800 hover:bg-yellow-300 dark:bg-yellow-800 dark:text-yellow-200 dark:hover:bg-yellow-700">Medium</Badge>;
        case "Hard":
            return <Badge className="bg-red-200 text-red-800 hover:bg-red-300 dark:bg-red-800 dark:text-red-200 dark:hover:bg-red-700">Hard</Badge>;
        default:
            return <Badge>{difficulty}</Badge>;
    }
}

export default function TasksPage() {
    const { tasks, isLoading, completeTask, deleteTask } = useUserData();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);

    const handleEdit = (task: Task) => {
        setSelectedTask(task);
        setIsFormOpen(true);
    };

    const handleAdd = () => {
        setSelectedTask(undefined);
        setIsFormOpen(true);
    };

    const pendingTasksCount = tasks.filter(t => t.status === 'pending').length;

    return (
        <SiteLayout>
            <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
                 <div className="flex items-center justify-between space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">Daily Tasks</h2>
                    <Button onClick={handleAdd}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add New Task
                    </Button>
                </div>
                 <p className="text-muted-foreground">
                    Manage your tasks for today. Complete them to earn XP!
                </p>

                <TaskForm 
                    isOpen={isFormOpen}
                    setIsOpen={setIsFormOpen}
                    task={selectedTask}
                />

                <Card>
                    <CardHeader>
                        <CardTitle>Task List</CardTitle>
                        {!isLoading && <CardDescription>{pendingTasksCount} tasks remaining for today.</CardDescription>}
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Task</TableHead>
                                    <TableHead>Difficulty</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>XP</TableHead>
                                    <TableHead className="text-right w-[200px]">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    Array.from({length: 5}).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell colSpan={5}>
                                                <Skeleton className="h-10 w-full" />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : tasks.length === 0 ? (
                                     <TableRow>
                                        <TableCell colSpan={5} className="text-center text-muted-foreground h-24">
                                            No tasks for today. Click "Add New Task" to get started.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    tasks.map((task) => (
                                        <TableRow key={task.id} className={task.status === 'completed' ? 'bg-muted/50' : ''}>
                                            <TableCell>
                                                <div className="font-medium">{task.title}</div>
                                                <div className="text-sm text-muted-foreground hidden md:inline">{task.description}</div>
                                            </TableCell>
                                            <TableCell>{getDifficultyBadge(task.difficulty)}</TableCell>
                                            <TableCell>{getStatusBadge(task.status)}</TableCell>
                                            <TableCell><Badge variant="secondary">{task.baseXp} XP</Badge></TableCell>
                                            <TableCell className="text-right space-x-2">
                                                <Button variant="outline" size="sm" disabled={task.status !== 'pending'} onClick={() => completeTask(task.id)}>
                                                    {task.status === 'pending' ? 'Complete' : 'Done'}
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleEdit(task)}>
                                                    <Edit className="h-4 w-4"/>
                                                </Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                                            <Trash2 className="h-4 w-4"/>
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This action cannot be undone. This will permanently delete the task "{task.title}".
                                                        </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => deleteTask(task.id)}>Delete</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </SiteLayout>
    );
}
