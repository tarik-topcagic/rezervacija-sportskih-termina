using Microsoft.EntityFrameworkCore;
using Npgsql;
using SportskiTerminiAPI.DTOs;
using SportskiTerminiAPI.Helpers;
using SportskiTerminiAPI.Interfaces;
using SportskiTerminiAPI.Models;

namespace SportskiTerminiAPI.Services
{
    public class ReservationService : IReservationService
    {
        private readonly IReservationRepository _reservationRepository;
        private readonly IArenaRepository _arenaRepository;

        public ReservationService(IReservationRepository reservationRepository, IArenaRepository arenaRepository)
        {
            _reservationRepository = reservationRepository;
            _arenaRepository = arenaRepository;
        }

        public async Task<ServiceResult> CreateReservationAsync(string userId, CreateReservationDto createReservationDto)
        {
            var arena = await _arenaRepository.GetArenaByIdAsync(createReservationDto.ArenaId);
            if (arena == null)
                return ServiceResult.NotFound("Arena not found");

            if (createReservationDto.StartTime <= DateTime.UtcNow)
                return ServiceResult.BadRequest("Cannot reserve a time slot in the past");

            var endTime = createReservationDto.StartTime.AddHours(createReservationDto.DurationInHours);

            var conflict = await _reservationRepository.GetConflictingReservationAsync(
                createReservationDto.ArenaId, createReservationDto.StartTime, endTime);
            if (conflict != null)
                return ServiceResult.BadRequest("This time slot is already reserved");

            // Simulate a payment processor's processing delay.
            await Task.Delay(Random.Shared.Next(1000, 2000));

            // Simulate a payment outcome: ~90% success, ~10% simulated decline.
            var paymentSucceeded = Random.Shared.Next(1, 101) <= 90;
            if (!paymentSucceeded)
                return ServiceResult.BadRequest(new { message = "Payment declined. Please try again." });

            try
            {
                var reservation = await _reservationRepository.CreateWithConflictCheckAsync(
                    userId, createReservationDto.ArenaId, createReservationDto.StartTime, endTime, createReservationDto.CardLast4);

                if (reservation == null)
                    return ServiceResult.BadRequest("This time slot is already reserved");

                reservation.Arena = arena;
                return ServiceResult.Ok(ReservationMappingHelper.ToReservationDto(reservation));
            }
            catch (DbUpdateException ex) when (IsUniqueViolation(ex))
            {
                return ServiceResult.BadRequest("This time slot is already reserved");
            }
            catch (PostgresException ex) when (ex.SqlState == PostgresErrorCodes.SerializationFailure)
            {
                return ServiceResult.BadRequest("This time slot is already reserved");
            }
        }

        private static bool IsUniqueViolation(DbUpdateException ex)
        {
            return ex.InnerException is PostgresException postgresException
                && postgresException.SqlState == PostgresErrorCodes.UniqueViolation;
        }

        public async Task<ServiceResult> CancelReservationAsync(string userId, int reservationId)
        {
            var reservation = await _reservationRepository.GetByIdAsync(reservationId);
            if (reservation == null)
                return ServiceResult.NotFound("Reservation not found");

            if (reservation.UserId != userId)
                return ServiceResult.Forbid("You can only cancel your own reservations");

            if (reservation.Status == ReservationStatus.Cancelled)
                return ServiceResult.BadRequest("This reservation is already cancelled");

            reservation.Status = ReservationStatus.Cancelled;
            reservation.CancelledAt = DateTime.UtcNow;
            await _reservationRepository.UpdateAsync(reservation);

            return ServiceResult.Ok(new { message = "Reservation cancelled successfully" });
        }

        public async Task<ServiceResult> GetMyReservationsAsync(string userId)
        {
            var reservations = await _reservationRepository.GetReservationsForUserAsync(userId);
            return ServiceResult.Ok(reservations.Select(ReservationMappingHelper.ToReservationDto));
        }
    }
}
