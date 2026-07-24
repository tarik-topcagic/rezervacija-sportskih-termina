using SportsBookingAPI.Models;

namespace SportsBookingAPI.Interfaces
{
    public interface IReservationNotificationService
    {
        Task CreateReservationReminderNotificationAsync(string userId, int reservationId, AppNotificationType reminderType);
    }
}
