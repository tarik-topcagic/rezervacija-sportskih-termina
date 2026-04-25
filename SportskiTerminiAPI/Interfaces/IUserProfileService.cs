using Microsoft.AspNetCore.Http;
using SportskiTerminiAPI.DTOs;
using SportskiTerminiAPI.Services;

namespace SportskiTerminiAPI.Interfaces
{
    public interface IUserProfileService
    {
        Task<ServiceResult> UpdateProfileAsync(string userId, UpdateProfileDto updateProfileDto);
        Task<ServiceResult> UploadProfilePictureAsync(UpdateProfilePictureDto updateProfilePictureDto, string scheme, HostString host);
        Task<ServiceResult> DeleteProfilePictureAsync(string userId);
    }
}
