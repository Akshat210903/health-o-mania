
"use client";

import { useState, useRef, useEffect, type ChangeEvent } from 'react';
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useUserData } from "@/context/user-data";
import { storage } from '@/lib/firebase';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

import { SiteLayout } from "@/components/site-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, Trash2, User as UserIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";


// --- Zod Schema for Name Form ---
const profileFormSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters." }).max(50, { message: "Name cannot be longer than 50 characters." }),
});
type ProfileFormValues = z.infer<typeof profileFormSchema>;


// --- Main Profile Page Component ---
export default function ProfilePage() {
    const { userProfile, updateUserProfile, isLoading: isUserLoading, currentUserCoachProfile, removeCoach } = useUserData();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const { register, handleSubmit, formState: { errors }, reset } = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: { name: userProfile?.name || "" }
    });

    useEffect(() => {
        if (userProfile) {
            reset({ name: userProfile.name });
        }
    }, [userProfile, reset]);

    const onNameSubmit: SubmitHandler<ProfileFormValues> = async (data) => {
        setIsSubmitting(true);
        await updateUserProfile({ name: data.name });
        setIsSubmitting(false);
    };

    if (isUserLoading || !userProfile) {
        return <ProfilePageSkeleton />;
    }

    return (
        <SiteLayout>
            <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
                <div className="space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">Profile Settings</h2>
                    <p className="text-muted-foreground">Manage your account settings and personal details.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 items-start">
                    <Card className="md:col-span-1">
                        <CardHeader>
                            <CardTitle>Display Picture</CardTitle>
                            <CardDescription>Your public avatar.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center gap-4">
                            <Avatar className="h-32 w-32">
                                <AvatarImage src={userProfile.photoURL || undefined} alt={userProfile.name} />
                                <AvatarFallback className="text-4xl">{userProfile.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <AvatarCropper />
                        </CardContent>
                    </Card>

                    <Card className="md:col-span-2">
                         <CardHeader>
                            <CardTitle>Personal Details</CardTitle>
                            <CardDescription>Update your public display name.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit(onNameSubmit)} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Display Name</Label>
                                    <Input id="name" {...register("name")} />
                                    {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" value={userProfile.email} disabled />
                                    <p className="text-xs text-muted-foreground">Email address cannot be changed.</p>
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="userCode">User Code</Label>
                                    <Input id="userCode" value={userProfile.userCode} disabled />
                                    <p className="text-xs text-muted-foreground">Your unique code for friending.</p>
                                </div>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                    Save Changes
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                    
                    {currentUserCoachProfile && (
                        <Card className="md:col-span-3">
                            <CardHeader>
                                <CardTitle>Coach Settings</CardTitle>
                                <CardDescription>Manage your health coach profile.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground mb-4">
                                    If you no longer wish to be listed as a health coach, you can remove your profile. This action is irreversible and you will need to apply again if you change your mind.
                                </p>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive">
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Remove Coach Profile
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. This will permanently delete your coach profile and remove you from our list of health coaches.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => removeCoach()}>
                                                Yes, remove my profile
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </SiteLayout>
    );
}

// --- Avatar Cropper Component ---
function AvatarCropper() {
    const { user, updateUserProfile } = useUserData();
    const [imgSrc, setImgSrc] = useState('');
    const [crop, setCrop] = useState<Crop>();
    const [completedCrop, setCompletedCrop] = useState<Crop>();
    const [isUploading, setIsUploading] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);
    const { toast } = useToast();

    const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setCrop(undefined); // Reset crop on new image
            const reader = new FileReader();
            reader.addEventListener('load', () => setImgSrc(reader.result?.toString() || ''));
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
        const { width, height } = e.currentTarget;
        const crop = centerCrop(
          makeAspectCrop({ unit: '%', width: 90 }, 1, width, height),
          width,
          height,
        );
        setCrop(crop);
    }
    
    async function handleUpload() {
        if (!completedCrop || !imgRef.current || !user) return;

        setIsUploading(true);
        try {
            const croppedImageBlob = await getCroppedImg(imgRef.current, completedCrop);
            const avatarRef = storageRef(storage, `profile_pictures/${user.uid}`);
            const snapshot = await uploadBytes(avatarRef, croppedImageBlob);
            const downloadURL = await getDownloadURL(snapshot.ref);

            await updateUserProfile({ photoURL: downloadURL });
            toast({ title: "Avatar updated successfully!" });
            setIsDialogOpen(false);
            setImgSrc('');

        } catch (error: any) {
            console.error("Avatar upload failed:", error);
            toast({ variant: "destructive", title: "Upload Failed", description: "Could not upload the new avatar." });
        } finally {
            setIsUploading(false);
        }
    }

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">Change Avatar</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Profile Picture</DialogTitle>
                    <DialogDescription>
                        Upload a new image and crop it to a square.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                   <Input type="file" accept="image/*" onChange={onFileChange} />
                   {imgSrc && (
                       <div className="flex justify-center">
                           <ReactCrop
                                crop={crop}
                                onChange={(_, percentCrop) => setCrop(percentCrop)}
                                onComplete={(c) => setCompletedCrop(c)}
                                aspect={1}
                                circularCrop
                                minHeight={100}
                           >
                               <img ref={imgRef} alt="Crop me" src={imgSrc} onLoad={onImageLoad} style={{ maxHeight: '70vh' }}/>
                           </ReactCrop>
                       </div>
                   )}
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => setIsDialogOpen(false)} disabled={isUploading}>Cancel</Button>
                    <Button onClick={handleUpload} disabled={isUploading || !completedCrop}>
                        {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4"/>}
                        Save
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}


// --- Cropping Utility Function ---
function getCroppedImg(image: HTMLImageElement, crop: Crop): Promise<Blob> {
  const canvas = document.createElement('canvas');
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  canvas.width = crop.width;
  canvas.height = crop.height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
      throw new Error('No 2d context');
  }

  const pixelRatio = window.devicePixelRatio;
  canvas.width = crop.width * pixelRatio;
  canvas.height = crop.height * pixelRatio;
  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  ctx.imageSmoothingQuality = 'high';

  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    crop.width,
    crop.height,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Canvas is empty'));
        return;
      }
      resolve(blob);
    }, 'image/jpeg');
  });
}

// --- Skeleton Component for Loading State ---
function ProfilePageSkeleton() {
    return (
        <SiteLayout>
            <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-96" />
                </div>
                 <div className="grid md:grid-cols-3 gap-8 items-start">
                    <Card className="md:col-span-1">
                        <CardHeader>
                             <Skeleton className="h-6 w-3/4" />
                             <Skeleton className="h-4 w-1/2" />
                        </CardHeader>
                        <CardContent className="flex flex-col items-center gap-4">
                           <Skeleton className="h-32 w-32 rounded-full" />
                           <Skeleton className="h-10 w-32" />
                        </CardContent>
                    </Card>
                    <Card className="md:col-span-2">
                         <CardHeader>
                             <Skeleton className="h-6 w-1/3" />
                             <Skeleton className="h-4 w-2/3" />
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                             <div className="space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                            <Skeleton className="h-10 w-36" />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </SiteLayout>
    );
}
