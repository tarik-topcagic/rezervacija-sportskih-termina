using System.Data;
using Microsoft.EntityFrameworkCore;
using SportskiTerminiAPI.Data;
using SportskiTerminiAPI.Interfaces;
using SportskiTerminiAPI.Models;

namespace SportskiTerminiAPI.Repositories
{
    public class ReservationRepository : IReservationRepository
    {
        private readonly ApplicationDBContext _context;

        public ReservationRepository(ApplicationDBContext context)
        {
            _context = context;
        }

        public async Task<Reservation?> CreateWithConflictCheckAsync(string userId, int arenaId, DateTime startTime, DateTime endTime, string? cardLast4)
        {
            var executionStrategy = _context.Database.CreateExecutionStrategy();
            Reservation? reservation = null;

            await executionStrategy.ExecuteAsync(async () =>
            {
                await using var transaction = await _context.Database.BeginTransactionAsync(IsolationLevel.Serializable);

                var hasConflict = await _context.Reservations.AnyAsync(r =>
                    r.ArenaId == arenaId
                    && r.Status == ReservationStatus.Confirmed
                    && r.StartTime < endTime
                    && r.EndTime > startTime);

                if (hasConflict)
                {
                    await transaction.RollbackAsync();
                    reservation = null;
                    return;
                }

                var newReservation = new Reservation
                {
                    ArenaId = arenaId,
                    UserId = userId,
                    StartTime = startTime,
                    EndTime = endTime,
                    Status = ReservationStatus.Confirmed,
                    CardLast4 = cardLast4,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Reservations.Add(newReservation);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                reservation = newReservation;
            });

            return reservation;
        }

        public async Task<Reservation?> GetByIdAsync(int id)
        {
            return await _context.Reservations
                .Include(r => r.Arena)
                .FirstOrDefaultAsync(r => r.Id == id);
        }

        public async Task<Reservation?> GetConflictingReservationAsync(int arenaId, DateTime startTime, DateTime endTime)
        {
            return await _context.Reservations
                .FirstOrDefaultAsync(r => r.ArenaId == arenaId
                    && r.Status == ReservationStatus.Confirmed
                    && r.StartTime < endTime
                    && r.EndTime > startTime);
        }

        public async Task<IEnumerable<Reservation>> GetReservationsForUserAsync(string userId)
        {
            return await _context.Reservations
                .Include(r => r.Arena)
                .Where(r => r.UserId == userId)
                .OrderByDescending(r => r.StartTime)
                .ToListAsync();
        }

        public async Task UpdateAsync(Reservation reservation)
        {
            _context.Reservations.Update(reservation);
            await _context.SaveChangesAsync();
        }
    }
}
