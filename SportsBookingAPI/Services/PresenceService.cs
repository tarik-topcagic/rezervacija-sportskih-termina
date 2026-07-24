using SportsBookingAPI.DTOs;
using SportsBookingAPI.Interfaces;
using System.Collections.Concurrent;

namespace SportsBookingAPI.Services
{
    public class PresenceService : IPresenceService
    {
        private readonly ConcurrentDictionary<string, HashSet<string>> _userConnections = new();

        public bool AddConnection(string userId, string connectionId)
        {
            var connections = _userConnections.GetOrAdd(userId, _ => new HashSet<string>());

            lock (connections)
            {
                var wasOffline = connections.Count == 0;
                connections.Add(connectionId);
                return wasOffline;
            }
        }

        public bool RemoveConnection(string userId, string connectionId)
        {
            if (!_userConnections.TryGetValue(userId, out var connections))
            {
                return false;
            }

            lock (connections)
            {
                connections.Remove(connectionId);

                if (connections.Count > 0)
                {
                    return false;
                }

                _userConnections.TryRemove(userId, out _);
                return true;
            }
        }

        public bool IsOnline(string userId)
        {
            if (!_userConnections.TryGetValue(userId, out var connections))
            {
                return false;
            }

            lock (connections)
            {
                return connections.Count > 0;
            }
        }

        public IReadOnlyList<string> GetOnlineUserIds(IEnumerable<string> userIds)
        {
            return userIds
                .Distinct()
                .Where(IsOnline)
                .ToList();
        }
    }
}
