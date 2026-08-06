export class ApiResponse<TData = unknown> {
  status: number;
  message: string;
  data?: TData;
  success: boolean;

  constructor({
    status,
    message,
    data,
    success = true,
  }: {
    status: number;
    message: string;
    data?: TData;
    success?: boolean;
  }) {
    this.status = status;
    this.message = message;
    this.data = data;
    this.success = success;
  }
}
