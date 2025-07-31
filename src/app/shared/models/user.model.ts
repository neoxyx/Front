export interface User {
  _id: string;
  name: string;
  email: string;
  createdAt: string | Date;
  token?: string; // Opcional para JWT
}
