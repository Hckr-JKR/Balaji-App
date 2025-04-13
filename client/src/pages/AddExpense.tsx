import { useState } from "react";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addExpense } from "@/lib/firebase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

const AddExpense = () => {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { userData } = useAuth();
  const isAdmin = userData?.role === "admin";
  
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [description, setDescription] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Expense categories
  const categories = [
    { value: "electricity", label: t('electricity') },
    { value: "water", label: t('water') },
    { value: "maintenance", label: t('maintenance') },
    { value: "security", label: t('security') },
    { value: "cleaning", label: t('cleaning') },
    { value: "repairs", label: t('repairs') },
    { value: "others", label: t('others') }
  ];

  // Add expense mutation
  const addExpenseMutation = useMutation({
    mutationFn: async () => {
      if (!isAdmin) {
        throw new Error("Only admins can add expenses");
      }
      
      const expenseData = {
        title,
        amount: parseFloat(amount),
        category,
        date,
        description,
        createdBy: userData?.id,
        createdAt: new Date()
      };
      
      return await addExpense(expenseData, receiptFile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      
      toast({
        title: t('expenseAdded'),
        description: t('expenseAddedDesc'),
      });
      
      setLocation("/expenses");
    },
    onError: (error: Error) => {
      toast({
        title: t('expenseAddFailed'),
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addExpenseMutation.mutate();
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setReceiptFile(e.target.files[0]);
    }
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setReceiptFile(e.dataTransfer.files[0]);
    }
  };

  // Handle go back
  const handleGoBack = () => {
    setLocation("/expenses");
  };

  // Check if user is admin
  if (!isAdmin) {
    return (
      <div className="container mx-auto">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="icon" onClick={handleGoBack} className="mr-2">
            <span className="material-icons">arrow_back</span>
          </Button>
          <h2 className="text-xl font-bold">{t('addExpense')}</h2>
        </div>
        
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <span className="material-icons text-4xl text-gray-400 mb-2">lock</span>
            <p className="text-gray-500 dark:text-gray-400">{t('expensesAdminOnly')}</p>
            <Button variant="outline" className="mt-4" onClick={handleGoBack}>
              {t('goBack')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={handleGoBack} className="mr-2">
          <span className="material-icons">arrow_back</span>
        </Button>
        <h2 className="text-xl font-bold">{t('addExpense')}</h2>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expense-title">{t('expenseTitle')}</Label>
                <Input
                  id="expense-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t('expenseTitlePlaceholder')}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="expense-amount">{t('amount')}</Label>
                <Input
                  id="expense-amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="expense-category">{t('category')}</Label>
                <Select value={category} onValueChange={setCategory} required>
                  <SelectTrigger id="expense-category">
                    <SelectValue placeholder={t('selectCategory')} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="expense-date">{t('date')}</Label>
                <Input
                  id="expense-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <Label htmlFor="expense-description">{t('descriptionOptional')}</Label>
                <Textarea
                  id="expense-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t('expenseDescPlaceholder')}
                  rows={2}
                />
              </div>
              
              <div className="md:col-span-2">
                <Label htmlFor="receipt-upload">{t('uploadReceiptProof')}</Label>
                <div
                  className={`mt-1 flex justify-center px-6 py-4 border-2 border-dashed rounded-md ${
                    isDragging
                      ? "border-primary-500 bg-primary-50"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="space-y-1 text-center">
                    {receiptFile ? (
                      <div>
                        <span className="material-icons text-3xl text-primary-500 mb-2">description</span>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{receiptFile.name}</p>
                        <Button 
                          type="button" 
                          variant="link" 
                          size="sm" 
                          onClick={() => setReceiptFile(null)}
                        >
                          {t('remove')}
                        </Button>
                      </div>
                    ) : (
                      <>
                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className="flex text-sm text-gray-600 dark:text-gray-400">
                          <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 focus-within:outline-none">
                            <span>{t('uploadAFile')}</span>
                            <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*,.pdf" />
                          </label>
                          <p className="pl-1">{t('orDragAndDrop')}</p>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          PNG, JPG, PDF {t('upTo')} 10MB
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleGoBack}
                disabled={addExpenseMutation.isPending}
              >
                {t('cancel')}
              </Button>
              <Button 
                type="submit"
                disabled={addExpenseMutation.isPending}
              >
                {addExpenseMutation.isPending ? t('adding') : t('addExpense')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddExpense;
