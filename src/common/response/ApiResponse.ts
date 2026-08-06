export class ApiResponse {
  status: number;
  message: string;
  data?: any;
  success: boolean;

  constructor({
    status,
    message,
    data,
    success = true,
  }: {
    status: number;
    message: string;
    data?: any;
    success?: boolean;
  }) {
    this.status = status;
    this.message = message;
    this.data = data;
    this.success = success;
  }
}
