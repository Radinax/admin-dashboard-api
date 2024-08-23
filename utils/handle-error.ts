import { HttpStatusCode } from "../types/http-code.enum";

export function handleError(statusCode: HttpStatusCode) {
  switch (statusCode) {
    case HttpStatusCode.NotFound:
      console.error("Error 404: Resource not found.");
      break;
    case HttpStatusCode.InternalServerError:
      console.error("Error 500: Internal server error.");
      break;
    case HttpStatusCode.BadRequest:
      console.error("Error 400: Bad request.");
      break;
    // Add more cases as needed
    default:
      console.error(`Error ${statusCode}: An unexpected error occurred.`);
  }
}
