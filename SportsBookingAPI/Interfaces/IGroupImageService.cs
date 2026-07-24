using Microsoft.AspNetCore.Http;
using SportsBookingAPI.DTOs;
using SportsBookingAPI.Services;

namespace SportsBookingAPI.Interfaces
{
    public interface IGroupImageService
    {
        Task<ServiceResult> UploadGroupPictureAsync(string userId, int groupId, UpdateGroupPictureDto groupPictureDto, string scheme, HostString host);
        Task<ServiceResult> DeleteGroupPictureAsync(string userId, int groupId);
    }
}
