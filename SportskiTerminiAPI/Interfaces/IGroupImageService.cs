using Microsoft.AspNetCore.Http;
using SportskiTerminiAPI.DTOs;
using SportskiTerminiAPI.Services;

namespace SportskiTerminiAPI.Interfaces
{
    public interface IGroupImageService
    {
        Task<ServiceResult> UploadGroupPictureAsync(string userId, int groupId, UpdateGroupPictureDto groupPictureDto, string scheme, HostString host);
        Task<ServiceResult> DeleteGroupPictureAsync(string userId, int groupId);
    }
}
