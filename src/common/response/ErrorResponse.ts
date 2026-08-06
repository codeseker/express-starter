export class ErrorResponse {
  status: number;
  message: string;
  errors?: any;
  success: boolean;

  constructor({
    status,
    message,
    errors = null,
    success = false,
  }: {
    status: number;
    message: string;
    success?: boolean;
    errors?: any;
  }) {
    this.status = status;
    this.message = message;
    this.errors = errors;
    this.success = success;
  }
}
