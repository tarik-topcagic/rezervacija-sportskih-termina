using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace SportskiTerminiAPI.Hubs
{
    [Authorize]
    public class SystemNotificationHub : Hub
    {
    }
}
