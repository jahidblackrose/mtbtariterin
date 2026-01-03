import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CreditCard, ArrowRight, AlertCircle } from "lucide-react";
import { BilingualText } from "@/components/BilingualText";

interface ExistingLoansStepProps {
  onNext: (data: any) => void;
  data: any;
}

export const ExistingLoansStep = ({ onNext, data }: ExistingLoansStepProps) => {
  const [formData, setFormData] = useState({
    hasExistingLoans: data.hasExistingLoans || false,
    existingLoans: data.existingLoans || []
  });

  const existingLoans = [
    {
      id: "LN001",
      bankName: "MTB Bank",
      loanType: "Personal Loan",
      amount: 150000,
      balance: 45000,
      monthlyEmi: 13500,
      status: "Active"
    }
  ];

  const handleNext = () => {
    onNext(formData);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
        <CreditCard className="w-6 h-6 text-primary" />
        <div>
          <h3 className="font-semibold">
            <BilingualText english="Existing Loan Information" bengali="বিদ্যমান ঋণের তথ্য" />
          </h3>
          <p className="text-sm text-muted-foreground">
            <BilingualText 
              english="Review your existing loans with MTB and other banks" 
              bengali="এমটিবি এবং অন্যান্য ব্যাংকের সাথে আপনার বিদ্যমান ঋণ পর্যালোচনা করুন" 
            />
          </p>
        </div>
      </div>

      {/* Existing Loans List */}
      {existingLoans.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium text-primary">
            <BilingualText english="Current Loans with MTB" bengali="এমটিবিতে বর্তমান ঋণ" />
          </h4>
          
          {existingLoans.map((loan) => (
            <div key={loan.id} className="p-4 rounded-lg border bg-card/50">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h5 className="font-semibold">Loan #{loan.id}</h5>
                    <Badge className="status-pending">{loan.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {loan.loanType} - {loan.bankName}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">
                    <BilingualText english="Loan Amount" bengali="ঋণের পরিমাণ" />
                  </p>
                  <p className="font-medium">৳{loan.amount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">
                    <BilingualText english="Balance" bengali="বকেয়া" />
                  </p>
                  <p className="font-medium">৳{loan.balance.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">
                    <BilingualText english="Monthly EMI" bengali="মাসিক ইএমআই" />
                  </p>
                  <p className="font-medium">৳{loan.monthlyEmi.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">
                    <BilingualText english="Status" bengali="অবস্থা" />
                  </p>
                  <p className="font-medium">{loan.status}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Separator />

      {/* No Additional Loans Option */}
      <div className="space-y-4">
        <h4 className="font-medium text-primary">
          <BilingualText english="Other Bank Loans" bengali="অন্যান্য ব্যাংকের ঋণ" />
        </h4>
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id="noOtherLoans"
            checked={!formData.hasExistingLoans}
            onCheckedChange={(checked) => setFormData(prev => ({ 
              ...prev, 
              hasExistingLoans: !checked 
            }))}
          />
          <label htmlFor="noOtherLoans" className="text-sm font-medium">
            <BilingualText 
              english="I don't have any loans with other banks" 
              bengali="আমার অন্য কোনো ব্যাংকের সাথে ঋণ নেই" 
            />
          </label>
        </div>
      </div>

      {/* Information Note */}
      <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-primary mb-1">
              <BilingualText english="Important Information" bengali="গুরুত্বপূর্ণ তথ্য" />
            </p>
            <p className="text-primary/80">
              <BilingualText 
                english="Your existing loan information helps us assess your eligibility and determine the best loan terms for you. All information will be verified through credit bureau reports." 
                bengali="আপনার বিদ্যমান ঋণের তথ্য আমাদের আপনার যোগ্যতা মূল্যায়ন এবং আপনার জন্য সর্বোত্তম ঋণের শর্তাবলী নির্ধারণ করতে সহায়তা করে। সমস্ত তথ্য ক্রেডিট ব্যুরো রিপোর্টের মাধ্যমে যাচাই করা হবে।" 
              />
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end">
        <Button onClick={handleNext} className="gradient-primary" size="lg">
          <BilingualText english="Save & Next" bengali="সংরক্ষণ ও পরবর্তী" />
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};
