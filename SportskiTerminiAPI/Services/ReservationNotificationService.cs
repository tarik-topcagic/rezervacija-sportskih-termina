using Microsoft.AspNetCore.SignalR;
using SportskiTerminiAPI.DTOs;
using SportskiTerminiAPI.Hubs;
using SportskiTerminiAPI.Interfaces;
using SportskiTerminiAPI.Models;

namespace SportskiTerminiAPI.Services
{
    public class ReservationNotificationService : IReservationNotificationService
    {
        private readonly INotificationRepository _notificationRepository;
        private readonly IHubContext<SystemNotificationHub> _systemNotificationHubContext;

        public ReservationNotificationService(
            INotificationRepository notificationRepository,
            IHubContext<SystemNotificationHub> systemNotificationHubContext)
        {
            _notificationRepository = notificationRepository;
            _systemNotificationHubContext = systemNotificationHubContext;
        }

        public async Task CreateReservationReminderNotificationAsync(string userId, int reservationId, AppNotificationType reminderType)
        {
            var notification = await _notificationRepository.AddNotificationAsync(new AppNotification
            {
                UserId = userId,
                ReservationId = reservationId,
                Type = reminderType,
                CreatedAt = DateTime.UtcNow
            });

            await BroadcastSystemNotificationAsync(notification);
        }

        private async Task BroadcastSystemNotificationAsync(AppNotification notification)
        {
            await _systemNotificationHubContext.Clients
                .User(notification.UserId)
                .SendAsync("ReceiveSystemNotification", ToDto(notification));
        }

        private static NotificationDto ToDto(AppNotification notification)
        {
            return new NotificationDto
            {
                Id = notification.Id,
                Type = notification.Type,
                UserId = notification.UserId,
                ReservationId = notification.ReservationId,
                ArenaId = notification.Reservation?.ArenaId,
                ArenaName = notification.Reservation?.Arena?.Name,
                ReservationStartTime = notification.Reservation == null
                    ? null
                    : ToUtcOffset(notification.Reservation.StartTime),
                IsRead = notification.IsRead,
                CreatedAt = ToUtcOffset(notification.CreatedAt)
            };
        }

        private static DateTimeOffset ToUtcOffset(DateTime value)
        {
            var utcValue = value.Kind == DateTimeKind.Utc
                ? value
                : DateTime.SpecifyKind(value, DateTimeKind.Utc);

            return new DateTimeOffset(utcValue);
        }
    }
}
