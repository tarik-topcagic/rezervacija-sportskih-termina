using SportsBookingAPI.DTOs;
using SportsBookingAPI.Models;

namespace SportsBookingAPI.Interfaces
{
    public interface IReservationRepository
    {
        Task<Reservation?> CreateWithConflictCheckAsync(string userId, int arenaId, DateTime startTime, DateTime endTime, string? cardLast4);
        Task<IEnumerable<TimeRangeDto>> GetConfirmedReservationsForArenaOnDateAsync(int arenaId, DateTime dateUtc);
        Task<IEnumerable<Reservation>> GetConfirmedReservationsStartingBetweenAsync(DateTime fromUtc, DateTime toUtc);
        Task<Reservation?> GetByIdAsync(int id);
        Task<Reservation?> GetConflictingReservationAsync(int arenaId, DateTime startTime, DateTime endTime);
        Task<IEnumerable<Reservation>> GetReservationsForUserAsync(string userId);
        Task UpdateAsync(Reservation reservation);
        Task<bool> ArenaHasReservationsAsync(int arenaId);
        Task<IEnumerable<Reservation>> GetAllReservationsAsync(int? arenaId, string? username, ReservationStatus? status);
    }
}
