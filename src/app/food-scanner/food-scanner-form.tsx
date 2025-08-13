
"use client";

import { useState, useRef, useEffect, type ChangeEvent } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { scanFood } from "@/ai/flows/scan-food";
import type { ScanFoodOutput } from "@/ai/schemas/scan-food";
import { useUserData } from "@/context/user-data";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Camera, Loader2, Save, Upload, AlertTriangle, Video, VideoOff } from "lucide-react";

const formSchema = z.object({
  photoDataUri: z.string().optional(),
  foodName: z.string().min(1, "Food name is required"),
  calories: z.coerce.number().min(0, "Calories must be positive"),
  protein: z.coerce.number().min(0, "Protein must be positive"),
  carb: z.coerce.number().min(0, "Carbs must be positive"),
  fat: z.coerce.number().min(0, "Fat must be positive"),
});

type FormValues = z.infer<typeof formSchema>;

export function FoodScannerForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { addFoodLog } = useUserData();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      foodName: "",
      calories: 0,
      protein: 0,
      carb: 0,
      fat: 0,
    }
  });

  useEffect(() => {
    return () => {
      // Cleanup: stop video stream when component unmounts
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);
  
  const enableCamera = async () => {
    if (!isCameraActive) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
            }
            setHasCameraPermission(true);
            setIsCameraActive(true);
        } catch (error) {
            console.error('Error accessing camera:', error);
            setHasCameraPermission(false);
            toast({
                variant: 'destructive',
                title: 'Camera Access Denied',
                description: 'Please enable camera permissions in your browser settings.',
            });
        }
    } else {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        setIsCameraActive(false);
    }
  };

  const processAndScanImage = async (dataUri: string) => {
    setIsLoading(true);
    setScannedData(dataUri);
    setValue("photoDataUri", dataUri);

    try {
      const result: ScanFoodOutput = await scanFood({ photoDataUri: dataUri });
      setValue("foodName", result.foodName);
      setValue("calories", result.calories);
      setValue("protein", result.macros.protein);
      setValue("carb", result.macros.carb);
      setValue("fat", result.macros.fat);
      toast({
        title: "Scan Successful",
        description: `Identified: ${result.foodName}`,
      });
    } catch (error) {
      console.error("Scan failed", error);
      toast({
        title: "Scan Failed",
        description: "Could not analyze the image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleCapture = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Flip the canvas context horizontally to match the preview
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(videoRef.current, 0, 0);
      }
      const dataUri = canvas.toDataURL("image/jpeg");
      processAndScanImage(dataUri);
      enableCamera(); // Turn off camera after capture
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUri = e.target?.result as string;
        processAndScanImage(dataUri);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSave: SubmitHandler<FormValues> = (data) => {
    addFoodLog(data);
    toast({
      title: "Meal Logged!",
      description: `${data.foodName} has been added to your log.`,
    });
    reset();
    setScannedData(null);
  };

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-6">
      <div className="space-y-4">
        <Label>Scan Food Image</Label>
        <div className="p-4 border-dashed border-2 rounded-lg space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <Button type="button" onClick={enableCamera} variant="outline">
                {isCameraActive ? <VideoOff className="mr-2"/> : <Video className="mr-2"/>}
                {isCameraActive ? "Stop Camera" : "Start Camera"}
              </Button>
              <Button type="button" onClick={() => fileInputRef.current?.click()} variant="outline">
                <Upload className="mr-2" />
                Upload Image
              </Button>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
            </div>

            {/* Always render video to avoid ref issues, hide/show with CSS */}
            <div className="space-y-2">
                <video 
                    ref={videoRef} 
                    className={cn(
                        "w-full aspect-video rounded-md bg-muted transform -scale-x-100",
                        !isCameraActive && "hidden" // Hide if not active
                    )} 
                    autoPlay 
                    muted 
                    playsInline 
                />
                {isCameraActive && (
                    <Button type="button" onClick={handleCapture} className="w-full" disabled={isLoading}>
                        {isLoading ? <Loader2 className="animate-spin mr-2"/> : <Camera className="mr-2"/>}
                        Capture & Scan
                    </Button>
                )}
            </div>

            {hasCameraPermission === false && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Camera Access Denied</AlertTitle>
                  <AlertDescription>
                    Please enable camera permissions in your browser settings to use this feature.
                  </AlertDescription>
                </Alert>
            )}

            {scannedData && !isLoading && (
              <div>
                <Label>Scanned Image Preview</Label>
                <img src={scannedData} alt="Scanned food" className="rounded-md mt-2 max-h-48 w-full object-cover" />
              </div>
            )}

             {isLoading && (
                <div className="flex items-center justify-center space-x-2 text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span>Analyzing your image...</span>
                </div>
            )}
        </div>
      </div>

      <div className="space-y-4 rounded-md border p-4">
        <h3 className="text-lg font-medium">Nutritional Information</h3>
        <div className="space-y-2">
            <Label htmlFor="foodName">Food Name</Label>
            <Input id="foodName" {...register("foodName")} />
            {errors.foodName && <p className="text-sm text-destructive">{errors.foodName.message}</p>}
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="calories">Calories (kcal)</Label>
                <Input id="calories" type="number" step="any" {...register("calories")} />
                {errors.calories && <p className="text-sm text-destructive">{errors.calories.message}</p>}
            </div>
             <div className="space-y-2">
                <Label htmlFor="protein">Protein (g)</Label>
                <Input id="protein" type="number" step="any" {...register("protein")} />
                {errors.protein && <p className="text-sm text-destructive">{errors.protein.message}</p>}
            </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="carb">Carbs (g)</Label>
                <Input id="carb" type="number" step="any" {...register("carb")} />
                {errors.carb && <p className="text-sm text-destructive">{errors.carb.message}</p>}
            </div>
             <div className="space-y-2">
                <Label htmlFor="fat">Fat (g)</Label>
                <Input id="fat" type="number" step="any" {...register("fat")} />
                {errors.fat && <p className="text-sm text-destructive">{errors.fat.message}</p>}
            </div>
        </div>
      </div>
      
      <Button type="submit" className="w-full" disabled={isLoading}>
        <Save className="h-4 w-4 mr-2" />
        Save to Log
      </Button>
    </form>
  );
}
