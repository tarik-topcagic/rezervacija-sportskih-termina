using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace SportsBookingAPI.Hubs
{
    [Authorize]
    public class SystemNotificationHub : Hub
    {
    }
}
