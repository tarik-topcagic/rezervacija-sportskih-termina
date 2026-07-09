using SportskiTerminiAPI.DTOs;
using SportskiTerminiAPI.Services;

namespace SportskiTerminiAPI.Interfaces
{
    public interface IReservationService
    {
        Task<ServiceResult> CreateReservationAsync(string userId, CreateReservationDto createReservationDto);
        Task<ServiceResult> CancelReservationAsync(string userId, int reservationId);
        Task<ServiceResult> GetMyReservationsAsync(string userId);
    }
}
