export interface Database {
  connect: () => void;
  close: () => void;
}
