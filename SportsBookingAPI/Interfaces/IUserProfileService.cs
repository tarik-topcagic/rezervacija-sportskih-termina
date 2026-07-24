using Microsoft.AspNetCore.Http;
using SportsBookingAPI.DTOs;
using SportsBookingAPI.Services;

namespace SportsBookingAPI.Interfaces
{
    public interface IUserProfileService
    {
        Task<ServiceResult> UpdateProfileAsync(string userId, UpdateProfileDto updateProfileDto);
        Task<ServiceResult> UploadProfilePictureAsync(UpdateProfilePictureDto updateProfilePictureDto, string scheme, HostString host);
        Task<ServiceResult> DeleteProfilePictureAsync(string userId);
    }
}
