using SportskiTerminiAPI.Models;

namespace SportskiTerminiAPI.Interfaces
{
    public interface IReservationRepository
    {
        Task<Reservation?> CreateWithConflictCheckAsync(string userId, int arenaId, DateTime startTime, DateTime endTime, string? cardLast4);
        Task<Reservation?> GetByIdAsync(int id);
        Task<Reservation?> GetConflictingReservationAsync(int arenaId, DateTime startTime, DateTime endTime);
        Task<IEnumerable<Reservation>> GetReservationsForUserAsync(string userId);
        Task UpdateAsync(Reservation reservation);
    }
}
