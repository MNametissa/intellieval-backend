export class ImportPreviewDto {
  valid: boolean;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  preview: ImportRowPreview[];
  errors: ImportError[];
}

export class ImportRowPreview {
  rowNumber: number;
  data: {
    name?: string;
    email?: string;
    role?: string;
    departmentId?: string;
    filiereId?: string;
    matricule?: string;
  };
  isValid: boolean;
  errors: string[];
}

export class ImportError {
  row: number;
  field?: string;
  message: string;
  severity: 'error' | 'warning';
}

export class ImportResultDto {
  success: boolean;
  totalProcessed: number;
  successCount: number;
  failureCount: number;
  created: ImportedUser[];
  failed: ImportFailure[];
  message: string;
}

export class ImportedUser {
  rowNumber: number;
  name: string;
  email: string;
  role: string;
  matricule?: string;
}

export class ImportFailure {
  rowNumber: number;
  data: any;
  errors: string[];
}
