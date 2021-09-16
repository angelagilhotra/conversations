import axios from "axios";
import { ErrorBuilder, Error } from "interfaces";

export const errorBuilder: ErrorBuilder = (message, status, logData) => ({
  message,
  status,
  logData,
});
