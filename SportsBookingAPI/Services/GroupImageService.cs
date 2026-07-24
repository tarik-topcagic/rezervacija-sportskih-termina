using Microsoft.AspNetCore.Http;
using SportsBookingAPI.DTOs;
using SportsBookingAPI.Interfaces;

namespace SportsBookingAPI.Services
{
    public class GroupImageService : IGroupImageService
    {
        private readonly IGroupRepository _groupRepository;

        public GroupImageService(IGroupRepository groupRepository)
        {
            _groupRepository = groupRepository;
        }

        public async Task<ServiceResult> UploadGroupPictureAsync(string userId, int groupId, UpdateGroupPictureDto groupPictureDto, string scheme, HostString host)
        {
            var group = await _groupRepository.GetGroupByIdAsync(groupId);
            if (group == null)
                return ServiceResult.NotFound("Group not found");

            if (group.AdminId != userId)
                return ServiceResult.Forbid("Only admin can change group picture");

            if (groupPictureDto.File == null || groupPictureDto.File.Length == 0)
                return ServiceResult.BadRequest("No picture selcted");

            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "group");
            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            var fileName = Guid.NewGuid().ToString() + Path.GetExtension(groupPictureDto.File.FileName);
            var filePath = Path.Combine(uploadsFolder, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await groupPictureDto.File.CopyToAsync(stream);
            }

            var imageUrl = $"{scheme}://{host}/uploads/group/{fileName}";
            group.ImageUrl = imageUrl;
            await _groupRepository.UpdateGroupAsync(group);

            return ServiceResult.Ok(new { imageUrl });
        }

        public async Task<ServiceResult> DeleteGroupPictureAsync(string userId, int groupId)
        {
            var group = await _groupRepository.GetGroupByIdAsync(groupId);
            if (group == null)
                return ServiceResult.NotFound("Group not found");

            if (group.AdminId != userId)
                return ServiceResult.Forbid("Only admin can remove group picture");

            if (!string.IsNullOrEmpty(group.ImageUrl) && group.ImageUrl.ToLower() != "default-group.png")
            {
                var uri = new Uri(group.ImageUrl);
                var fileName = Path.GetFileName(uri.AbsolutePath);
                var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "group");

                if (System.IO.File.Exists(filePath))
                {
                    System.IO.File.Delete(filePath);
                }
            }

            group.ImageUrl = "default-group.png";
            await _groupRepository.UpdateGroupAsync(group);

            return ServiceResult.Ok(new { message = "Group picture deleted" });
        }
    }
}
