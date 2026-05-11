using SportskiTerminiAPI.DTOs;
using SportskiTerminiAPI.Services;

namespace SportskiTerminiAPI.Interfaces
{
    public interface IUserSettingsService
    {
        Task<UserSettingsDto?> GetSettingsAsync(string userId);
        Task<ServiceResult> UpdateEmailNotificationsAsync(string userId, UpdateEmailNotificationsDto dto);
        Task<ServiceResult> UpdateLanguagePreferenceAsync(string userId, UpdateLanguagePreferenceDto dto);
        Task<ServiceResult> UpdateUsernameAsync(string userId, UpdateUsernameDto dto);
    }
}
