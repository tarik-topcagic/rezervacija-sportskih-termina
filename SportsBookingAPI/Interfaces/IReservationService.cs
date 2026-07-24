using SportsBookingAPI.DTOs;
using SportsBookingAPI.Models;
using SportsBookingAPI.Services;

namespace SportsBookingAPI.Interfaces
{
    public interface IReservationService
    {
        Task<ServiceResult> CreateReservationAsync(string userId, CreateReservationDto createReservationDto);
        Task<ServiceResult> CancelReservationAsync(string userId, int reservationId);
        Task<ServiceResult> GetMyReservationsAsync(string userId);
        Task<ServiceResult> GetAllReservationsForAdminAsync(int? arenaId, string? username, ReservationStatus? status);
        Task<ServiceResult> AdminCancelReservationAsync(int reservationId);
    }
}
