using SportskiTerminiAPI.DTOs;
using SportskiTerminiAPI.Models;

namespace SportskiTerminiAPI.Helpers
{
    public static class ReservationMappingHelper
    {
        public static ReservationDto ToReservationDto(Reservation reservation)
        {
            return new ReservationDto
            {
                Id = reservation.Id,
                ArenaId = reservation.ArenaId,
                ArenaName = reservation.Arena?.Name ?? string.Empty,
                UserId = reservation.UserId,
                StartTime = reservation.StartTime,
                EndTime = reservation.EndTime,
                DurationInHours = (reservation.EndTime - reservation.StartTime).TotalHours,
                Status = reservation.Status,
                CardLast4 = reservation.CardLast4,
                CreatedAt = reservation.CreatedAt,
                CancelledAt = reservation.CancelledAt
            };
        }
    }
}
