export interface ImportUserRow {
  type: string;
  prenom: string;
  nom: string;
  email: string;
  departement: string;
  filiere?: string;
  matieres?: string;
  matricule?: string;
}

export interface ImportError {
  line: number;
  email: string;
  error: string;
}

export class ImportUsersResultDto {
  success: number;
  failed: number;
  total: number;
  createdUsers: string[];
  errors: ImportError[];
}
