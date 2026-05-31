export interface Admin {
  id: number;
  email: string;
  password: string; // bcrypt hash - never exposed to client
  created_at: Date;
}
