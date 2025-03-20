using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SportskiTerminiAPI.DTOs;
using SportskiTerminiAPI.Interfaces;
using SportskiTerminiAPI.Models;
using System.Security.Claims;

namespace SportskiTerminiAPI.Controllers
{
    [Route("api/groups")]
    [ApiController]
    [Authorize]
    public class GroupController : ControllerBase
    {
        private readonly IGroupRepository _groupRepository;
        public GroupController(IGroupRepository groupRepository)
        {
            _groupRepository = groupRepository;
        }

        [HttpPost("create")]
        public async Task<IActionResult> CreateGroup([FromBody] CreateGroupDto groupDto)
        {
            var userId = User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
                return Unauthorized();

            var group = new Group
            {
                Name = groupDto.Name,
                Description = groupDto.Description,
                AdminId = userId,
                ImageUrl = groupDto.ImageUrl ?? "default-group.png"
            };

            var createdGroup = await _groupRepository.CreateGroupAsync(group);

            var membership = new GroupMembership
            {
                GroupId = createdGroup.Id,
                UserId = userId,
                Status = MembershipStatus.Accepted
            };

            return Ok(createdGroup);
        }

        [HttpPut("{groupId}/update")]
        public async Task<IActionResult> UpdateGroup(int groupId, [FromBody] UpdateGroupDto updateGroupDto)
        {
            var userId = User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
                return Unauthorized();

            var group = await _groupRepository.GetGroupByIdAsync(groupId);
            if (group == null)
                return NotFound("Group not found");

            if (group.AdminId != userId)
                return Forbid("Only admin can update the group");

            group.Name = updateGroupDto.Name;
            group.Description = updateGroupDto.Description;

            var updatedGroup = await _groupRepository.UpdateGroupAsync(group);
            return Ok(updatedGroup);
        }


        [HttpPost("{groupId}/join-request")]
        public async Task <IActionResult> RequestToJoin(int groupId)
        {
            var userId = User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
                return Unauthorized();

            var group = await _groupRepository.GetGroupByIdAsync(groupId);
            if (group == null)
                return NotFound("Group not found");

            if (group.Memberships.Any(m => m.UserId == userId))
            {
                return BadRequest("You already have a pending request or are a member");
            }

            var membership = new GroupMembership
            {
                GroupId = groupId,
                UserId = userId,
                Status = MembershipStatus.Pending
            };

            await _groupRepository.AddMembershipAsync(membership);
            return Ok(new { message = "Join request sent." });
        }

        [HttpPost("{groupId}/invite")]
        public async Task<IActionResult> InviteMember(int groupId, [FromBody] InviteMemberDto inviteMemberDto)
        {
            var adminId = User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (adminId == null)
                return Unauthorized();

            var group = await _groupRepository.GetGroupByIdAsync(groupId);
            if (group == null)
                return NotFound("Group not found");

            if (group.AdminId != adminId)
                return Forbid("Only admin can send invitations");

            if (group.Memberships.Any(m => m.UserId == inviteMemberDto.UserId))
                return BadRequest("User is already a member or invitation already sent");

            var membership = new GroupMembership
            {
                GroupId = groupId,
                UserId = inviteMemberDto.UserId,
                Status = MembershipStatus.Invited
            };

            await _groupRepository.AddMembershipAsync(membership);
            return Ok(new { message = "Invitation sent" });
        }

        [HttpPost("respond-invite")]
        public async Task<IActionResult> RespondInvite([FromBody] RespondInviteDto respondInviteDto)
        {
            var userId = User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
                return Unauthorized();

            var membership = await _groupRepository.GetMembershipByIdAsync(respondInviteDto.MembershipId);
            if (membership == null || membership.UserId != userId)
            {
                return NotFound("Membership not found");
            }

            if (respondInviteDto.Accept)
            {
                membership.Status = MembershipStatus.Accepted;
                await _groupRepository.UpdateMembershipAsync(membership);
                return Ok(new { message = "Invitation accepted" });
            } else
            {
                await _groupRepository.RemoveMembershipAsync(membership.Id);
                return Ok(new { message = "Invitation rejected and membership removed" });
            }
        }

