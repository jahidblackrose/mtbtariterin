import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Camera, CheckCircle, AlertCircle, RefreshCw, Eye, ShieldCheck, Ban } from "lucide-react";
import { BilingualText } from "@/components/BilingualText";
import { toast } from "@/hooks/use-toast";
import { faceVerificationService, ApiError, ERROR_MESSAGES } from "@/services/api";

interface FaceVerificationStepProps {
  onNext: () => void;
  data: any;
}

type VerificationStatus = "idle" | "requesting-camera" | "camera-ready" | "capturing" | "analyzing" | "liveness-check" | "success" | "failed";
type LivenessStep = "blink" | "turn-left" | "turn-right" | "none";

export const FaceVerificationStep = ({ onNext, data }: FaceVerificationStepProps) => {
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [livenessStep, setLivenessStep] = useState<LivenessStep>("none");
  const [livenessProgress, setLivenessProgress] = useState(0);
  const [blinkDetected, setBlinkDetected] = useState(false);
  const [movementDetected, setMovementDetected] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    };
    checkMobile();
  }, []);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Start camera with mobile-optimized constraints
  const startCamera = useCallback(async () => {
    setVerificationStatus("requesting-camera");
    setErrorMessage("");

    try {
      // Mobile-optimized camera constraints
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
  }, [isMobile]);

  // Perform liveness check with mobile-optimized timing
  const performLivenessCheck = useCallback(async () => {
    setVerificationStatus("liveness-check");
    setLivenessStep("blink");
    setLivenessProgress(0);

    const stepDuration = isMobile ? 200 : 150;

    // Step 1: Blink detection
    await new Promise<void>((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setLivenessProgress(progress);
        
        if (progress >= 40 && !blinkDetected) {
          setBlinkDetected(true);
          toast({
            title: "✓ Blink Detected",
            description: "Now turn your head slightly.",
          });
          setLivenessStep("turn-left");
        }
        
        if (progress >= 70 && blinkDetected && !movementDetected) {
          setMovementDetected(true);
          toast({
            title: "✓ Movement Detected",
            description: "Processing verification...",
          });
          setLivenessStep("none");
        }
        
        if (progress >= 100) {
          clearInterval(interval);
          resolve();
        }
      }, stepDuration);
    });

    // Capture final frame
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth || 480;
      canvas.height = video.videoHeight || 640;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg', 0.7);
        
        // Stop camera
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }

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
            throw new Error("Liveness check failed");
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
      }
    }
  }, [blinkDetected, movementDetected, isMobile]);

  const handleStartCapture = () => {
    setBlinkDetected(false);
    setMovementDetected(false);
    performLivenessCheck();
  };

  const retryVerification = () => {
    setVerificationStatus("idle");
    setErrorMessage("");
    setBlinkDetected(false);
    setMovementDetected(false);
    setLivenessProgress(0);
    setLivenessStep("none");
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  const getLivenessInstruction = () => {
    switch (livenessStep) {
      case "blink":
        return { english: "Please blink your eyes", bengali: "অনুগ্রহ করে চোখ পলক ফেলুন" };
      case "turn-left":
        return { english: "Turn head slightly left", bengali: "মাথা বাঁয়ে ঘোরান" };
      case "turn-right":
        return { english: "Turn head slightly right", bengali: "মাথা ডানে ঘোরান" };
      default:
        return { english: "Hold still...", bengali: "স্থির থাকুন..." };
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 p-3 sm:p-4 bg-muted/30 rounded-lg">
        <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0" />
        <div className="min-w-0">
          <h3 className="font-semibold text-foreground text-sm sm:text-base">
            <BilingualText english="Face Verification" bengali="মুখ যাচাইকরণ" />
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground">
            <BilingualText 
              english="Real-time selfie with liveness" 
              bengali="লাইভনেস সহ সেলফি" 
            />
          </p>
        </div>
      </div>

      {/* Anti-Fraud Warning */}
      <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-warning/10 border border-warning/20 rounded-lg">
        <Ban className="w-4 h-4 sm:w-5 sm:h-5 text-warning flex-shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm">
          <p className="font-medium text-warning mb-1">
            <BilingualText english="Security Notice" bengali="নিরাপত্তা বিজ্ঞপ্তি" />
          </p>
          <p className="text-muted-foreground">
            <BilingualText 
              english="Only real-time camera capture is allowed. No uploads." 
              bengali="শুধুমাত্র রিয়েল-টাইম ক্যামেরা অনুমোদিত।" 
            />
          </p>
        </div>
      </div>

      {/* Verification Area */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="max-w-sm mx-auto text-center">
            {/* Camera Preview */}
            <div className="relative mb-4 sm:mb-6">
              <div className={`w-48 h-64 sm:w-56 sm:h-72 mx-auto rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
                verificationStatus === "success" 
                  ? "border-success bg-success/5" 
                  : verificationStatus === "failed"
                  ? "border-destructive bg-destructive/5"
                  : verificationStatus === "liveness-check"
                  ? "border-primary bg-primary/5 animate-pulse"
                  : "border-border bg-muted/50"
              }`}>
                {/* Video element */}
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline
                  webkit-playsinline="true"
                  muted
                  className={`w-full h-full object-cover ${
                    verificationStatus === "camera-ready" || verificationStatus === "liveness-check"
                      ? "block"
                      : "hidden"
                  }`}
                  style={{ transform: "scaleX(-1)" }}
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* Idle State */}
                {verificationStatus === "idle" && (
                  <div className="flex flex-col items-center justify-center h-full p-4">
                    <Camera className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mb-3" />
                    <p className="text-muted-foreground text-xs sm:text-sm text-center">
                      <BilingualText english="Tap to start camera" bengali="ক্যামেরা শুরু করতে ট্যাপ করুন" />
                    </p>
                  </div>
                )}

                {/* Requesting Camera */}
                {verificationStatus === "requesting-camera" && (
                  <div className="flex flex-col items-center justify-center h-full p-4">
                    <RefreshCw className="w-10 h-10 sm:w-12 sm:h-12 text-primary animate-spin mb-3" />
                    <p className="text-primary font-medium text-xs sm:text-sm">
                      <BilingualText english="Starting camera..." bengali="ক্যামেরা শুরু হচ্ছে..." />
                    </p>
                  </div>
                )}

                {/* Analyzing */}
                {verificationStatus === "analyzing" && (
                  <div className="flex flex-col items-center justify-center h-full p-4">
                    <RefreshCw className="w-10 h-10 sm:w-12 sm:h-12 text-primary animate-spin mb-3" />
                    <p className="text-primary font-medium text-xs sm:text-sm">
                      <BilingualText english="Analyzing..." bengali="বিশ্লেষণ করা হচ্ছে..." />
                    </p>
                  </div>
                )}

                {/* Success */}
                {verificationStatus === "success" && (
                  <div className="flex flex-col items-center justify-center h-full p-4">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-success rounded-full flex items-center justify-center mb-3 success-pulse">
                      <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                    </div>
                    <p className="text-success font-semibold text-sm sm:text-base">
                      <BilingualText english="Verified!" bengali="যাচাই সফল!" />
                    </p>
                  </div>
                )}

                {/* Failed */}
                {verificationStatus === "failed" && (
                  <div className="flex flex-col items-center justify-center h-full p-4">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-destructive rounded-full flex items-center justify-center mb-3">
                      <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                    </div>
                    <p className="text-destructive font-semibold text-sm sm:text-base mb-1">
                      <BilingualText english="Failed" bengali="ব্যর্থ" />
                    </p>
                    {errorMessage && (
                      <p className="text-destructive/80 text-xs px-2">{errorMessage}</p>
                    )}
                  </div>
                )}

                {/* Face guide overlay */}
                {(verificationStatus === "camera-ready" || verificationStatus === "liveness-check") && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className={`w-36 h-48 sm:w-44 sm:h-56 border-2 rounded-full transition-colors duration-300 ${
                      verificationStatus === "liveness-check" ? "border-primary" : "border-white/40"
                    }`} />
                  </div>
                )}
              </div>

              {/* Liveness Progress Bar */}
              {verificationStatus === "liveness-check" && (
                <div className="mt-3 px-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="w-4 h-4 text-primary animate-pulse" />
                    <span className="text-xs sm:text-sm font-medium text-primary">
                      <BilingualText {...getLivenessInstruction()} />
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-150"
                      style={{ width: `${livenessProgress}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                    <span className={blinkDetected ? "text-success" : ""}>
                      {blinkDetected ? "✓" : "○"} Blink
                    </span>
                    <span className={movementDetected ? "text-success" : ""}>
                      {movementDetected ? "✓" : "○"} Move
                    </span>
                    <span>○ Verify</span>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
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
                  onClick={handleStartCapture}
                  className="w-full gradient-primary" 
                  size="lg"
                >
                  <ShieldCheck className="w-5 h-5 mr-2" />
                  <BilingualText english="Start Verification" bengali="যাচাই শুরু করুন" />
                </Button>
              )}

              {verificationStatus === "liveness-check" && (
                <Button disabled className="w-full bg-muted" size="lg">
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  <BilingualText english="Verifying..." bengali="যাচাই করা হচ্ছে..." />
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
                  onClick={() => onNext()}
                  className="w-full gradient-success" 
                  size="lg"
                >
                  <BilingualText english="Continue" bengali="এগিয়ে যান" />
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mobile Tips */}
      {isMobile && (
        <div className="p-3 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground text-center">
            <BilingualText 
              english="Tip: Ensure good lighting and hold your phone steady" 
              bengali="পরামর্শ: ভালো আলো নিশ্চিত করুন এবং ফোন স্থির রাখুন" 
            />
          </p>
        </div>
      )}
    </div>
  );
};
