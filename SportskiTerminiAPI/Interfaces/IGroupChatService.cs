using SportskiTerminiAPI.DTOs;
using SportskiTerminiAPI.Services;

namespace SportskiTerminiAPI.Interfaces
{
    public interface IGroupChatService
    {
        Task<ServiceResult> GetGroupMessagesAsync(string userId, int groupId);
        Task<ServiceResult> CreateGroupMessageAsync(string userId, int groupId, CreateGroupMessageDto createGroupMessageDto);
    }
}
