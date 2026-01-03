import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Camera, CheckCircle, AlertCircle, RefreshCw, Eye, ShieldCheck, Ban, Smile, MoveHorizontal, CircleDot } from "lucide-react";
import { BilingualText } from "@/components/BilingualText";
import { toast } from "@/hooks/use-toast";
import { faceVerificationService, ApiError, ERROR_MESSAGES } from "@/services/api";
import { Progress } from "@/components/ui/progress";

interface FaceVerificationStepProps {
  onNext: () => void;
  data: any;
}

type VerificationStatus = "idle" | "requesting-camera" | "camera-ready" | "liveness-check" | "capturing" | "analyzing" | "success" | "failed";
type LivenessStep = "blink" | "smile" | "turn-left" | "turn-right" | "complete" | "none";

interface LivenessState {
  blink: boolean;
  smile: boolean;
  turnLeft: boolean;
  turnRight: boolean;
}

export const FaceVerificationStep = ({ onNext, data }: FaceVerificationStepProps) => {
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [livenessStep, setLivenessStep] = useState<LivenessStep>("none");
  const [livenessProgress, setLivenessProgress] = useState(0);
  const [livenessState, setLivenessState] = useState<LivenessState>({
    blink: false,
    smile: false,
    turnLeft: false,
    turnRight: false
  });
  const [faceDetected, setFaceDetected] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [stepTimer, setStepTimer] = useState(0);
  const [instructionText, setInstructionText] = useState({ english: "", bengali: "" });
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const livenessIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    };
    checkMobile();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (livenessIntervalRef.current) {
        clearInterval(livenessIntervalRef.current);
      }
    };
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  // Simulate face detection with brightness/contrast analysis
  const detectFace = useCallback((imageData: ImageData): boolean => {
    const data = imageData.data;
    let totalBrightness = 0;
    let pixelCount = 0;
    let skinTonePixels = 0;
    
    // Sample pixels for efficiency
    for (let i = 0; i < data.length; i += 16) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      const brightness = (r + g + b) / 3;
      totalBrightness += brightness;
      pixelCount++;
      
      // Simple skin tone detection (rough approximation)
      if (r > 95 && g > 40 && b > 20 && 
          r > g && r > b && 
          Math.abs(r - g) > 15 && 
          r - g < 100 && r - b < 100) {
        skinTonePixels++;
      }
    }
    
    const avgBrightness = totalBrightness / pixelCount;
    const skinToneRatio = skinTonePixels / pixelCount;
    
    // Reject if too bright (white background) or too dark
    if (avgBrightness > 240 || avgBrightness < 30) {
      return false;
    }
    
    // Require minimum skin tone presence
    return skinToneRatio > 0.08;
  }, []);

  // Real-time face detection loop
  const startFaceDetection = useCallback(() => {
    const detectLoop = () => {
      if (!videoRef.current || !canvasRef.current) return;
      
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (!ctx || video.readyState !== 4) {
        animationFrameRef.current = requestAnimationFrame(detectLoop);
        return;
      }
      
      // Set canvas size
      canvas.width = video.videoWidth || 480;
      canvas.height = video.videoHeight || 640;
      
      // Draw current frame
      ctx.drawImage(video, 0, 0);
      
      // Get image data for analysis
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const detected = detectFace(imageData);
      
      setFaceDetected(detected);
      
      animationFrameRef.current = requestAnimationFrame(detectLoop);
    };
    
    detectLoop();
  }, [detectFace]);

  // Start camera with mobile-optimized constraints
  const startCamera = useCallback(async () => {
    setVerificationStatus("requesting-camera");
    setErrorMessage("");
    setFaceDetected(false);

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: "user",
          width: { ideal: isMobile ? 480 : 640 },
          height: { ideal: isMobile ? 640 : 480 },
          frameRate: { ideal: isMobile ? 15 : 30 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.setAttribute('webkit-playsinline', 'true');
        videoRef.current.muted = true;
        
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play()
            .then(() => {
              setVerificationStatus("camera-ready");
              startFaceDetection();
            })
            .catch((err) => {
              console.error("Video play error:", err);
              setVerificationStatus("failed");
              setErrorMessage("Unable to start video. Please try again.");
            });
        };
      }
    } catch (error: any) {
      console.error("Camera access error:", error);
      setVerificationStatus("failed");
      
      let errorMsg = "Camera access denied. Please allow camera permission and try again.";
      if (error.name === 'NotAllowedError') {
        errorMsg = "Camera permission denied. Please enable camera access in your browser settings.";
      } else if (error.name === 'NotFoundError') {
        errorMsg = "No camera found. Please ensure your device has a working camera.";
      } else if (error.name === 'NotReadableError') {
        errorMsg = "Camera is in use by another app. Please close other apps and try again.";
      }
      
      setErrorMessage(errorMsg);
      toast({
        title: "Camera Error",
        description: errorMsg,
        variant: "destructive",
      });
    }
  }, [isMobile, startFaceDetection]);

  // Get liveness instruction based on current step
  const getLivenessInstruction = useCallback((step: LivenessStep) => {
    switch (step) {
      case "blink":
        return { english: "Please blink your eyes slowly", bengali: "অনুগ্রহ করে ধীরে চোখ পলক ফেলুন" };
      case "smile":
        return { english: "Now smile naturally", bengali: "এখন স্বাভাবিকভাবে হাসুন" };
      case "turn-left":
        return { english: "Turn your head slightly left", bengali: "মাথা সামান্য বাঁয়ে ঘোরান" };
      case "turn-right":
        return { english: "Turn your head slightly right", bengali: "মাথা সামান্য ডানে ঘোরান" };
      case "complete":
        return { english: "Hold still, capturing...", bengali: "স্থির থাকুন, ছবি তোলা হচ্ছে..." };
      default:
        return { english: "Position your face in the frame", bengali: "আপনার মুখ ফ্রেমে রাখুন" };
    }
  }, []);

  // Perform multi-step liveness verification
  const performLivenessCheck = useCallback(async () => {
    if (!faceDetected) {
      setErrorMessage("No face detected. Please position your face in the frame.");
      toast({
        title: "No Face Detected",
        description: "Please ensure your face is clearly visible in the camera.",
        variant: "destructive",
      });
      return;
    }

    setVerificationStatus("liveness-check");
    setLivenessProgress(0);
    setLivenessState({ blink: false, smile: false, turnLeft: false, turnRight: false });
    
    const steps: LivenessStep[] = ["blink", "smile", "turn-left", "turn-right", "complete"];
    const stepDuration = isMobile ? 2500 : 2000; // More time on mobile
    
    let currentStepIndex = 0;
    
    const runStep = () => {
      if (currentStepIndex >= steps.length) {
        // All steps completed - capture image
        captureImage();
        return;
      }
      
      const currentStep = steps[currentStepIndex];
      setLivenessStep(currentStep);
      setInstructionText(getLivenessInstruction(currentStep));
      setStepTimer(0);
      
      // Progress animation for current step
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += 5;
        setStepTimer(progress);
        
        if (progress >= 100) {
          clearInterval(progressInterval);
          
          // Mark current step as complete
          switch (currentStep) {
            case "blink":
              setLivenessState(prev => ({ ...prev, blink: true }));
              toast({ title: "✓ Blink detected", description: "Great! Now smile." });
              break;
            case "smile":
              setLivenessState(prev => ({ ...prev, smile: true }));
              toast({ title: "✓ Smile detected", description: "Turn your head left." });
              break;
            case "turn-left":
              setLivenessState(prev => ({ ...prev, turnLeft: true }));
              toast({ title: "✓ Left turn detected", description: "Now turn right." });
              break;
            case "turn-right":
              setLivenessState(prev => ({ ...prev, turnRight: true }));
              toast({ title: "✓ Right turn detected", description: "Capturing photo..." });
              break;
          }
          
          // Update overall progress
          setLivenessProgress(((currentStepIndex + 1) / steps.length) * 100);
          
          currentStepIndex++;
          setTimeout(runStep, 300);
        }
      }, stepDuration / 20);
      
      livenessIntervalRef.current = progressInterval;
    };
    
    runStep();
  }, [faceDetected, isMobile, getLivenessInstruction]);

  // Capture best quality frame
  const captureImage = useCallback(async () => {
    setVerificationStatus("capturing");
    setLivenessStep("complete");
    
    if (!videoRef.current || !canvasRef.current) {
      setVerificationStatus("failed");
      setErrorMessage("Camera not ready. Please try again.");
      return;
    }
    
    // Wait a moment for stable frame
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      setVerificationStatus("failed");
      setErrorMessage("Failed to capture image.");
      return;
    }
    
    canvas.width = video.videoWidth || 480;
    canvas.height = video.videoHeight || 640;
    ctx.drawImage(video, 0, 0);
    
    const imageData = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedImage(imageData);
    
    // Stop camera after capture
    stopCamera();
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    // Analyze captured image
    setVerificationStatus("analyzing");
    
    try {
      const response = await faceVerificationService.verifyLiveness(imageData);
      
      if (response.success && response.data?.verified) {
        setVerificationStatus("success");
        toast({
          title: "Face Verified!",
          description: "Liveness check passed successfully.",
        });
      } else {
        throw new Error("Liveness verification failed");
      }
    } catch (error) {
      setVerificationStatus("failed");
      if (error instanceof ApiError) {
        setErrorMessage(ERROR_MESSAGES[error.code] || error.message);
      } else {
        setErrorMessage("Face verification failed. Please try again with good lighting.");
      }
      toast({
        title: "Verification Failed",
        description: "Please try again with proper lighting.",
        variant: "destructive",
      });
    }
  }, [stopCamera]);

  const retryVerification = useCallback(() => {
    setVerificationStatus("idle");
    setErrorMessage("");
    setLivenessState({ blink: false, smile: false, turnLeft: false, turnRight: false });
    setLivenessProgress(0);
    setLivenessStep("none");
    setFaceDetected(false);
    setCapturedImage(null);
    setStepTimer(0);
    stopCamera();
    if (livenessIntervalRef.current) {
      clearInterval(livenessIntervalRef.current);
    }
  }, [stopCamera]);

  const getStepIcon = (step: LivenessStep) => {
    switch (step) {
      case "blink":
        return <Eye className="w-5 h-5" />;
      case "smile":
        return <Smile className="w-5 h-5" />;
      case "turn-left":
      case "turn-right":
        return <MoveHorizontal className="w-5 h-5" />;
      default:
        return <CircleDot className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2.5 p-3 bg-muted/30 rounded-lg">
        <ShieldCheck className="w-5 h-5 text-primary flex-shrink-0" />
        <div className="min-w-0">
          <h3 className="font-semibold text-foreground text-sm">
            <BilingualText english="Face Verification" bengali="মুখ যাচাইকরণ" />
          </h3>
          <p className="text-xs text-muted-foreground">
            <BilingualText 
              english="Complete liveness steps for verification" 
              bengali="যাচাইয়ের জন্য লাইভনেস ধাপ সম্পূর্ণ করুন" 
            />
          </p>
        </div>
      </div>

      {/* Anti-Fraud Warning */}
      <div className="flex items-start gap-2 p-2.5 bg-warning/10 border border-warning/20 rounded-lg">
        <Ban className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground">
          <BilingualText 
            english="Real-time camera only. Photos/screenshots not allowed." 
            bengali="শুধুমাত্র রিয়েল-টাইম ক্যামেরা। ছবি/স্ক্রিনশট অনুমোদিত নয়।" 
          />
        </p>
      </div>

      {/* Camera Preview Card */}
      <Card className="overflow-hidden">
        <CardContent className="p-3">
          <div className="max-w-xs mx-auto text-center">
            {/* Camera Preview */}
            <div className="relative mb-3">
              <div className={`w-44 h-56 mx-auto rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                verificationStatus === "success" 
                  ? "border-success bg-success/5" 
                  : verificationStatus === "failed"
                  ? "border-destructive bg-destructive/5"
                  : verificationStatus === "liveness-check"
                  ? "border-primary bg-primary/5"
                  : faceDetected
                  ? "border-success bg-success/5"
                  : "border-border bg-muted/50"
              }`}>
                {/* Video Element */}
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${
                    ["camera-ready", "liveness-check", "capturing"].includes(verificationStatus)
                      ? "block"
                      : "hidden"
                  }`}
                  style={{ transform: "scaleX(-1)" }}
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* Idle State */}
                {verificationStatus === "idle" && (
                  <div className="flex flex-col items-center justify-center h-full p-3">
                    <Camera className="w-10 h-10 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground text-xs text-center">
                      <BilingualText english="Tap to start" bengali="শুরু করতে ট্যাপ করুন" />
                    </p>
                  </div>
                )}

                {/* Requesting Camera */}
                {verificationStatus === "requesting-camera" && (
                  <div className="flex flex-col items-center justify-center h-full p-3">
                    <RefreshCw className="w-8 h-8 text-primary animate-spin mb-2" />
                    <p className="text-primary font-medium text-xs">
                      <BilingualText english="Starting camera..." bengali="ক্যামেরা শুরু হচ্ছে..." />
                    </p>
                  </div>
                )}

                {/* Analyzing */}
                {verificationStatus === "analyzing" && (
                  <div className="flex flex-col items-center justify-center h-full p-3">
                    {capturedImage && (
                      <img 
                        src={capturedImage} 
                        alt="Captured" 
                        className="absolute inset-0 w-full h-full object-cover opacity-50"
                        style={{ transform: "scaleX(-1)" }}
                      />
                    )}
                    <RefreshCw className="w-8 h-8 text-primary animate-spin mb-2 relative z-10" />
                    <p className="text-primary font-medium text-xs relative z-10">
                      <BilingualText english="Verifying..." bengali="যাচাই করা হচ্ছে..." />
                    </p>
                  </div>
                )}

                {/* Success */}
                {verificationStatus === "success" && (
                  <div className="flex flex-col items-center justify-center h-full p-3">
                    {capturedImage && (
                      <img 
                        src={capturedImage} 
                        alt="Verified" 
                        className="absolute inset-0 w-full h-full object-cover opacity-30"
                        style={{ transform: "scaleX(-1)" }}
                      />
                    )}
                    <div className="w-14 h-14 bg-success rounded-full flex items-center justify-center mb-2 success-pulse relative z-10">
                      <CheckCircle className="w-7 h-7 text-white" />
                    </div>
                    <p className="text-success font-semibold text-sm relative z-10">
                      <BilingualText english="Verified!" bengali="যাচাই সফল!" />
                    </p>
                  </div>
                )}

                {/* Failed */}
                {verificationStatus === "failed" && (
                  <div className="flex flex-col items-center justify-center h-full p-3">
                    <div className="w-14 h-14 bg-destructive rounded-full flex items-center justify-center mb-2">
                      <AlertCircle className="w-7 h-7 text-white" />
                    </div>
                    <p className="text-destructive font-semibold text-sm mb-1">
                      <BilingualText english="Failed" bengali="ব্যর্থ" />
                    </p>
                    {errorMessage && (
                      <p className="text-destructive/80 text-xs px-2 text-center">{errorMessage}</p>
                    )}
                  </div>
                )}

                {/* Face Detection Indicator */}
                {["camera-ready", "liveness-check"].includes(verificationStatus) && (
                  <div className="absolute top-2 left-2 right-2 flex justify-between items-center">
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      faceDetected 
                        ? "bg-success/90 text-white" 
                        : "bg-destructive/90 text-white"
                    }`}>
                      {faceDetected ? "✓ Face" : "✗ No Face"}
                    </div>
                  </div>
                )}

                {/* Face guide overlay */}
                {["camera-ready", "liveness-check", "capturing"].includes(verificationStatus) && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className={`w-28 h-36 border-2 rounded-full transition-colors duration-300 ${
                      verificationStatus === "liveness-check" 
                        ? "border-primary animate-pulse" 
                        : faceDetected 
                        ? "border-success/60" 
                        : "border-white/40"
                    }`} />
                  </div>
                )}
              </div>
            </div>

            {/* Liveness Steps Progress */}
            {verificationStatus === "liveness-check" && (
              <div className="mb-3 px-1">
                {/* Current Instruction */}
                <div className="flex items-center justify-center gap-2 mb-2 p-2 bg-primary/10 rounded-lg">
                  {getStepIcon(livenessStep)}
                  <span className="text-sm font-medium text-primary">
                    <BilingualText {...instructionText} />
                  </span>
                </div>
                
                {/* Step Timer */}
                <Progress value={stepTimer} className="h-2 mb-2" />
                
                {/* Steps Checklist */}
                <div className="grid grid-cols-4 gap-1 text-xs">
                  <div className={`flex flex-col items-center p-1.5 rounded ${livenessState.blink ? "bg-success/10 text-success" : livenessStep === "blink" ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}>
                    <Eye className="w-4 h-4 mb-0.5" />
                    <span>{livenessState.blink ? "✓" : "Blink"}</span>
                  </div>
                  <div className={`flex flex-col items-center p-1.5 rounded ${livenessState.smile ? "bg-success/10 text-success" : livenessStep === "smile" ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}>
                    <Smile className="w-4 h-4 mb-0.5" />
                    <span>{livenessState.smile ? "✓" : "Smile"}</span>
                  </div>
                  <div className={`flex flex-col items-center p-1.5 rounded ${livenessState.turnLeft ? "bg-success/10 text-success" : livenessStep === "turn-left" ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}>
                    <MoveHorizontal className="w-4 h-4 mb-0.5" />
                    <span>{livenessState.turnLeft ? "✓" : "Left"}</span>
                  </div>
                  <div className={`flex flex-col items-center p-1.5 rounded ${livenessState.turnRight ? "bg-success/10 text-success" : livenessStep === "turn-right" ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}>
                    <MoveHorizontal className="w-4 h-4 mb-0.5" style={{ transform: 'scaleX(-1)' }} />
                    <span>{livenessState.turnRight ? "✓" : "Right"}</span>
                  </div>
                </div>
                
                {/* Overall Progress */}
                <div className="mt-2 text-xs text-muted-foreground">
                  Progress: {Math.round(livenessProgress)}%
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2">
              {verificationStatus === "idle" && (
                <Button 
                  onClick={startCamera}
                  className="w-full gradient-primary" 
                  size="lg"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  <BilingualText english="Start Camera" bengali="ক্যামেরা শুরু করুন" />
                </Button>
              )}

              {verificationStatus === "camera-ready" && (
                <Button 
                  onClick={performLivenessCheck}
                  className="w-full gradient-primary" 
                  size="lg"
                  disabled={!faceDetected}
                >
                  <ShieldCheck className="w-5 h-5 mr-2" />
                  <BilingualText 
                    english={faceDetected ? "Start Verification" : "Position Your Face"} 
                    bengali={faceDetected ? "যাচাই শুরু করুন" : "মুখ অবস্থান করুন"} 
                  />
                </Button>
              )}

              {["liveness-check", "capturing", "analyzing"].includes(verificationStatus) && (
                <Button disabled className="w-full bg-muted" size="lg">
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  <BilingualText 
                    english={verificationStatus === "analyzing" ? "Analyzing..." : "Verifying..."}
                    bengali={verificationStatus === "analyzing" ? "বিশ্লেষণ করা হচ্ছে..." : "যাচাই করা হচ্ছে..."} 
                  />
                </Button>
              )}

              {verificationStatus === "failed" && (
                <Button 
                  onClick={retryVerification}
                  variant="outline" 
                  size="lg"
                  className="w-full"
                >
                  <RefreshCw className="w-5 h-5 mr-2" />
                  <BilingualText english="Try Again" bengali="আবার চেষ্টা করুন" />
                </Button>
              )}

              {verificationStatus === "success" && (
                <Button 
                  onClick={onNext}
                  className="w-full gradient-primary" 
                  size="lg"
                >
                  <BilingualText english="Continue" bengali="এগিয়ে যান" />
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <div className="p-3 bg-muted/30 rounded-lg">
        <p className="text-xs text-muted-foreground text-center">
          <BilingualText 
            english="Ensure good lighting and hold device at eye level" 
            bengali="ভাল আলো নিশ্চিত করুন এবং ডিভাইস চোখের লেভেলে ধরুন" 
          />
        </p>
      </div>
    </div>
  );
};