        [HttpDelete("{groupId}/members/{memberId}")]
        public async Task<IActionResult> RemoveMember(int groupId, string memberId)
        {
            var userId = User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
                return Unauthorized();
            
            var group = await _groupRepository.GetGroupByIdAsync(groupId);
            if (group == null)
                return NotFound("Group not found");

            if (group.AdminId != userId && memberId != userId)
                return Forbid("You don't have permission to remove this member");

            var membership = group.Memberships.FirstOrDefault(m => m.UserId == memberId);
            if (membership == null)
                return NotFound("Membership not found");

            await _groupRepository.RemoveMembershipAsync(membership.Id);
            return Ok(new { message = "Member removed" });
        }

        [HttpPost("{groupId}/respond-request")]
        public async Task<IActionResult> RespondJoinRequest(int groupId, [FromBody] RespondJoinRequestDto respondJoinRequestDto)
        {
            var adminId = User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (adminId == null)
                return Unauthorized();

            var group = await _groupRepository.GetGroupByIdAsync(groupId);
            if (group == null)
                return NotFound("Group not found");

            if (group.AdminId != adminId)
                return Forbid("Only admin can respond to join requests");

            var membership = group.Memberships.FirstOrDefault(m => m.Id == respondJoinRequestDto.MembershipId && m.Status == MembershipStatus.Pending);
            if (membership == null)
                return NotFound("Join request not found");

            if (respondJoinRequestDto.Accept)
            {
                membership.Status = MembershipStatus.Accepted;
                await _groupRepository.UpdateMembershipAsync(membership);
                return Ok(new { message = "Join request accepted" });
            } else
            {
                await _groupRepository.RemoveMembershipAsync(membership.Id);
                return Ok(new { message = "Join request rejected and membership removed" });
            }
        }

        [HttpPost("{groupId}/upload-group-picture")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadGroupPicture(int groupId, [FromForm] UpdateGroupPictureDto groupPictureDto)
        {
            var userId = User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
                return Unauthorized();

            var group = await _groupRepository.GetGroupByIdAsync(groupId);
            if (group == null)
                return NotFound("Group not found");

            if (group.AdminId != userId)
                return Forbid("Only admin can change group picture");

            if (groupPictureDto.File ==  null || groupPictureDto.File.Length == 0)
            {
                return BadRequest("No picture selcted");
            }

            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "group");
            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            var fileName = Guid.NewGuid().ToString() + Path.GetExtension(groupPictureDto.File.FileName);
            var filePath = Path.Combine(uploadsFolder, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await groupPictureDto.File.CopyToAsync(stream);
            }

            var imageUrl = $"{Request.Scheme}://{Request.Host}/uploads/group/{fileName}";
            group.ImageUrl = imageUrl;
            await _groupRepository.UpdateGroupAsync(group);

            return Ok(new { imageUrl });
        }

        [HttpDelete("{groupId}/delete-group-picture")]
        public async Task<IActionResult> DeleteGroupPicture(int groupId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
                return Unauthorized();

            var group = await _groupRepository.GetGroupByIdAsync(groupId);
            if (group == null)
                return NotFound("Group not found");

            if (group.AdminId != userId)
                return Forbid("Only admin can remove group picture");

            if (!string.IsNullOrEmpty(group.ImageUrl) && group.ImageUrl.ToLower() != "default-group.png")
            {
                var uri = new Uri(group.ImageUrl);
                var fileName = Path.GetFileName(uri.AbsolutePath);
                var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwroot", "uploads", "group");

                if (System.IO.File.Exists(filePath))
                {
                    System.IO.File.Delete(filePath);
                }
            }

            group.ImageUrl = "default-group.png";
            await _groupRepository.UpdateGroupAsync(group);

            return Ok(new { message = "Group picture deleted" });
        }
    }
}
