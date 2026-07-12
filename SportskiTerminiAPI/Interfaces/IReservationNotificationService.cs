using SportskiTerminiAPI.Models;

namespace SportskiTerminiAPI.Interfaces
{
    public interface IReservationNotificationService
    {
        Task CreateReservationReminderNotificationAsync(string userId, int reservationId, AppNotificationType reminderType);
    }
}
