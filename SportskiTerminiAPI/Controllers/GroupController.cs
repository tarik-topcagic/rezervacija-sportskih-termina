using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SportskiTerminiAPI.Data;
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
        private readonly UserManager<AppUser> _userManager;
        private readonly ApplicationDBContext _context;
        public GroupController(IGroupRepository groupRepository, UserManager<AppUser> userManager, ApplicationDBContext context)
        {
            _groupRepository = groupRepository;
            _userManager = userManager;
            _context = context;
        }

        [HttpPost("create")]
        public async Task<IActionResult> CreateGroup([FromBody] CreateGroupDto groupDto)
        {
            var userId = User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
                return Unauthorized();

            if(!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var group = new Group
            {
                Name = groupDto.Name,
                Description = groupDto.Description,
                Grad = groupDto.Grad,
                KategorijaSporta = groupDto.KategorijaSporta,
                AdminId = userId,
                DateCreated = DateTime.UtcNow,
                ImageUrl = groupDto.ImageUrl ?? "default-group.png"
            };

            var createdGroup = await _groupRepository.CreateGroupAsync(group);

            var membership = new GroupMembership
            {
                GroupId = createdGroup.Id,
                UserId = userId,
                Status = MembershipStatus.Accepted,
                CreatedAt = DateTime.UtcNow,
                JoinedAt = DateTime.UtcNow,
                RespondedAt = DateTime.UtcNow
            };

            await _groupRepository.AddMembershipAsync(membership);

            return Ok(ToGroupDto(createdGroup));
        }

        [HttpPut("{groupId}/update")]
        public async Task<IActionResult> UpdateGroup(int groupId, [FromBody] UpdateGroupDto updateGroupDto)
        {
            var userId = User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
                return Unauthorized();

            if(!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var group = await _groupRepository.GetGroupByIdAsync(groupId);
            if (group == null)
                return NotFound("Group not found");

            if (group.AdminId != userId)
                return Forbid("Only admin can update the group");

            group.Name = updateGroupDto.Name;
            group.Description = updateGroupDto.Description;
            group.Grad = updateGroupDto.Grad;
            group.KategorijaSporta = updateGroupDto.KategorijaSporta;
            group.ImageUrl = updateGroupDto.GroupPictureUrl ?? "default-group.png";

            var updatedGroup = await _groupRepository.UpdateGroupAsync(group);
            return Ok(ToGroupDto(updatedGroup));
        }

        [HttpGet("{groupId:int}")]
        public async Task<IActionResult> GetGroupDetails(int groupId)
        {
            var userId = User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
                return Unauthorized();

            var group = await _groupRepository.GetGroupByIdAsync(groupId);
            if (group == null)
                return NotFound("Group not found");

            return Ok(ToGroupDetailsDto(group, userId));
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

            if (group.AdminId == userId)
            {
                return BadRequest("Group admin is already a member");
            }

            var membership = group.Memberships.FirstOrDefault(m => m.UserId == userId);
            if (membership != null && membership.Status != MembershipStatus.Declined)
            {
                return BadRequest("You already have an active membership, invitation, or join request");
            }

            if (membership == null)
            {
                membership = new GroupMembership
                {
                    GroupId = groupId,
                    UserId = userId,
                    Status = MembershipStatus.PendingJoinRequest,
                    CreatedAt = DateTime.UtcNow,
                    RespondedAt = null
                };

                await _groupRepository.AddMembershipAsync(membership);
            }
            else
            {
                membership.Status = MembershipStatus.PendingJoinRequest;
                membership.CreatedAt = DateTime.UtcNow;
                membership.RespondedAt = null;

                await _groupRepository.UpdateMembershipAsync(membership);
            }

            _context.Notifications.Add(new AppNotification
            {
                UserId = group.AdminId,
                ActorUserId = userId,
                GroupId = groupId,
                MembershipId = membership.Id,
                Type = AppNotificationType.GroupJoinRequestReceived,
                CreatedAt = DateTime.UtcNow
            });
            await _context.SaveChangesAsync();

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

            var invitedUser = await _userManager.FindByIdAsync(inviteMemberDto.UserId);
            if (invitedUser == null)
                return NotFound("User not found");

            if (inviteMemberDto.UserId == adminId)
                return BadRequest("Group admin is already a member");

            var membership = group.Memberships.FirstOrDefault(m => m.UserId == inviteMemberDto.UserId);
            if (membership != null && membership.Status != MembershipStatus.Declined)
            {
                return BadRequest("User already has an active membership, invitation, or join request");
            }

            if (membership == null)
            {
                membership = new GroupMembership
                {
                    GroupId = groupId,
                    UserId = inviteMemberDto.UserId,
                    Status = MembershipStatus.PendingInvitation,
                    CreatedAt = DateTime.UtcNow,
                    RespondedAt = null
                };

                await _groupRepository.AddMembershipAsync(membership);
            }
            else
            {
                membership.Status = MembershipStatus.PendingInvitation;
                membership.CreatedAt = DateTime.UtcNow;
                membership.RespondedAt = null;

                await _groupRepository.UpdateMembershipAsync(membership);
            }

            _context.Notifications.Add(new AppNotification
            {
                UserId = inviteMemberDto.UserId,
                ActorUserId = adminId,
                GroupId = groupId,
                MembershipId = membership.Id,
                Type = AppNotificationType.GroupInvitationReceived,
                CreatedAt = DateTime.UtcNow
            });
            await _context.SaveChangesAsync();

            return Ok(new { message = "Invitation sent" });
        }

        [HttpDelete("{groupId}/invitations/{userId}")]
        public async Task<IActionResult> CancelInvitation(int groupId, string userId)
        {
            var adminId = User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (adminId == null)
                return Unauthorized();

            var group = await _groupRepository.GetGroupByIdAsync(groupId);
            if (group == null)
                return NotFound("Group not found");

            if (group.AdminId != adminId)
                return Forbid("Only admin can cancel invitations");

            var membership = group.Memberships.FirstOrDefault(m => m.UserId == userId && m.Status == MembershipStatus.PendingInvitation);
            if (membership == null)
                return NotFound("Pending invitation not found");

            var notifications = await _context.Notifications
                .Where(n => n.Type == AppNotificationType.GroupInvitationReceived
                    && n.UserId == userId
                    && n.GroupId == groupId
                    && n.MembershipId == membership.Id)
                .ToListAsync();

            _context.Notifications.RemoveRange(notifications);
            await _context.SaveChangesAsync();

            await _groupRepository.RemoveMembershipAsync(membership.Id);
            return Ok(new { message = "Invitation cancelled" });
        }

        [HttpPost("respond-invite")]
        public async Task<IActionResult> RespondInvite([FromBody] RespondInviteDto respondInviteDto)
        {
            var userId = User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
                return Unauthorized();

            var membership = await _groupRepository.GetMembershipByIdAsync(respondInviteDto.MembershipId);
            if (membership == null || membership.UserId != userId || membership.Status != MembershipStatus.PendingInvitation)
            {
                return NotFound("Pending invitation not found");
            }

            if (respondInviteDto.Accept)
            {
                membership.Status = MembershipStatus.Accepted;
                membership.JoinedAt = DateTime.UtcNow;
                membership.RespondedAt = DateTime.UtcNow;
                await _groupRepository.UpdateMembershipAsync(membership);
                await MarkInvitationNotificationsAsReadAsync(membership.Id, userId);

                if (!string.IsNullOrWhiteSpace(membership.group?.AdminId))
                {
                    _context.Notifications.Add(new AppNotification
                    {
                        UserId = membership.group.AdminId,
                        ActorUserId = userId,
                        GroupId = membership.GroupId,
                        MembershipId = membership.Id,
                        Type = AppNotificationType.GroupInvitationAccepted,
                        CreatedAt = DateTime.UtcNow
                    });
                    await _context.SaveChangesAsync();
                }

                return Ok(new { message = "Invitation accepted" });
            } else
            {
                membership.Status = MembershipStatus.Declined;
                membership.RespondedAt = DateTime.UtcNow;
                await _groupRepository.UpdateMembershipAsync(membership);
                await MarkInvitationNotificationsAsReadAsync(membership.Id, userId);
                return Ok(new { message = "Invitation declined" });
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

            if (memberId == group.AdminId)
                return BadRequest("Group admin cannot be removed from the group");

            if (memberId != userId && group.AdminId != userId)
                return Forbid("Only admin can remove other members");

            var membership = group.Memberships.FirstOrDefault(m => m.UserId == memberId && m.Status == MembershipStatus.Accepted);
            if (membership == null)
                return NotFound("Membership not found");

            await _groupRepository.RemoveMembershipAsync(membership.Id);
            return Ok(new { message = "Member removed" });
        }

        [HttpDelete("{groupId}/join-request")]
        public async Task<IActionResult> CancelJoinRequest(int groupId)
        {
            var userId = User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
                return Unauthorized();

            var group = await _groupRepository.GetGroupByIdAsync(groupId);
            if (group == null)
                return NotFound("Group not found");

            var membership = group.Memberships.FirstOrDefault(m => m.UserId == userId && m.Status == MembershipStatus.PendingJoinRequest);
            if (membership == null)
                return NotFound("Pending join request not found");

            var joinRequestNotifications = await _context.Notifications
                .Where(n => n.Type == AppNotificationType.GroupJoinRequestReceived
                    && n.GroupId == groupId
                    && n.MembershipId == membership.Id
                    && n.UserId == group.AdminId
                    && n.ActorUserId == userId)
                .ToListAsync();

            _context.Notifications.RemoveRange(joinRequestNotifications);
            await _groupRepository.RemoveMembershipAsync(membership.Id);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Join request cancelled" });
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

            var membership = group.Memberships.FirstOrDefault(m => m.Id == respondJoinRequestDto.MembershipId && m.Status == MembershipStatus.PendingJoinRequest);
            if (membership == null)
                return NotFound("Join request not found");

            if (respondJoinRequestDto.Accept)
            {
                membership.Status = MembershipStatus.Accepted;
                membership.JoinedAt = DateTime.UtcNow;
                membership.RespondedAt = DateTime.UtcNow;
                await _groupRepository.UpdateMembershipAsync(membership);

                _context.Notifications.Add(new AppNotification
                {
                    UserId = membership.UserId,
                    ActorUserId = adminId,
                    GroupId = groupId,
                    MembershipId = membership.Id,
                    Type = AppNotificationType.GroupJoinRequestAccepted,
                    CreatedAt = DateTime.UtcNow
                });
                await _context.SaveChangesAsync();

                return Ok(new { message = "Join request accepted" });
            } else
            {
                membership.Status = MembershipStatus.Declined;
                membership.RespondedAt = DateTime.UtcNow;
                await _groupRepository.UpdateMembershipAsync(membership);
                return Ok(new { message = "Join request declined" });
            }
        }

        [HttpGet("admin")]
        public async Task<IActionResult> GetMyGroups()
        {
            var userId = User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
                return Unauthorized();

            var groups = await _groupRepository.GetGroupsByAdminAsync(userId);
            var groupDtos = groups.Select(g => new GroupDto
            {
                Id = g.Id,
                Name = g.Name,
                Description = g.Description,
                Grad = g.Grad,
                KategorijaSporta = g.KategorijaSporta,
                AdminId = g.AdminId,
                DateCreated = g.DateCreated,
                ImageUrl = g.ImageUrl,
                MembersCount = GetVisibleMembersCount(g)
            });

            return Ok(groupDtos);
        }

        [HttpGet("admin/membership-status/{targetUserId}")]
        public async Task<IActionResult> GetMembershipStatusForAdminGroups(string targetUserId)
        {
            var adminId = User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (adminId == null)
                return Unauthorized();

            var targetUser = await _userManager.FindByIdAsync(targetUserId);
            if (targetUser == null)
                return NotFound("User not found");

            var groups = await _groupRepository.GetGroupsByAdminAsync(adminId);
            var statuses = groups
                .SelectMany(group => group.Memberships
                    .Where(membership => membership.UserId == targetUserId)
                    .Select(membership => new GroupMembershipStateDto
                    {
                        GroupId = group.Id,
                        UserId = membership.UserId,
                        MembershipId = membership.Id,
                        Status = membership.Status
                    }));

            return Ok(statuses);
        }

        [HttpGet("{groupId}/join-requests")]
        public async Task<IActionResult> GetPendingJoinRequests(int groupId)
        {
            var adminId = User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (adminId == null)
                return Unauthorized();

            var group = await _groupRepository.GetGroupByIdAsync(groupId);
            if (group == null)
                return NotFound("Group not found");

            if (group.AdminId != adminId)
                return Forbid("Only admin can view join requests");

            var requests = group.Memberships
                .Where(m => m.Status == MembershipStatus.PendingJoinRequest)
                .Select(ToMembershipDto);

            return Ok(requests);
        }

        [HttpGet("{groupId}/memberships")]
        public async Task<IActionResult> GetGroupMemberships(int groupId)
        {
            var adminId = User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (adminId == null)
                return Unauthorized();

            var group = await _groupRepository.GetGroupByIdAsync(groupId);
            if (group == null)
                return NotFound("Group not found");

            if (group.AdminId != adminId)
                return Forbid("Only admin can view group memberships");

            var memberships = group.Memberships.Select(ToMembershipDto);

            return Ok(memberships);
        }

        [HttpGet("invitations")]
        public async Task<IActionResult> GetMyPendingInvitations()
        {
            var userId = User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
                return Unauthorized();

            var invitations = (await _groupRepository.GetMembershipsForUserAsync(userId))
                .Where(m => m.Status == MembershipStatus.PendingInvitation)
                .Select(ToMembershipDto);

            return Ok(invitations);
        }

        [HttpGet("membership")]
        public async Task<IActionResult> GetMemberGroups()
        {
            var userId = User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
                return Unauthorized();

            var groups = await _groupRepository.GetMemberGroupsAsync(userId);
            var groupDtos = groups.Select(g => new GroupDto
            {
                Id = g.Id,
                Name = g.Name,
                Description = g.Description,
                Grad = g.Grad,
                KategorijaSporta = g.KategorijaSporta,
                AdminId = g.AdminId,
                DateCreated = g.DateCreated,
                ImageUrl = g.ImageUrl,
                MembersCount = GetVisibleMembersCount(g)
            });

            return Ok(groupDtos);
        }

        [HttpGet("search-groups")]
        public async Task<IActionResult> SearchGroups([FromQuery] string? query)
        {
            var userId = User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
                return Unauthorized();

            IEnumerable<GroupDto> groups;

            if(string.IsNullOrWhiteSpace(query))
            {
                groups = await _groupRepository.GetPublicGroupsAsync(userId);
            }
            else
            {
                groups = await _groupRepository.SearchGroupsAsync(query, userId);
            }

            return Ok(groups);
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

        private static GroupDto ToGroupDto(Group group)
        {
            return new GroupDto
            {
                Id = group.Id,
                Name = group.Name,
                Description = group.Description,
                Grad = group.Grad,
                KategorijaSporta = group.KategorijaSporta,
                AdminId = group.AdminId,
                DateCreated = group.DateCreated,
                ImageUrl = group.ImageUrl,
                MembersCount = GetVisibleMembersCount(group)
            };
        }

        private static GroupDetailsDto ToGroupDetailsDto(Group group, string currentUserId)
        {
            var memberships = group.Memberships ?? new List<GroupMembership>();
            var acceptedMembersCount = memberships.Count(m => m.Status == MembershipStatus.Accepted);
            var adminHasAcceptedMembership = memberships.Any(m => m.UserId == group.AdminId && m.Status == MembershipStatus.Accepted);
            var isAdmin = group.AdminId == currentUserId;
            var isAcceptedMember = memberships.Any(m => m.UserId == currentUserId && m.Status == MembershipStatus.Accepted);
            var pendingInvitation = memberships.FirstOrDefault(m => m.UserId == currentUserId && m.Status == MembershipStatus.PendingInvitation);
            var acceptedMembers = memberships
                .Where(m => m.Status == MembershipStatus.Accepted && m.User != null)
                .Select(m => new GroupMemberDto
                {
                    UserId = m.UserId,
                    Username = m.User?.UserName ?? string.Empty,
                    DisplayName = !string.IsNullOrWhiteSpace(m.User?.FullName)
                        ? m.User.FullName
                        : m.User?.UserName ?? string.Empty,
                    ProfilePictureUrl = m.User?.ProfilePictureUrl ?? "default-profile.png",
                    IsAdmin = m.UserId == group.AdminId
                })
                .ToList();

            if (!acceptedMembers.Any(m => m.UserId == group.AdminId) && group.Admin != null)
            {
                acceptedMembers.Add(new GroupMemberDto
                {
                    UserId = group.AdminId,
                    Username = group.Admin.UserName ?? string.Empty,
                    DisplayName = !string.IsNullOrWhiteSpace(group.Admin.FullName)
                        ? group.Admin.FullName
                        : group.Admin.UserName ?? string.Empty,
                    ProfilePictureUrl = group.Admin.ProfilePictureUrl,
                    IsAdmin = true
                });
            }

            acceptedMembers = acceptedMembers
                .OrderByDescending(member => member.IsAdmin)
                .ThenBy(member => member.DisplayName)
                .ToList();

            return new GroupDetailsDto
            {
                Id = group.Id,
                Name = group.Name,
                Description = group.Description,
                Grad = group.Grad,
                KategorijaSporta = group.KategorijaSporta,
                ImageUrl = group.ImageUrl,
                AdminDisplayName = !string.IsNullOrWhiteSpace(group.Admin?.FullName)
                    ? group.Admin.FullName
                    : group.Admin?.UserName ?? string.Empty,
                CurrentUserId = currentUserId,
                DateCreated = group.DateCreated,
                MembersCount = acceptedMembersCount + (adminHasAcceptedMembership ? 0 : 1),
                IsAdmin = isAdmin,
                IsMember = isAdmin || isAcceptedMember,
                HasPendingJoinRequest = memberships.Any(m => m.UserId == currentUserId && m.Status == MembershipStatus.PendingJoinRequest),
                HasPendingInvitation = pendingInvitation != null,
                PendingInvitationMembershipId = pendingInvitation?.Id,
                Members = acceptedMembers
            };
        }

        private static GroupMembershipDto ToMembershipDto(GroupMembership membership)
        {
            return new GroupMembershipDto
            {
                Id = membership.Id,
                GroupId = membership.GroupId,
                UserId = membership.UserId,
                Username = membership.User?.UserName,
                FullName = membership.User?.FullName,
                Status = membership.Status,
                CreatedAt = membership.CreatedAt,
                JoinedAt = membership.JoinedAt,
                RespondedAt = membership.RespondedAt
            };
        }

        private static int GetVisibleMembersCount(Group group)
        {
            var memberships = group.Memberships ?? new List<GroupMembership>();
            var acceptedMembersCount = memberships.Count(m => m.Status == MembershipStatus.Accepted);
            var adminHasAcceptedMembership = memberships.Any(m => m.UserId == group.AdminId && m.Status == MembershipStatus.Accepted);

            return acceptedMembersCount + (adminHasAcceptedMembership ? 0 : 1);
        }

        private async Task MarkInvitationNotificationsAsReadAsync(int membershipId, string userId)
        {
            var notifications = await _context.Notifications
                .Where(n => n.Type == AppNotificationType.GroupInvitationReceived
                    && n.UserId == userId
                    && n.MembershipId == membershipId)
                .ToListAsync();

            foreach (var notification in notifications)
            {
                notification.IsRead = true;
                notification.ReadAt = DateTime.UtcNow;
            }

            if (notifications.Any())
            {
                await _context.SaveChangesAsync();
            }
        }
    }
}
