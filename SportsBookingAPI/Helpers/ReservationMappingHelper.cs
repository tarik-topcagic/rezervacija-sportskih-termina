using SportsBookingAPI.DTOs;
using SportsBookingAPI.Models;

namespace SportsBookingAPI.Helpers
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
                Username = reservation.User?.UserName ?? string.Empty,
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
