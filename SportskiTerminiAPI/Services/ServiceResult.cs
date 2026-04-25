namespace SportskiTerminiAPI.Services
{
    public class ServiceResult
    {
        public int StatusCode { get; init; }
        public object? Payload { get; init; }

        public static ServiceResult Ok(object? payload = null)
        {
            return new ServiceResult
            {
                StatusCode = StatusCodes.Status200OK,
                Payload = payload
            };
        }

        public static ServiceResult BadRequest(object payload)
        {
            return new ServiceResult
            {
                StatusCode = StatusCodes.Status400BadRequest,
                Payload = payload
            };
        }

        public static ServiceResult NotFound(object? payload = null)
        {
            return new ServiceResult
            {
                StatusCode = StatusCodes.Status404NotFound,
                Payload = payload
            };
        }

        public static ServiceResult Forbid(object? payload = null)
        {
            return new ServiceResult
            {
                StatusCode = StatusCodes.Status403Forbidden,
                Payload = payload
            };
        }
    }
}
