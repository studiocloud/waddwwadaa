export interface ValidationHistory {
  id: string;
  fileName: string;
  status: string;
  resultUrl: string;
  createdAt: string;
  totalEmails: number;
  validEmails: number;
  invalidEmails: number;
}

export interface ValidationResult {
  isValid: boolean;
  details: string;
  checks?: {
    format: boolean;
    domain: boolean;
    mx: boolean;
    spf: boolean;
    smtp: boolean;
  };
}