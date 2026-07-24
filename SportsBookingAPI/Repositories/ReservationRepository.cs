using System.Data;
using Microsoft.EntityFrameworkCore;
using SportsBookingAPI.Data;
using SportsBookingAPI.DTOs;
using SportsBookingAPI.Interfaces;
using SportsBookingAPI.Models;

namespace SportsBookingAPI.Repositories
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

        public async Task<IEnumerable<TimeRangeDto>> GetConfirmedReservationsForArenaOnDateAsync(int arenaId, DateTime dateUtc)
        {
            var dayStart = DateTime.SpecifyKind(dateUtc.Date, DateTimeKind.Utc);
            var dayEnd = dayStart.AddDays(1);

            return await _context.Reservations
                .Where(r => r.ArenaId == arenaId
                    && r.Status == ReservationStatus.Confirmed
                    && r.StartTime < dayEnd
                    && r.EndTime > dayStart)
                .Select(r => new TimeRangeDto
                {
                    StartTime = r.StartTime,
                    EndTime = r.EndTime
                })
                .ToListAsync();
        }

        public async Task<IEnumerable<Reservation>> GetConfirmedReservationsStartingBetweenAsync(DateTime fromUtc, DateTime toUtc)
        {
            return await _context.Reservations
                .Include(r => r.Arena)
                .Where(r => r.Status == ReservationStatus.Confirmed
                    && r.StartTime > fromUtc
                    && r.StartTime <= toUtc)
                .ToListAsync();
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

        public async Task<bool> ArenaHasReservationsAsync(int arenaId)
        {
            return await _context.Reservations.AnyAsync(r => r.ArenaId == arenaId);
        }

        public async Task<IEnumerable<Reservation>> GetAllReservationsAsync(int? arenaId, string? username, ReservationStatus? status)
        {
            var query = _context.Reservations
                .Include(r => r.Arena)
                .Include(r => r.User)
                .AsQueryable();

            if (arenaId.HasValue)
                query = query.Where(r => r.ArenaId == arenaId.Value);

            if (!string.IsNullOrWhiteSpace(username))
            {
                var normalizedUsername = username.Trim().ToLower();
                query = query.Where(r => r.User != null && r.User.UserName != null && r.User.UserName.ToLower().Contains(normalizedUsername));
            }

            if (status.HasValue)
                query = query.Where(r => r.Status == status.Value);

            return await query
                .OrderByDescending(r => r.StartTime)
                .ToListAsync();
        }
    }
}
