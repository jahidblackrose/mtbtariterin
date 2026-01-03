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
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frameCountRef = useRef(0);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Start camera for real-time capture only (no file upload)
  const startCamera = useCallback(async () => {
    setVerificationStatus("requesting-camera");
    setErrorMessage("");

    // Check if getUserMedia is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setVerificationStatus("failed");
      setErrorMessage("Camera not supported on this device. Please use a device with camera access.");
      toast({
        title: "Camera Not Supported",
        description: "Your browser doesn't support camera access. Try using Chrome or Safari.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Request camera with mobile-friendly constraints
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: "user",
          width: { min: 320, ideal: 640, max: 1280 },
          height: { min: 240, ideal: 480, max: 720 },
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Handle video ready state for mobile
        const handleVideoReady = () => {
          if (videoRef.current) {
            videoRef.current.play()
              .then(() => {
                setVerificationStatus("camera-ready");
              })
              .catch((playError) => {
                console.error("Video play error:", playError);
                // Still set camera ready - user might need to interact
                setVerificationStatus("camera-ready");
              });
          }
        };

        videoRef.current.onloadedmetadata = handleVideoReady;
        videoRef.current.onloadeddata = handleVideoReady;
      }
    } catch (error: any) {
      console.error("Camera access error:", error);
      setVerificationStatus("failed");
      
      // Provide more specific error messages
      if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
        setErrorMessage("Camera permission denied. Please allow camera access in your browser settings.");
      } else if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") {
        setErrorMessage("No camera found. Please ensure your device has a camera.");
      } else if (error.name === "NotReadableError" || error.name === "TrackStartError") {
        setErrorMessage("Camera is in use by another app. Please close other apps using the camera.");
      } else if (error.name === "OverconstrainedError") {
        setErrorMessage("Camera settings not supported. Trying with default settings...");
        // Retry with basic constraints
        try {
          const basicStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
          streamRef.current = basicStream;
          if (videoRef.current) {
            videoRef.current.srcObject = basicStream;
            videoRef.current.onloadedmetadata = () => {
              videoRef.current?.play();
              setVerificationStatus("camera-ready");
            };
          }
          return;
        } catch {
          setErrorMessage("Unable to start camera. Please try a different browser.");
        }
      } else {
        setErrorMessage("Camera access failed. Please check permissions and try again.");
      }
      
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive",
      });
    }
  }, []);

  // Simulate liveness detection (in production, use actual face detection APIs)
  const performLivenessCheck = useCallback(async () => {
    setVerificationStatus("liveness-check");
    setLivenessStep("blink");
    setLivenessProgress(0);

    // Step 1: Blink detection
    await new Promise<void>((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setLivenessProgress(progress);
        frameCountRef.current++;
        
        // Simulate blink detection at ~40%
        if (progress >= 40 && !blinkDetected) {
          setBlinkDetected(true);
          toast({
            title: "Blink Detected ✓",
            description: "Good! Now turn your head slightly left.",
          });
          setLivenessStep("turn-left");
        }
        
        // Simulate left turn at ~70%
        if (progress >= 70 && blinkDetected && !movementDetected) {
          setMovementDetected(true);
          toast({
            title: "Movement Detected ✓",
            description: "Great! Processing verification...",
          });
          setLivenessStep("none");
        }
        
        if (progress >= 100) {
          clearInterval(interval);
          resolve();
        }
      }, 150);
    });

    // Capture final frame for verification
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        
        // Stop camera
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }

        setVerificationStatus("analyzing");

        try {
          // Call face verification API
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
            setErrorMessage("Face verification failed. Please ensure you're using a real-time camera and try again.");
          }
          toast({
            title: "Verification Failed",
            description: "Please try again with proper lighting and face positioning.",
            variant: "destructive",
          });
        }
      }
    }
  }, [blinkDetected, movementDetected]);

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
        return { english: "Turn your head slightly left", bengali: "আপনার মাথা একটু বাঁয়ে ঘোরান" };
      case "turn-right":
        return { english: "Turn your head slightly right", bengali: "আপনার মাথা একটু ডানে ঘোরান" };
      default:
        return { english: "Hold still...", bengali: "স্থির থাকুন..." };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
        <ShieldCheck className="w-6 h-6 text-primary" />
        <div>
          <h3 className="font-semibold text-foreground">
            <BilingualText english="Face Verification" bengali="মুখ যাচাইকরণ" />
          </h3>
          <p className="text-sm text-muted-foreground">
            <BilingualText 
              english="Real-time selfie with liveness detection" 
              bengali="লাইভনেস সনাক্তকরণ সহ রিয়েল-টাইম সেলফি" 
            />
          </p>
        </div>
      </div>

      {/* Anti-Fraud Warning */}
      <div className="flex items-start gap-3 p-4 bg-warning/10 border border-warning/20 rounded-lg">
        <Ban className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-warning mb-1">
            <BilingualText english="Security Notice" bengali="নিরাপত্তা বিজ্ঞপ্তি" />
          </p>
          <p className="text-muted-foreground">
            <BilingualText 
              english="Uploaded photos, screenshots, or static images are NOT accepted. Only real-time camera capture with face movement detection is allowed." 
              bengali="আপলোড করা ছবি, স্ক্রিনশট বা স্থির ছবি গ্রহণ করা হয় না। শুধুমাত্র রিয়েল-টাইম ক্যামেরা ক্যাপচার অনুমোদিত।" 
            />
          </p>
        </div>
      </div>

      {/* Verification Area */}
      <Card>
        <CardContent className="p-6 md:p-8">
          <div className="max-w-md mx-auto text-center">
            {/* Camera Preview */}
            <div className="relative mb-6">
              <div className={`w-64 h-80 mx-auto rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
                verificationStatus === "success" 
                  ? "border-success bg-success/5" 
                  : verificationStatus === "failed"
                  ? "border-destructive bg-destructive/5"
                  : verificationStatus === "liveness-check"
                  ? "border-primary bg-primary/5 animate-pulse"
                  : "border-border bg-muted/50"
              }`}>
                {/* Hidden video and canvas for capture */}
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted
                  webkit-playsinline="true"
                  className={`w-full h-full object-cover ${
                    verificationStatus === "camera-ready" || verificationStatus === "liveness-check"
                      ? "block"
                      : "hidden"
                  }`}
                  style={{ transform: "scaleX(-1)" }} // Mirror for selfie view
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* Idle State */}
                {verificationStatus === "idle" && (
                  <div className="flex flex-col items-center justify-center h-full p-6">
                    <Camera className="w-16 h-16 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground text-sm">
                      <BilingualText english="Click to start camera" bengali="ক্যামেরা শুরু করতে ক্লিক করুন" />
                    </p>
                  </div>
                )}

                {/* Requesting Camera */}
                {verificationStatus === "requesting-camera" && (
                  <div className="flex flex-col items-center justify-center h-full p-6">
                    <RefreshCw className="w-12 h-12 text-primary animate-spin mb-4" />
                    <p className="text-primary font-medium">
                      <BilingualText english="Starting camera..." bengali="ক্যামেরা শুরু হচ্ছে..." />
                    </p>
                  </div>
                )}

                {/* Analyzing */}
                {verificationStatus === "analyzing" && (
                  <div className="flex flex-col items-center justify-center h-full p-6">
                    <RefreshCw className="w-12 h-12 text-primary animate-spin mb-4" />
                    <p className="text-primary font-medium">
                      <BilingualText english="Analyzing face..." bengali="মুখ বিশ্লেষণ করা হচ্ছে..." />
                    </p>
                  </div>
                )}

                {/* Success */}
                {verificationStatus === "success" && (
                  <div className="flex flex-col items-center justify-center h-full p-6">
                    <div className="w-20 h-20 bg-success rounded-full flex items-center justify-center mb-4 success-pulse">
                      <CheckCircle className="w-10 h-10 text-white" />
                    </div>
                    <p className="text-success font-semibold">
                      <BilingualText english="Verification Successful!" bengali="যাচাইকরণ সফল!" />
                    </p>
                  </div>
                )}

                {/* Failed */}
                {verificationStatus === "failed" && (
                  <div className="flex flex-col items-center justify-center h-full p-6">
                    <div className="w-20 h-20 bg-destructive rounded-full flex items-center justify-center mb-4">
                      <AlertCircle className="w-10 h-10 text-white" />
                    </div>
                    <p className="text-destructive font-semibold mb-2">
                      <BilingualText english="Verification Failed" bengali="যাচাইকরণ ব্যর্থ" />
                    </p>
                    {errorMessage && (
                      <p className="text-destructive/80 text-xs px-4">{errorMessage}</p>
                    )}
                  </div>
                )}

                {/* Face guide overlay */}
                {(verificationStatus === "camera-ready" || verificationStatus === "liveness-check") && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className={`w-48 h-64 border-2 rounded-full transition-colors duration-300 ${
                      verificationStatus === "liveness-check" ? "border-primary" : "border-white/40"
                    }`} />
                  </div>
                )}
              </div>

              {/* Liveness Progress Bar */}
              {verificationStatus === "liveness-check" && (
                <div className="mt-4 px-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="w-4 h-4 text-primary animate-pulse" />
                    <span className="text-sm font-medium text-primary">
                      <BilingualText {...getLivenessInstruction()} />
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-150"
                      style={{ width: `${livenessProgress}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                    <span className={blinkDetected ? "text-success" : ""}>
                      {blinkDetected ? "✓ Blink" : "Blink"}
                    </span>
                    <span className={movementDetected ? "text-success" : ""}>
                      {movementDetected ? "✓ Movement" : "Movement"}
                    </span>
                    <span>Verify</span>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {verificationStatus === "idle" && (
                <Button 
                  onClick={startCamera}
                  className="gradient-primary" 
                  size="lg"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  <BilingualText english="Start Camera" bengali="ক্যামেরা শুরু করুন" />
                </Button>
              )}

              {verificationStatus === "camera-ready" && (
                <Button 
                  onClick={handleStartCapture}
                  className="gradient-primary" 
                  size="lg"
                >
                  <ShieldCheck className="w-5 h-5 mr-2" />
                  <BilingualText english="Start Liveness Check" bengali="লাইভনেস চেক শুরু করুন" />
                </Button>
              )}

              {verificationStatus === "liveness-check" && (
                <Button disabled className="bg-muted" size="lg">
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  <BilingualText english="Verifying..." bengali="যাচাই করা হচ্ছে..." />
                </Button>
              )}

              {verificationStatus === "failed" && (
                <Button 
                  onClick={retryVerification}
                  variant="outline" 
                  size="lg"
                >
                  <RefreshCw className="w-5 h-5 mr-2" />
                  <BilingualText english="Try Again" bengali="আবার চেষ্টা করুন" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4 text-center">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
            <Camera className="w-5 h-5 text-primary" />
          </div>
          <h4 className="font-semibold mb-2 text-foreground">
            <BilingualText english="Camera Only" bengali="শুধুমাত্র ক্যামেরা" />
          </h4>
          <p className="text-sm text-muted-foreground">
            <BilingualText 
              english="Use live camera, no uploads" 
              bengali="লাইভ ক্যামেরা ব্যবহার করুন, আপলোড নয়" 
            />
          </p>
        </Card>

        <Card className="p-4 text-center">
          <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-3">
            <Eye className="w-5 h-5 text-success" />
          </div>
          <h4 className="font-semibold mb-2 text-foreground">
            <BilingualText english="Follow Prompts" bengali="নির্দেশনা অনুসরণ করুন" />
          </h4>
          <p className="text-sm text-muted-foreground">
            <BilingualText 
              english="Blink and move when asked" 
              bengali="বলা হলে পলক ফেলুন এবং নড়াচড়া করুন" 
            />
          </p>
        </Card>

        <Card className="p-4 text-center">
          <div className="w-10 h-10 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-3">
            <ShieldCheck className="w-5 h-5 text-warning" />
          </div>
          <h4 className="font-semibold mb-2 text-foreground">
            <BilingualText english="Good Lighting" bengali="ভালো আলো" />
          </h4>
          <p className="text-sm text-muted-foreground">
            <BilingualText 
              english="Ensure clear, even lighting" 
              bengali="পরিষ্কার, সমান আলো নিশ্চিত করুন" 
            />
          </p>
        </Card>
      </div>

      {/* Next Button */}
      {verificationStatus === "success" && (
        <div className="flex justify-end animate-fade-in">
          <Button onClick={onNext} className="gradient-primary" size="lg">
            <BilingualText english="Continue" bengali="চালিয়ে যান" />
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
};
