from fastapi import Request, status
from fastapi.responses import JSONResponse
from app.core.logging import logger

class AppException(Exception):
    def __init__(self, message: str, code: str = "BAD_REQUEST", status_code: int = status.HTTP_400_BAD_REQUEST):
        self.message = message
        self.code = code
        self.status_code = status_code
        super().__init__(message)


class NotFoundError(AppException):
    def __init__(self, message: str = "Resource not found", code: str = "NOT_FOUND"):
        super().__init__(message=message, code=code, status_code=status.HTTP_404_NOT_FOUND)


class AuthenticationError(AppException):
    def __init__(self, message: str = "Invalid authentication credentials", code: str = "UNAUTHORIZED"):
        super().__init__(message=message, code=code, status_code=status.HTTP_401_UNAUTHORIZED)


class ForbiddenError(AppException):
    def __init__(self, message: str = "Access forbidden", code: str = "FORBIDDEN"):
        super().__init__(message=message, code=code, status_code=status.HTTP_403_FORBIDDEN)


class ConflictError(AppException):
    def __init__(self, message: str = "Resource conflict", code: str = "CONFLICT"):
        super().__init__(message=message, code=code, status_code=status.HTTP_409_CONFLICT)


async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
    logger.warning(f"AppException on {request.method} {request.url.path}: {exc.code} - {exc.message}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": {"code": exc.code, "message": exc.message}},
    )


async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.error(f"Unhandled Exception on {request.method} {request.url.path}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"error": {"code": "INTERNAL_SERVER_ERROR", "message": "An internal server error occurred"}},
    )
